
import { DateRange } from "react-day-picker";
import { isWithinInterval, startOfDay, endOfDay } from "date-fns";

export const useCommissionData = (sales: any[], serviceSales: any[], date: DateRange | undefined, selectedStaffId: string) => {
  // Filter by date range
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
      staffData.totalCommission += Number(sale.commissionAmount);
      staffData.sales.push({
        date: new Date(sale.saleDate || sale.date).toLocaleDateString(),
        itemName: sale.productName || 'Ürün Satışı',
        amount: Number(sale.price || sale.total),
        commissionAmount: Number(sale.commissionAmount),
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
      staffData.totalCommission += Number(sale.commissionAmount);
      staffData.sales.push({
        date: new Date(sale.saleDate).toLocaleDateString(),
        itemName: sale.serviceName || 'Hizmet Satışı',
        amount: Number(sale.price),
        commissionAmount: Number(sale.commissionAmount),
        customerName: sale.customerName || 'Müşteri'
      });
    }
  });

  const staffCommissionData = Array.from(commissionsByStaff.values());
  const totalCommissionAmount = staffCommissionData.reduce(
    (total, staff) => total + staff.totalCommission, 
    0
  );

  return {
    staffCommissionData,
    totalCommissionAmount,
    isEmpty: staffCommissionData.length === 0
  };
};
