
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { 
  getSales, 
  getServiceSales, 
  getUsers 
} from "@/utils/localStorage";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatCurrency } from "@/utils/format";
import { Sale, ServiceSale, User } from "@/utils/storage/types";

const CommissionReport = () => {
  const [period, setPeriod] = useState("30"); // Default 30 days
  const [staffFilter, setStaffFilter] = useState("all");
  
  // Get sales and service sales based on the selected period
  const { data: sales = [] } = useQuery({
    queryKey: ['sales'],
    queryFn: getSales,
  });

  const { data: serviceSales = [] } = useQuery({
    queryKey: ['serviceSales'],
    queryFn: getServiceSales,
  });

  const { data: staff = [] } = useQuery({
    queryKey: ['users'],
    queryFn: getUsers,
  });

  // Filter sales and service sales by period
  const filterByPeriod = (items: (Sale | ServiceSale)[]) => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - parseInt(period));
    
    return items.filter(item => {
      // Only include items with staff information
      if (!item.staffId || !item.staffName) return false;
      
      // Filter by selected staff if not "all"
      if (staffFilter !== "all" && item.staffId.toString() !== staffFilter) return false;
      
      // Filter by date
      return new Date(item.saleDate) >= cutoffDate;
    });
  };

  // Combine and process both types of sales
  const getCommissionData = () => {
    const productSales = filterByPeriod(sales).map(sale => ({
      ...sale,
      type: 'product' as const,
      itemName: sale.productName
    }));
    
    const servSales = filterByPeriod(serviceSales).map(sale => ({
      ...sale,
      type: 'service' as const,
      itemName: sale.serviceName
    }));
    
    return [...productSales, ...servSales]
      .sort((a, b) => new Date(b.saleDate).getTime() - new Date(a.saleDate).getTime());
  };

  // Calculate total commission by staff
  const calculateStaffTotals = () => {
    const staffCommissions: Record<number, {
      staffId: number,
      staffName: string,
      totalSales: number,
      totalCommission: number,
      count: number
    }> = {};

    const allSales = getCommissionData();
    
    allSales.forEach(sale => {
      if (!sale.staffId || !sale.commissionAmount) return;
      
      if (!staffCommissions[sale.staffId]) {
        staffCommissions[sale.staffId] = {
          staffId: sale.staffId,
          staffName: sale.staffName || "Bilinmeyen Personel",
          totalSales: 0,
          totalCommission: 0,
          count: 0
        };
      }
      
      const staffRecord = staffCommissions[sale.staffId];
      staffRecord.totalSales += sale.totalPrice || sale.price || 0;
      staffRecord.totalCommission += sale.commissionAmount || 0;
      staffRecord.count += 1;
    });
    
    return Object.values(staffCommissions);
  };

  const commissionItems = getCommissionData();
  const staffTotals = calculateStaffTotals();

  return (
    <Card className="p-6">
      <div className="flex flex-wrap justify-between items-center mb-6 gap-2">
        <h3 className="text-xl font-semibold">Personel Hakediş Raporu</h3>
        
        <div className="flex flex-wrap gap-2">
          <Select value={staffFilter} onValueChange={setStaffFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Personel" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm Personel</SelectItem>
              {staff.filter(user => user.role === 'staff').map((user) => (
                <SelectItem key={user.id} value={user.id.toString()}>
                  {user.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Dönem" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Son 7 Gün</SelectItem>
              <SelectItem value="30">Son 30 Gün</SelectItem>
              <SelectItem value="90">Son 3 Ay</SelectItem>
              <SelectItem value="365">Son 1 Yıl</SelectItem>
              <SelectItem value="3650">Tümü</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="space-y-6">
        {/* Özet Tablo */}
        <div>
          <h4 className="text-lg font-medium mb-2">Hakediş Özeti</h4>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Personel</TableHead>
                <TableHead className="text-right">İşlem Sayısı</TableHead>
                <TableHead className="text-right">Toplam Satış</TableHead>
                <TableHead className="text-right">Toplam Hakediş</TableHead>
                <TableHead className="text-right">Ortalama Hakediş Oranı</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {staffTotals.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-6">
                    Bu dönem için hakediş verisi bulunamadı.
                  </TableCell>
                </TableRow>
              ) : (
                staffTotals.map((record) => (
                  <TableRow key={record.staffId}>
                    <TableCell className="font-medium">{record.staffName}</TableCell>
                    <TableCell className="text-right">{record.count}</TableCell>
                    <TableCell className="text-right">{formatCurrency(record.totalSales)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(record.totalCommission)}</TableCell>
                    <TableCell className="text-right">
                      {record.totalSales > 0 
                        ? `%${((record.totalCommission / record.totalSales) * 100).toFixed(2)}` 
                        : "0%"}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        
        {/* Detay Tablo */}
        <div>
          <h4 className="text-lg font-medium mb-2">Hakediş Detayları</h4>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tarih</TableHead>
                <TableHead>Personel</TableHead>
                <TableHead>Müşteri</TableHead>
                <TableHead>İşlem</TableHead>
                <TableHead className="text-right">Tutar</TableHead>
                <TableHead className="text-right">Hakediş</TableHead>
                <TableHead className="text-right">Oran</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {commissionItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-6">
                    Bu dönem için hakediş detayı bulunamadı.
                  </TableCell>
                </TableRow>
              ) : (
                commissionItems.map((item) => {
                  const amount = 'totalPrice' in item ? item.totalPrice : item.price;
                  const commissionRate = item.commissionAmount && amount ? 
                    (item.commissionAmount / amount * 100).toFixed(2) : "0";
                  
                  return (
                    <TableRow key={`${item.type}-${item.id}`}>
                      <TableCell>{new Date(item.saleDate).toLocaleDateString('tr-TR')}</TableCell>
                      <TableCell>{item.staffName}</TableCell>
                      <TableCell>{item.customerName}</TableCell>
                      <TableCell>
                        <span className="inline-flex items-center">
                          <span className={`w-2 h-2 rounded-full mr-2 ${item.type === 'service' ? 'bg-blue-500' : 'bg-green-500'}`}></span>
                          {item.itemName}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">{formatCurrency(amount || 0)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(item.commissionAmount || 0)}</TableCell>
                      <TableCell className="text-right">%{commissionRate}</TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </Card>
  );
};

export default CommissionReport;
