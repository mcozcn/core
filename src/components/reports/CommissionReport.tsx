import { useState } from "react";
import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { getSales, getServiceSales } from "@/utils/storage";
import { getAllUsers } from "@/utils/auth";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { DateRange } from "react-day-picker";
import { addDays, isWithinInterval, format, startOfDay, endOfDay } from "date-fns";
import { formatCurrency } from "@/utils/format";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const CommissionReport = () => {
  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date(),
    to: addDays(new Date(), 30),
  });
  
  // Add staff selection state
  const [selectedStaffId, setSelectedStaffId] = useState<string>("all");

  const { data: sales = [] } = useQuery({
    queryKey: ['sales'],
    queryFn: () => getSales(),
  });

  const { data: serviceSales = [] } = useQuery({
    queryKey: ['serviceSales'],
    queryFn: () => getServiceSales(),
  });
  
  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: getAllUsers,
  });

  // Filter staff users
  const staffUsers = users.filter(user => user.role === 'staff');

  // Fix date filter to use precise day comparison
  const filterByDate = (saleDate: Date | string) => {
    if (!date?.from || !date?.to) return true;
    
    const saleDateObj = typeof saleDate === 'string' ? new Date(saleDate) : saleDate;
    
    // Set time to start of day for from date and end of day for to date
    const fromDate = startOfDay(date.from);
    const toDate = date.to ? endOfDay(date.to) : endOfDay(date.from);
    
    return isWithinInterval(saleDateObj, { 
      start: fromDate, 
      end: toDate
    });
  };

  // Filter sales by date range and selected staff
  const filteredSales = sales.filter(sale => {
    const passesDateFilter = filterByDate(sale.saleDate || sale.date);
    const passesStaffFilter = selectedStaffId === "all" || sale.staffId?.toString() === selectedStaffId;
    
    return passesDateFilter && passesStaffFilter;
  });

  const filteredServiceSales = serviceSales.filter(sale => {
    const passesDateFilter = filterByDate(sale.saleDate);
    const passesStaffFilter = selectedStaffId === "all" || sale.staffId?.toString() === selectedStaffId;
    
    return passesDateFilter && passesStaffFilter;
  });

  // Group commissions by staff
  const commissionsByStaff = new Map();
  
  // Add product sales commissions
  filteredSales.forEach(sale => {
    if (sale.staffId && sale.commissionAmount) {
      const staffId = sale.staffId;
      const staffName = sale.staffName || `Personel #${staffId}`;
      
      if (!commissionsByStaff.has(staffId)) {
        commissionsByStaff.set(staffId, {
          staffId,
          staffName,
          totalCommission: 0,
          sales: []
        });
      }
      
      const staffData = commissionsByStaff.get(staffId);
      staffData.totalCommission += sale.commissionAmount;
      staffData.sales.push({
        date: new Date(sale.saleDate || sale.date).toLocaleDateString(),
        itemName: sale.productName || 'Ürün Satışı',
        amount: sale.price || sale.total,
        commissionAmount: sale.commissionAmount,
        customerName: sale.customerName || 'Müşteri'
      });
    }
  });

  // Add service sales commissions
  filteredServiceSales.forEach(sale => {
    if (sale.staffId && sale.commissionAmount) {
      const staffId = sale.staffId;
      const staffName = sale.staffName || `Personel #${staffId}`;
      
      if (!commissionsByStaff.has(staffId)) {
        commissionsByStaff.set(staffId, {
          staffId,
          staffName,
          totalCommission: 0,
          sales: []
        });
      }
      
      const staffData = commissionsByStaff.get(staffId);
      staffData.totalCommission += sale.commissionAmount;
      staffData.sales.push({
        date: new Date(sale.saleDate).toLocaleDateString(),
        itemName: sale.serviceName || 'Hizmet Satışı',
        amount: sale.price,
        commissionAmount: sale.commissionAmount,
        customerName: sale.customerName || 'Müşteri'
      });
    }
  });

  const staffCommissionData = Array.from(commissionsByStaff.values());
  const totalCommissionAmount = staffCommissionData.reduce(
    (total, staff) => total + staff.totalCommission, 
    0
  );

  const formatDate = (date: Date) => {
    return format(date, 'dd/MM/yyyy');
  };

  return (
    <Card className="p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h3 className="text-xl font-semibold">Personel Hakediş Raporu</h3>
        <div className="flex flex-col sm:flex-row gap-3 mt-3 sm:mt-0">
          <Select value={selectedStaffId} onValueChange={setSelectedStaffId}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Personel Seçin" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm Personeller</SelectItem>
              {staffUsers.map((user) => (
                <SelectItem key={user.id} value={user.id.toString()}>
                  {user.displayName || user.username}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <DatePickerWithRange 
            date={date} 
            setDate={setDate} 
          />
        </div>
      </div>

      {staffCommissionData.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          Seçilen kriterlere uygun hakediş bilgisi bulunamadı.
        </div>
      ) : (
        <>
          <div className="mb-6 p-4 bg-accent/20 rounded-lg">
            <div className="flex justify-between">
              <span>Toplam Hakediş Tutarı:</span>
              <span className="font-bold">{formatCurrency(totalCommissionAmount)}</span>
            </div>
            {date?.from && (
              <div className="text-sm text-muted-foreground mt-2">
                {formatDate(date.from)} - {date.to ? formatDate(date.to) : formatDate(date.from)}
              </div>
            )}
          </div>
          
          <div className="space-y-6">
            {staffCommissionData.map(staffData => (
              <div key={staffData.staffId} className="border rounded-lg">
                <div className="p-4 bg-accent/10 flex justify-between items-center border-b">
                  <h4 className="font-medium">{staffData.staffName}</h4>
                  <span className="font-bold">{formatCurrency(staffData.totalCommission)}</span>
                </div>
                
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tarih</TableHead>
                      <TableHead>Müşteri</TableHead>
                      <TableHead>Ürün/Hizmet</TableHead>
                      <TableHead className="text-right">Tutar</TableHead>
                      <TableHead className="text-right">Hakediş</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {staffData.sales.map((sale, index) => (
                      <TableRow key={index}>
                        <TableCell>{sale.date}</TableCell>
                        <TableCell>{sale.customerName}</TableCell>
                        <TableCell>{sale.itemName}</TableCell>
                        <TableCell className="text-right">{formatCurrency(sale.amount)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(sale.commissionAmount)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ))}
          </div>
        </>
      )}
    </Card>
  );
};

export default CommissionReport;
