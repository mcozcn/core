
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { getSales, getServiceSales } from "@/utils/localStorage";
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
import { addDays, isWithinInterval, parseISO } from "date-fns";
import { formatCurrency } from "@/utils/format";

const CommissionReport = () => {
  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date(),
    to: addDays(new Date(), 30),
  });

  const { data: sales = [] } = useQuery({
    queryKey: ['sales'],
    queryFn: () => getSales(),
  });

  const { data: serviceSales = [] } = useQuery({
    queryKey: ['serviceSales'],
    queryFn: () => getServiceSales(),
  });

  // Filter sales by date range
  const filteredSales = sales.filter(sale => {
    if (!date?.from || !date?.to) return true;
    
    const saleDate = new Date(sale.saleDate || sale.date);
    return isWithinInterval(saleDate, { 
      start: date.from, 
      end: date.to || date.from 
    });
  });

  const filteredServiceSales = serviceSales.filter(sale => {
    if (!date?.from || !date?.to) return true;
    
    const saleDate = new Date(sale.saleDate);
    return isWithinInterval(saleDate, { 
      start: date.from, 
      end: date.to || date.from 
    });
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
        commissionAmount: sale.commissionAmount
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
        commissionAmount: sale.commissionAmount
      });
    }
  });

  const staffCommissionData = Array.from(commissionsByStaff.values());
  const totalCommissionAmount = staffCommissionData.reduce(
    (total, staff) => total + staff.totalCommission, 
    0
  );

  return (
    <Card className="p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h3 className="text-xl font-semibold">Personel Hakediş Raporu</h3>
        <DatePickerWithRange 
          className="mt-3 sm:mt-0"
          date={date} 
          setDate={setDate} 
        />
      </div>

      {staffCommissionData.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          Seçilen tarih aralığında hakediş bilgisi bulunamadı.
        </div>
      ) : (
        <>
          <div className="mb-6 p-4 bg-accent/20 rounded-lg">
            <div className="flex justify-between">
              <span>Toplam Hakediş Tutarı:</span>
              <span className="font-bold">{formatCurrency(totalCommissionAmount)}</span>
            </div>
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
                      <TableHead>Ürün/Hizmet</TableHead>
                      <TableHead className="text-right">Tutar</TableHead>
                      <TableHead className="text-right">Hakediş</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {staffData.sales.map((sale, index) => (
                      <TableRow key={index}>
                        <TableCell>{sale.date}</TableCell>
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
