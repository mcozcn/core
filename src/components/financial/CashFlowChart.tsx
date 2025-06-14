
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useQuery } from "@tanstack/react-query";
import { getCustomerRecords, getCosts } from "@/utils/localStorage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const CashFlowChart = () => {
  const { data: customerRecords = [] } = useQuery({
    queryKey: ['customerRecords'],
    queryFn: getCustomerRecords,
  });

  const { data: costs = [] } = useQuery({
    queryKey: ['costs'],
    queryFn: getCosts,
  });

  const calculateCashFlow = () => {
    const monthlyData = new Map();
    
    // Process payments (cash inflow)
    customerRecords
      .filter(record => record.type === 'payment')
      .forEach(payment => {
        const date = new Date(payment.date);
        const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
        const monthName = date.toLocaleDateString('tr-TR', { month: 'short', year: 'numeric' });
        
        if (!monthlyData.has(monthKey)) {
          monthlyData.set(monthKey, {
            month: monthName,
            nakit_girisi: 0,
            nakit_cikisi: 0,
            date: date
          });
        }
        
        monthlyData.get(monthKey).nakit_girisi += payment.amount;
      });

    // Process costs (cash outflow)
    costs.forEach(cost => {
      const date = new Date(cost.date);
      const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
      const monthName = date.toLocaleDateString('tr-TR', { month: 'short', year: 'numeric' });
      
      if (!monthlyData.has(monthKey)) {
        monthlyData.set(monthKey, {
          month: monthName,
          nakit_girisi: 0,
          nakit_cikisi: 0,
          date: date
        });
      }
      
      monthlyData.get(monthKey).nakit_cikisi += cost.amount;
    });

    return Array.from(monthlyData.values())
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .slice(-6)
      .map(({ month, nakit_girisi, nakit_cikisi }) => ({ 
        month, 
        nakit_girisi, 
        nakit_cikisi,
        net_akis: nakit_girisi - nakit_cikisi
      }));
  };

  const data = calculateCashFlow();

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{`${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {`${entry.name}: ₺${entry.value.toLocaleString('tr-TR')}`}
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
          <CardTitle>Nakit Akışı Analizi</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            <p>Henüz nakit akışı verisi bulunmuyor</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Nakit Akışı Analizi</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
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
              <Bar 
                dataKey="nakit_girisi" 
                fill="#10b981" 
                name="Nakit Girişi"
                radius={[2, 2, 0, 0]}
              />
              <Bar 
                dataKey="nakit_cikisi" 
                fill="#ef4444" 
                name="Nakit Çıkışı"
                radius={[2, 2, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default CashFlowChart;
