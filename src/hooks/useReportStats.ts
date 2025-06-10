
import { useMemo } from 'react';
import { getSales, getServiceSales, getCosts, getAppointments, getCustomers } from "@/utils/localStorage";
import { useQuery } from "@tanstack/react-query";

export const useReportStats = () => {
  // Fetch all the necessary data
  const { data: sales = [] } = useQuery({
    queryKey: ['sales'],
    queryFn: getSales,
  });

  const { data: serviceSales = [] } = useQuery({
    queryKey: ['serviceSales'],
    queryFn: getServiceSales,
  });

  const { data: costs = [] } = useQuery({
    queryKey: ['costs'],
    queryFn: getCosts,
  });

  const { data: appointments = [] } = useQuery({
    queryKey: ['appointments'],
    queryFn: getAppointments,
  });

  const { data: customers = [] } = useQuery({
    queryKey: ['customers'],
    queryFn: getCustomers,
  });

  // Calculate summary statistics based on real data
  const calculateSummaryStats = (days: number) => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    const periodSales = sales.filter(sale => 
      new Date(sale.saleDate || sale.date) >= cutoffDate
    );
    
    const periodServiceSales = serviceSales.filter(sale => 
      new Date(sale.saleDate) >= cutoffDate
    );
    
    const periodCosts = costs.filter(cost => 
      new Date(cost.date) >= cutoffDate
    );
    
    const periodAppointments = appointments.filter(appointment => 
      new Date(appointment.date) >= cutoffDate
    );
    
    // Count unique customers from sales and service sales
    const uniqueCustomerIds = new Set();
    [...periodSales, ...periodServiceSales].forEach(sale => {
      if (sale.customerId) uniqueCustomerIds.add(sale.customerId);
    });
    
    // Safely convert all sales to numbers before summing
    const totalSalesNum: number = periodSales.reduce((sum: number, sale) => {
      const saleAmount = Number(sale.totalPrice || sale.total || 0);
      return sum + (isNaN(saleAmount) ? 0 : saleAmount);
    }, 0);
    
    // Safely convert all service sales to numbers before summing
    const totalServiceSalesNum: number = periodServiceSales.reduce((sum: number, sale) => {
      const serviceAmount = Number(sale.price || 0);
      return sum + (isNaN(serviceAmount) ? 0 : serviceAmount);
    }, 0);
    
    // Safely convert all costs to numbers before summing
    const totalCostsNum: number = periodCosts.reduce((sum: number, cost) => {
      const costAmount = Number(cost.amount || 0);
      return sum + (isNaN(costAmount) ? 0 : costAmount);
    }, 0);
    
    // Fix: Ensure all values in the arithmetic operations are explicitly numbers
    const combinedSales = Number(totalSalesNum) + Number(totalServiceSalesNum);
    const profit = Number(combinedSales) - Number(totalCostsNum);
    
    return {
      totalSales: combinedSales,
      customerCount: uniqueCustomerIds.size,
      appointmentCount: periodAppointments.length,
      netProfit: profit
    };
  };

  // Get top selling items - Fixed to properly type the count as number
  const getTopProducts = (count: number): Array<{ name: string; count: number }> => {
    const productCounts = sales.reduce((acc, sale) => {
      const name = sale.productName || sale.stockItemName;
      if (!name) return acc;
      acc[name] = (acc[name] || 0) + (sale.quantity || 1);
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(productCounts)
      .sort((a: [string, number], b: [string, number]) => b[1] - a[1])
      .slice(0, count)
      .map(([name, count]: [string, number]) => ({ name, count }));
  };

  const getTopServices = (count: number): Array<{ name: string; count: number }> => {
    const serviceCounts = serviceSales.reduce((acc, sale) => {
      const name = sale.serviceName;
      if (!name) return acc;
      acc[name] = (acc[name] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(serviceCounts)
      .sort((a: [string, number], b: [string, number]) => b[1] - a[1])
      .slice(0, count)
      .map(([name, count]: [string, number]) => ({ name, count }));
  };

  // Memoize calculations for efficiency
  const weeklySummary = useMemo(() => calculateSummaryStats(7), [sales, serviceSales, costs, appointments]);
  const monthlySummary = useMemo(() => calculateSummaryStats(30), [sales, serviceSales, costs, appointments]);
  const topProducts = useMemo(() => getTopProducts(3), [sales]);
  const topServices = useMemo(() => getTopServices(3), [serviceSales]);

  return {
    weeklySummary,
    monthlySummary,
    topProducts,
    topServices
  };
};
