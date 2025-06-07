
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const ProductRevenueChart = () => {
  // Mock data - gerçek verilerle değiştirilebilir
  const data = [
    { month: 'Oca', gelir: 12000 },
    { month: 'Şub', gelir: 15000 },
    { month: 'Mar', gelir: 18000 },
    { month: 'Nis', gelir: 14000 },
    { month: 'May', gelir: 22000 },
    { month: 'Haz', gelir: 25000 }
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{`${label}`}</p>
          <p className="text-primary">{`Gelir: ₺${payload[0].value.toLocaleString('tr-TR')}`}</p>
        </div>
      );
    }
    return null;
  };

  return (
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
          tickFormatter={(value) => `₺${value / 1000}k`}
        />
        <Tooltip content={<CustomTooltip />} />
        <Line 
          type="monotone" 
          dataKey="gelir" 
          stroke="#8884d8" 
          strokeWidth={3}
          dot={{ fill: '#8884d8', strokeWidth: 2, r: 6 }}
          activeDot={{ r: 8, stroke: '#8884d8', strokeWidth: 2 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default ProductRevenueChart;
