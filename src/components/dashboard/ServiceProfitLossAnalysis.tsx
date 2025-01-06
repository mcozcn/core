import { useQuery } from "@tanstack/react-query";
import { getServiceSales, getCosts } from "@/utils/localStorage";
import ProfitLossCard from "./ProfitLossCard";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";
import { DateRange } from "react-day-picker";
import { useState } from "react";
import { addDays } from "date-fns";

const ServiceProfitLossAnalysis = () => {
  const [dateRange, setDateRange] = useState<DateRange>({
    from: new Date(),
    to: addDays(new Date(), 7)
  });

  const { data: serviceSales = [] } = useQuery({
    queryKey: ['serviceSales'],
    queryFn: getServiceSales,
  });

  const { data: costs = [] } = useQuery({
    queryKey: ['costs'],
    queryFn: getCosts,
  });

  const resetDateFilter = () => {
    setDateRange({
      from: new Date(),
      to: addDays(new Date(), 7)
    });
  };

  const calculateProfitLoss = (days: number) => {
    const cutoffDate = dateRange.from || new Date();
    const endDate = dateRange.to || addDays(cutoffDate, days);

    const periodSales = serviceSales.filter(sale => {
      const saleDate = new Date(sale.saleDate);
      return saleDate >= cutoffDate && saleDate <= endDate;
    });

    const periodCosts = costs.filter(cost => {
      const costDate = new Date(cost.date);
      return costDate >= cutoffDate && costDate <= endDate;
    });

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
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Hizmet Kar/Zarar Analizi</h2>
        <div className="flex items-center gap-4">
          <DatePickerWithRange date={dateRange} setDate={setDateRange} />
          <Button variant="outline" size="icon" onClick={resetDateFilter} title="Filtreyi Sıfırla">
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </div>
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