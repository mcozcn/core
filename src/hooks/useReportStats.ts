
import { useMemo } from 'react';
import { getSales, getServiceSales, getCosts } from "@/utils/storage";
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
    
    const uniqueCustomers = new Set();
    [...periodSales, ...periodServiceSales].forEach(sale => {
      if (sale.customerId) uniqueCustomers.add(sale.customerId);
    });
    
    // Fix: Ensure all values in the arithmetic operations are explicitly numbers
    const combinedSales = Number(totalSalesNum) + Number(totalServiceSalesNum);
    const profit = Number(combinedSales) - Number(totalCostsNum);
    
    return {
      totalSales: combinedSales,
      customerCount: uniqueCustomers.size,
      appointmentCount: periodServiceSales.length,
      netProfit: profit
    };
  };

  // Get top selling items - Fixed to properly type the count as number
  const getTopItems = (items: any[], count: number, nameKey: string): Array<{ name: string; count: number }> => {
    const itemCounts = items.reduce((acc, item) => {
      const name = item[nameKey];
      if (!name) return acc;
      acc[name] = (acc[name] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(itemCounts)
      .sort((a: [string, number], b: [string, number]) => b[1] - a[1])
      .slice(0, count)
      .map(([name, count]: [string, number]) => ({ name, count }));
  };

  // Memoize calculations for efficiency
  const weeklySummary = useMemo(() => calculateSummaryStats(7), [sales, serviceSales, costs]);
  const monthlySummary = useMemo(() => calculateSummaryStats(30), [sales, serviceSales, costs]);
  const topProducts = useMemo(() => getTopItems(sales, 3, 'productName'), [sales]);
  const topServices = useMemo(() => getTopItems(serviceSales, 3, 'serviceName'), [serviceSales]);

  return {
    weeklySummary,
    monthlySummary,
    topProducts,
    topServices
  };
};
