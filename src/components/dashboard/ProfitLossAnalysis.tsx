import { useQuery } from "@tanstack/react-query";
import { getSales, getStock } from "@/utils/localStorage";
import ProfitLossCard from "./ProfitLossCard";
import { Card } from "@/components/ui/card";

const ProfitLossAnalysis = () => {
  const { data: sales = [] } = useQuery({
    queryKey: ['sales'],
    queryFn: getSales,
  });

  const { data: stock = [] } = useQuery({
    queryKey: ['stock'],
    queryFn: getStock,
  });

  const calculateProfitLoss = (days: number) => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const periodSales = sales.filter(sale => 
      new Date(sale.saleDate) >= cutoffDate
    );

    const totalSales = periodSales.reduce((sum, sale) => sum + sale.totalPrice, 0);
    const totalCosts = periodSales.reduce((sum, sale) => {
      const product = stock.find(item => item.productId === sale.productId);
      return sum + (product?.cost || 0) * sale.quantity;
    }, 0);

    return {
      sales: totalSales,
      costs: totalCosts,
      profit: totalSales - totalCosts
    };
  };

  const periods = [
    { title: "Günlük", days: 1 },
    { title: "Haftalık", days: 7 },
    { title: "Aylık", days: 30 },
    { title: "3 Aylık", days: 90 },
    { title: "Yıllık", days: 365 },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {periods.map(period => {
        const stats = calculateProfitLoss(period.days);
        return (
          <ProfitLossCard
            key={period.title}
            title={period.title}
            {...stats}
          />
        );
      })}
    </div>
  );
};

export default ProfitLossAnalysis;