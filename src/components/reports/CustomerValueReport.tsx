
import { useQuery } from "@tanstack/react-query";
import { getCustomers, getSales, getServiceSales } from "@/utils/localStorage";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const CustomerValueReport = () => {
  const [period, setPeriod] = useState("180"); // Default 6 months
  
  const { data: customers = [] } = useQuery({
    queryKey: ['customers'],
    queryFn: getCustomers,
  });

  const { data: sales = [] } = useQuery({
    queryKey: ['sales'],
    queryFn: getSales,
  });

  const { data: serviceSales = [] } = useQuery({
    queryKey: ['serviceSales'],
    queryFn: getServiceSales,
  });

  // Filter sales by period
  const filterSalesByPeriod = (cutoffDate: Date) => {
    const filteredProductSales = sales.filter(sale => 
      new Date(sale.saleDate) >= cutoffDate
    );
    
    const filteredServiceSales = serviceSales.filter(sale => 
      new Date(sale.saleDate) >= cutoffDate
    );
    
    return { filteredProductSales, filteredServiceSales };
  };

  // Calculate customer statistics
  const getCustomerStats = () => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - parseInt(period));
    
    const { filteredProductSales, filteredServiceSales } = filterSalesByPeriod(cutoffDate);
    
    const stats = new Map();
    
    // Process product sales
    filteredProductSales.forEach(sale => {
      const customer = customers.find(c => c.name === sale.customerName && c.phone === sale.customerPhone);
      if (!customer) return;
      
      if (!stats.has(customer.id)) {
        stats.set(customer.id, {
          customerId: customer.id,
          customerName: customer.name,
          productPurchases: 0,
          servicePurchases: 0,
          totalSpent: 0,
          lastVisit: new Date(0) // Initialize with oldest possible date
        });
      }
      
      const customerStat = stats.get(customer.id);
      customerStat.productPurchases += 1;
      customerStat.totalSpent += sale.totalPrice;
      
      const saleDate = new Date(sale.saleDate);
      if (saleDate > customerStat.lastVisit) {
        customerStat.lastVisit = saleDate;
      }
    });
    
    // Process service sales
    filteredServiceSales.forEach(sale => {
      const customer = customers.find(c => c.name === sale.customerName && c.phone === sale.customerPhone);
      if (!customer) return;
      
      if (!stats.has(customer.id)) {
        stats.set(customer.id, {
          customerId: customer.id,
          customerName: customer.name,
          productPurchases: 0,
          servicePurchases: 0,
          totalSpent: 0,
          lastVisit: new Date(0)
        });
      }
      
      const customerStat = stats.get(customer.id);
      customerStat.servicePurchases += 1;
      customerStat.totalSpent += sale.price;
      
      const saleDate = new Date(sale.saleDate);
      if (saleDate > customerStat.lastVisit) {
        customerStat.lastVisit = saleDate;
      }
    });
    
    return Array.from(stats.values())
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 15); // Top 15 customers
  };

  const topCustomers = getCustomerStats();

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold">En Değerli Müşteriler</h3>
        
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="30">Son 1 Ay</SelectItem>
            <SelectItem value="90">Son 3 Ay</SelectItem>
            <SelectItem value="180">Son 6 Ay</SelectItem>
            <SelectItem value="365">Son 1 Yıl</SelectItem>
            <SelectItem value="730">Son 2 Yıl</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Müşteri</TableHead>
            <TableHead className="text-right">Toplam Harcama</TableHead>
            <TableHead className="text-right">Ürün Alımları</TableHead>
            <TableHead className="text-right">Hizmet Alımları</TableHead>
            <TableHead className="text-right">Toplam İşlem</TableHead>
            <TableHead>Son Ziyaret</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {topCustomers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                Bu dönem için müşteri verisi bulunamadı.
              </TableCell>
            </TableRow>
          ) : (
            topCustomers.map((customer) => (
              <TableRow key={customer.customerId}>
                <TableCell>{customer.customerName}</TableCell>
                <TableCell className="text-right">₺{customer.totalSpent.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</TableCell>
                <TableCell className="text-right">{customer.productPurchases}</TableCell>
                <TableCell className="text-right">{customer.servicePurchases}</TableCell>
                <TableCell className="text-right">{customer.productPurchases + customer.servicePurchases}</TableCell>
                <TableCell>{new Date(customer.lastVisit).toLocaleDateString('tr-TR')}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </Card>
  );
};

export default CustomerValueReport;
