
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { getCustomerRecords, getCosts, getSales, getServiceSales } from "@/utils/localStorage";
import { TrendingUp, TrendingDown, DollarSign, CreditCard } from "lucide-react";
import { DateRange } from "react-day-picker";

interface FinancialDashboardProps {
  dateRange: DateRange | undefined;
}

const FinancialDashboard = ({ dateRange }: FinancialDashboardProps) => {
  const { data: customerRecords = [] } = useQuery({
    queryKey: ['customerRecords'],
    queryFn: getCustomerRecords,
  });

  const { data: costs = [] } = useQuery({
    queryKey: ['costs'],
    queryFn: getCosts,
  });

  const { data: sales = [] } = useQuery({
    queryKey: ['sales'],
    queryFn: getSales,
  });

  const { data: serviceSales = [] } = useQuery({
    queryKey: ['serviceSales'],
    queryFn: getServiceSales,
  });

  // Filter data by date range
  const filterByDateRange = (items: any[], dateField: string) => {
    if (!dateRange?.from || !dateRange?.to) return items;
    return items.filter(item => {
      const itemDate = new Date(item[dateField]);
      return itemDate >= dateRange.from! && itemDate <= dateRange.to!;
    });
  };

  const filteredRecords = filterByDateRange(customerRecords, 'date');
  const filteredCosts = filterByDateRange(costs, 'date');
  const filteredSales = filterByDateRange(sales, 'saleDate');
  const filteredServiceSales = filterByDateRange(serviceSales, 'saleDate');

  // Calculate metrics
  const totalPayments = filteredRecords
    .filter(record => record.type === 'payment')
    .reduce((sum, record) => sum + record.amount, 0);

  const totalDebts = filteredRecords
    .filter(record => record.type === 'debt')
    .reduce((sum, record) => sum + record.amount, 0);

  const totalCosts = filteredCosts.reduce((sum, cost) => sum + cost.amount, 0);

  const productRevenue = filteredSales.reduce((sum, sale) => sum + sale.totalPrice, 0);
  const serviceRevenue = filteredServiceSales.reduce((sum, sale) => sum + sale.price, 0);
  const totalRevenue = productRevenue + serviceRevenue;

  const netProfit = totalRevenue - totalCosts;
  const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

  // Calculate previous period for comparison
  const getPreviousPeriodMetrics = () => {
    if (!dateRange?.from || !dateRange?.to) return null;
    
    const periodLength = dateRange.to.getTime() - dateRange.from.getTime();
    const previousFrom = new Date(dateRange.from.getTime() - periodLength);
    const previousTo = new Date(dateRange.to.getTime() - periodLength);
    
    const prevRecords = customerRecords.filter(record => {
      const recordDate = new Date(record.date);
      return recordDate >= previousFrom && recordDate <= previousTo;
    });
    
    const prevCostsArray = costs.filter(cost => {
      const costDate = new Date(cost.date);
      return costDate >= previousFrom && costDate <= previousTo;
    });

    const prevSales = sales.filter(sale => {
      const saleDate = new Date(sale.saleDate);
      return saleDate >= previousFrom && saleDate <= previousTo;
    });

    const prevServiceSales = serviceSales.filter(sale => {
      const saleDate = new Date(sale.saleDate);
      return saleDate >= previousFrom && saleDate <= previousTo;
    });
    
    const prevRevenue = prevSales.reduce((sum, sale) => sum + sale.totalPrice, 0) +
                       prevServiceSales.reduce((sum, sale) => sum + sale.price, 0);
    const prevCostsTotal = prevCostsArray.reduce((sum, cost) => sum + cost.amount, 0);
    const prevProfit = prevRevenue - prevCostsTotal;
    
    return { prevRevenue, prevCosts: prevCostsTotal, prevProfit };
  };

  const previousMetrics = getPreviousPeriodMetrics();

  const getChangePercentage = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  const revenueChange = previousMetrics ? getChangePercentage(totalRevenue, previousMetrics.prevRevenue) : 0;
  const profitChange = previousMetrics ? getChangePercentage(netProfit, previousMetrics.prevProfit) : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Toplam Gelir</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">₺{totalRevenue.toLocaleString('tr-TR')}</div>
          {previousMetrics && (
            <div className="flex items-center text-xs text-muted-foreground">
              {revenueChange >= 0 ? (
                <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
              )}
              <span className={revenueChange >= 0 ? "text-green-500" : "text-red-500"}>
                %{Math.abs(revenueChange).toFixed(1)}
              </span>
              <span className="ml-1">önceki döneme göre</span>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Toplam Masraf</CardTitle>
          <CreditCard className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">₺{totalCosts.toLocaleString('tr-TR')}</div>
          <p className="text-xs text-muted-foreground">
            {filteredCosts.length} masraf kaydı
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Net Kâr</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            ₺{netProfit.toLocaleString('tr-TR')}
          </div>
          {previousMetrics && (
            <div className="flex items-center text-xs text-muted-foreground">
              {profitChange >= 0 ? (
                <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
              )}
              <span className={profitChange >= 0 ? "text-green-500" : "text-red-500"}>
                %{Math.abs(profitChange).toFixed(1)}
              </span>
              <span className="ml-1">önceki döneme göre</span>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Bekleyen Borçlar</CardTitle>
          <CreditCard className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-600">
            ₺{totalDebts.toLocaleString('tr-TR')}
          </div>
          <p className="text-xs text-muted-foreground">
            {filteredRecords.filter(r => r.type === 'debt').length} borç kaydı
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default FinancialDashboard;
