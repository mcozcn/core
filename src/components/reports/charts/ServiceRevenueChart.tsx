
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const ServiceRevenueChart = () => {
  // Mock data - gerçek verilerle değiştirilebilir
  const data = [
    { month: 'Oca', gelir: 18000 },
    { month: 'Şub', gelir: 22000 },
    { month: 'Mar', gelir: 25000 },
    { month: 'Nis', gelir: 20000 },
    { month: 'May', gelir: 28000 },
    { month: 'Haz', gelir: 32000 }
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
      <AreaChart data={data}>
        <defs>
          <linearGradient id="colorGelir" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#ff6b6b" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="#ff6b6b" stopOpacity={0.1}/>
          </linearGradient>
        </defs>
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
        <Area 
          type="monotone" 
          dataKey="gelir" 
          stroke="#ff6b6b" 
          fillOpacity={1} 
          fill="url(#colorGelir)"
          strokeWidth={3}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default ServiceRevenueChart;
