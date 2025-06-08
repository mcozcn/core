
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { useQuery } from "@tanstack/react-query";
import { getCosts } from "@/utils/storage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DateRange } from "react-day-picker";

interface CostsCategoryChartProps {
  dateRange: DateRange | undefined;
}

const CostsCategoryChart = ({ dateRange }: CostsCategoryChartProps) => {
  const { data: costs = [] } = useQuery({
    queryKey: ['costs'],
    queryFn: getCosts,
  });

  const calculateCategoryDistribution = () => {
    // Filter by date range
    let filteredCosts = costs;
    if (dateRange?.from && dateRange?.to) {
      filteredCosts = costs.filter(cost => {
        const costDate = new Date(cost.date);
        return costDate >= dateRange.from! && costDate <= dateRange.to!;
      });
    }

    const categoryTotals = filteredCosts.reduce((acc, cost) => {
      acc[cost.category] = (acc[cost.category] || 0) + cost.amount;
      return acc;
    }, {} as Record<string, number>);

    const totalAmount = Object.values(categoryTotals).reduce((sum, amount) => sum + amount, 0);

    if (totalAmount === 0) return [];

    const colors = ['#ef4444', '#f97316', '#eab308', '#84cc16', '#10b981', '#06b6d4', '#3b82f6', '#8b5cf6'];

    return Object.entries(categoryTotals)
      .map(([category, amount], index) => ({
        name: category,
        value: Math.round((amount / totalAmount) * 100),
        actualValue: amount,
        color: colors[index % colors.length]
      }))
      .sort((a, b) => b.actualValue - a.actualValue);
  };

  const data = calculateCategoryDistribution();

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{`${payload[0].payload.name}`}</p>
          <p className="text-primary">{`Oran: %${payload[0].value}`}</p>
          <p className="text-sm text-muted-foreground">{`Tutar: ₺${payload[0].payload.actualValue.toLocaleString('tr-TR')}`}</p>
        </div>
      );
    }
    return null;
  };

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Kategori Bazlı Masraf Dağılımı</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            <p>Henüz masraf verisi bulunmuyor</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Kategori Bazlı Masraf Dağılımı</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={120}
                paddingAngle={5}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default CostsCategoryChart;
