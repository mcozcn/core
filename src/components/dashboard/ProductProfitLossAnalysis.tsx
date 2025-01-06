import { useQuery } from "@tanstack/react-query";
import { getSales, getStock, getCosts } from "@/utils/localStorage";
import ProfitLossCard from "./ProfitLossCard";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";
import { DateRange } from "react-day-picker";
import { useState } from "react";
import { addDays } from "date-fns";

const ProductProfitLossAnalysis = () => {
  const [dateRange, setDateRange] = useState<DateRange>({
    from: new Date(),
    to: addDays(new Date(), 7)
  });

  const { data: sales = [] } = useQuery({
    queryKey: ['sales'],
    queryFn: getSales,
  });

  const { data: stock = [] } = useQuery({
    queryKey: ['stock'],
    queryFn: getStock,
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

    const periodSales = sales.filter(sale => {
      const saleDate = new Date(sale.saleDate);
      return saleDate >= cutoffDate && saleDate <= endDate;
    });

    const periodCosts = costs.filter(cost => {
      const costDate = new Date(cost.date);
      return costDate >= cutoffDate && costDate <= endDate;
    });

    const totalSales = periodSales.reduce((sum, sale) => sum + sale.totalPrice, 0);
    const totalProductCosts = periodSales.reduce((sum, sale) => {
      const product = stock.find(item => item.productId === sale.productId);
      return sum + (product?.cost || 0) * sale.quantity;
    }, 0);
    const totalAdditionalCosts = periodCosts.reduce((sum, cost) => sum + cost.amount, 0);

    return {
      sales: totalSales,
      costs: totalProductCosts + totalAdditionalCosts,
      profit: totalSales - (totalProductCosts + totalAdditionalCosts)
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
        <h2 className="text-xl font-semibold">Ürün Kar/Zarar Analizi</h2>
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

export default ProductProfitLossAnalysis;