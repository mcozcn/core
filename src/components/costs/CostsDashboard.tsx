
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { getCosts } from "@/utils/storage";
import { DollarSign, TrendingUp, TrendingDown, Calculator, Tag } from "lucide-react";
import { DateRange } from "react-day-picker";

interface CostsDashboardProps {
  dateRange?: DateRange;
}

const CostsDashboard = ({ dateRange }: CostsDashboardProps) => {
  const { data: costs = [] } = useQuery({
    queryKey: ['costs'],
    queryFn: getCosts,
  });

  // Filter costs by date range
  const filteredCosts = costs.filter(cost => {
    if (!dateRange?.from || !dateRange?.to) return true;
    const costDate = new Date(cost.date);
    return costDate >= dateRange.from && costDate <= dateRange.to;
  });

  // Calculate metrics for the current period
  const totalCosts = filteredCosts.reduce((sum, cost) => sum + cost.amount, 0);
  const costCount = filteredCosts.length;
  const averageCost = costCount > 0 ? totalCosts / costCount : 0;

  // Calculate previous period for comparison (same duration before the current period)
  const previousMetrics = dateRange?.from && dateRange?.to ? (() => {
    const currentPeriodDays = Math.floor((dateRange.to.getTime() - dateRange.from.getTime()) / (1000 * 60 * 60 * 24));
    const previousStart = new Date(dateRange.from.getTime() - (currentPeriodDays * 24 * 60 * 60 * 1000));
    const previousEnd = new Date(dateRange.from.getTime() - 1);
    
    const previousCosts = costs.filter(cost => {
      const costDate = new Date(cost.date);
      return costDate >= previousStart && costDate <= previousEnd;
    });
    
    return {
      totalCosts: previousCosts.reduce((sum, cost) => sum + cost.amount, 0),
      costCount: previousCosts.length
    };
  })() : null;

  // Calculate percentage changes
  const costsChange = previousMetrics ? 
    ((totalCosts - previousMetrics.totalCosts) / (previousMetrics.totalCosts || 1)) * 100 : 0;
  const countChange = previousMetrics ? 
    ((costCount - previousMetrics.costCount) / (previousMetrics.costCount || 1)) * 100 : 0;

  // Get top spending category
  const categoryTotals = filteredCosts.reduce((acc, cost) => {
    acc[cost.category] = (acc[cost.category] || 0) + cost.amount;
    return acc;
  }, {} as Record<string, number>);

  const topCategory = Object.entries(categoryTotals).sort(([,a], [,b]) => b - a)[0];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Toplam Masraf
          </CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">₺{totalCosts.toLocaleString()}</div>
          {previousMetrics && (
            <div className="flex items-center text-xs text-muted-foreground">
              {costsChange >= 0 ? (
                <TrendingUp className="h-3 w-3 text-red-500 mr-1" />
              ) : (
                <TrendingDown className="h-3 w-3 text-green-500 mr-1" />
              )}
              <span className={costsChange >= 0 ? "text-red-500" : "text-green-500"}>
                {Math.abs(costsChange).toFixed(1)}% önceki döneme göre
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Ortalama Masraf
          </CardTitle>
          <Calculator className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">₺{averageCost.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">
            işlem başına ortalama
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Toplam İşlem
          </CardTitle>
          <Tag className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{costCount}</div>
          {previousMetrics && (
            <div className="flex items-center text-xs text-muted-foreground">
              {countChange >= 0 ? (
                <TrendingUp className="h-3 w-3 text-orange-500 mr-1" />
              ) : (
                <TrendingDown className="h-3 w-3 text-green-500 mr-1" />
              )}
              <span className={countChange >= 0 ? "text-orange-500" : "text-green-500"}>
                {Math.abs(countChange).toFixed(1)}% önceki döneme göre
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            En Yüksek Kategori
          </CardTitle>
          <Tag className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {topCategory ? topCategory[0] : 'Veri Yok'}
          </div>
          <p className="text-xs text-muted-foreground">
            {topCategory ? `₺${topCategory[1].toLocaleString()}` : 'Henüz masraf yok'}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default CostsDashboard;
