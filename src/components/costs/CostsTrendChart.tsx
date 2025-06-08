
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useQuery } from "@tanstack/react-query";
import { getCosts } from "@/utils/storage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DateRange } from "react-day-picker";

interface CostsTrendChartProps {
  dateRange: DateRange | undefined;
}

const CostsTrendChart = ({ dateRange }: CostsTrendChartProps) => {
  const { data: costs = [] } = useQuery({
    queryKey: ['costs'],
    queryFn: getCosts,
  });

  const calculateMonthlyTrend = () => {
    let filteredCosts = costs;
    if (dateRange?.from && dateRange?.to) {
      filteredCosts = costs.filter(cost => {
        const costDate = new Date(cost.date);
        return costDate >= dateRange.from! && costDate <= dateRange.to!;
      });
    }

    const monthlyData = new Map();
    
    filteredCosts.forEach(cost => {
      const date = new Date(cost.date);
      const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
      const monthName = date.toLocaleDateString('tr-TR', { month: 'short', year: 'numeric' });
      
      if (!monthlyData.has(monthKey)) {
        monthlyData.set(monthKey, {
          month: monthName,
          toplam_masraf: 0,
          islem_sayisi: 0,
          date: date
        });
      }
      
      const monthData = monthlyData.get(monthKey);
      monthData.toplam_masraf += cost.amount;
      monthData.islem_sayisi += 1;
    });

    return Array.from(monthlyData.values())
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .slice(-6)
      .map(({ month, toplam_masraf, islem_sayisi }) => ({ 
        month, 
        toplam_masraf, 
        islem_sayisi,
        ortalama_masraf: islem_sayisi > 0 ? toplam_masraf / islem_sayisi : 0
      }));
  };

  const data = calculateMonthlyTrend();

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{`${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {`${entry.name}: ${entry.dataKey === 'islem_sayisi' ? entry.value : `₺${entry.value.toLocaleString('tr-TR')}`}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Masraf Trend Analizi</CardTitle>
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
        <CardTitle>Masraf Trend Analizi</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="month" 
                axisLine={false}
                tickLine={false}
                className="text-muted-foreground"
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                className="text-muted-foreground"
                tickFormatter={(value) => `₺${value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="toplam_masraf" 
                stroke="#ef4444" 
                strokeWidth={3}
                dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
                name="Toplam Masraf"
              />
              <Line 
                type="monotone" 
                dataKey="ortalama_masraf" 
                stroke="#f97316" 
                strokeWidth={3}
                dot={{ fill: '#f97316', strokeWidth: 2, r: 4 }}
                name="Ortalama Masraf"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default CostsTrendChart;
