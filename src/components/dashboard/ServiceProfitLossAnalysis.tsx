import { useQuery } from "@tanstack/react-query";
import { getServiceSales, getCosts } from "@/utils/localStorage";
import ProfitLossCard from "./ProfitLossCard";

const ServiceProfitLossAnalysis = () => {
  const { data: serviceSales = [] } = useQuery({
    queryKey: ['serviceSales'],
    queryFn: getServiceSales,
  });

  const { data: costs = [] } = useQuery({
    queryKey: ['costs'],
    queryFn: getCosts,
  });

  const calculateProfitLoss = (days: number) => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const periodSales = serviceSales.filter(sale => 
      new Date(sale.saleDate) >= cutoffDate
    );

    const periodCosts = costs.filter(cost => 
      new Date(cost.date) >= cutoffDate
    );

    const totalSales = periodSales.reduce((sum, sale) => sum + sale.price, 0);
    const totalAdditionalCosts = periodCosts.reduce((sum, cost) => sum + cost.amount, 0);

    return {
      sales: totalSales,
      costs: totalAdditionalCosts,
      profit: totalSales - totalAdditionalCosts
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
    <div className="space-y-4">
      <h2 className="text-xl font-semibold mb-4">Hizmet Kar/Zarar Analizi</h2>
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
    </div>
  );
};

export default ServiceProfitLossAnalysis;