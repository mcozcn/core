
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { getCosts } from "@/utils/storage";
import { TrendingUp, TrendingDown, DollarSign, CreditCard, Calculator, Calendar } from "lucide-react";
import { DateRange } from "react-day-picker";

interface CostsDashboardProps {
  dateRange: DateRange | undefined;
}

const CostsDashboard = ({ dateRange }: CostsDashboardProps) => {
  const { data: costs = [] } = useQuery({
    queryKey: ['costs'],
    queryFn: getCosts,
  });

  // Filter data by date range
  const filterByDateRange = (items: any[], dateField: string) => {
    if (!dateRange?.from || !dateRange?.to) return items;
    return items.filter(item => {
      const itemDate = new Date(item[dateField]);
      return itemDate >= dateRange.from! && itemDate <= dateRange.to!;
    });
  };

  const filteredCosts = filterByDateRange(costs, 'date');

  // Calculate metrics
  const totalCosts = filteredCosts.reduce((sum, cost) => sum + cost.amount, 0);
  const averageCost = filteredCosts.length > 0 ? totalCosts / filteredCosts.length : 0;

  // Group by category
  const costsByCategory = filteredCosts.reduce((acc, cost) => {
    acc[cost.category] = (acc[cost.category] || 0) + cost.amount;
    return acc;
  }, {} as Record<string, number>);

  const topCategory = Object.entries(costsByCategory)
    .sort(([, a], [, b]) => b - a)[0];

  // Calculate previous period for comparison
  const getPreviousPeriodMetrics = () => {
    if (!dateRange?.from || !dateRange?.to) return null;
    
    const periodLength = dateRange.to.getTime() - dateRange.from.getTime();
    const previousFrom = new Date(dateRange.from.getTime() - periodLength);
    const previousTo = new Date(dateRange.to.getTime() - periodLength);
    
    const prevCosts = costs.filter(cost => {
      const costDate = new Date(cost.date);
      return costDate >= previousFrom && costDate <= previousTo;
    });
    
    const prevTotalCosts = prevCosts.reduce((sum, cost) => sum + cost.amount, 0);
    
    return { prevTotalCosts };
  };

  const previousMetrics = getPreviousPeriodMetrics();

  const getChangePercentage = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  const costsChange = previousMetrics ? getChangePercentage(totalCosts, previousMetrics.prevTotalCosts) : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Toplam Masraf</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">₺{totalCosts.toLocaleString('tr-TR')}</div>
          {previousMetrics && (
            <div className="flex items-center text-xs text-muted-foreground">
              {costsChange >= 0 ? (
                <TrendingUp className="h-3 w-3 text-red-500 mr-1" />
              ) : (
                <TrendingDown className="h-3 w-3 text-green-500 mr-1" />
              )}
              <span className={costsChange >= 0 ? "text-red-500" : "text-green-500"}>
                %{Math.abs(costsChange).toFixed(1)}
              </span>
              <span className="ml-1">önceki döneme göre</span>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Ortalama Masraf</CardTitle>
          <Calculator className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">₺{averageCost.toLocaleString('tr-TR')}</div>
          <p className="text-xs text-muted-foreground">
            işlem başına ortalama
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Toplam İşlem</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{filteredCosts.length}</div>
          <p className="text-xs text-muted-foreground">
            masraf kaydı
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">En Yüksek Kategori</CardTitle>
          <CreditCard className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-lg font-bold text-orange-600">
            {topCategory ? topCategory[0] : 'Veri Yok'}
          </div>
          <p className="text-xs text-muted-foreground">
            {topCategory ? `₺${topCategory[1].toLocaleString('tr-TR')}` : 'Henüz masraf yok'}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default CostsDashboard;
