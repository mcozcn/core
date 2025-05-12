
import { useQuery } from "@tanstack/react-query";
import { getServiceSales, getServices } from "@/utils/localStorage";
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

const TopSellingServices = () => {
  const [period, setPeriod] = useState("30"); // Default 30 days
  
  const { data: serviceSales = [] } = useQuery({
    queryKey: ['serviceSales'],
    queryFn: getServiceSales,
  });

  // Filter sales by period
  const filterSales = () => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - parseInt(period));
    
    return serviceSales.filter(sale => new Date(sale.saleDate) >= cutoffDate);
  };

  const filteredSales = filterSales();

  // Compute service sales statistics
  const getServiceStats = () => {
    const stats = new Map();
    
    filteredSales.forEach(sale => {
      if (!stats.has(sale.serviceId)) {
        stats.set(sale.serviceId, {
          serviceId: sale.serviceId,
          serviceName: sale.serviceName,
          count: 0,
          revenue: 0
        });
      }
      
      const service = stats.get(sale.serviceId);
      service.count += 1;
      service.revenue += sale.price;
    });
    
    return Array.from(stats.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 10); // Top 10
  };

  const topServices = getServiceStats();

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold">En Çok Satan Hizmetler</h3>
        
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Son 7 Gün</SelectItem>
            <SelectItem value="30">Son 30 Gün</SelectItem>
            <SelectItem value="90">Son 3 Ay</SelectItem>
            <SelectItem value="365">Son 1 Yıl</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Hizmet</TableHead>
            <TableHead className="text-right">Satış Adeti</TableHead>
            <TableHead className="text-right">Toplam Gelir</TableHead>
            <TableHead className="text-right">Ortalama Fiyat</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {topServices.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                Bu dönem için hizmet verisi bulunamadı.
              </TableCell>
            </TableRow>
          ) : (
            topServices.map((item) => {
              const avgPrice = item.count > 0 ? item.revenue / item.count : 0;
              
              return (
                <TableRow key={item.serviceId}>
                  <TableCell>{item.serviceName}</TableCell>
                  <TableCell className="text-right">{item.count}</TableCell>
                  <TableCell className="text-right">₺{item.revenue.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</TableCell>
                  <TableCell className="text-right">₺{avgPrice.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </Card>
  );
};

export default TopSellingServices;
