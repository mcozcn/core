
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { useQuery } from "@tanstack/react-query";
import { getServiceSales } from "@/utils/localStorage";

const ServicePieChart = () => {
  const { data: serviceSales = [] } = useQuery({
    queryKey: ['serviceSales'],
    queryFn: getServiceSales,
  });

  // Mock data - gerçek verilerle değiştirilebilir
  const data = [
    { name: 'Saç Kesimi', value: 40, color: '#ff6b6b' },
    { name: 'Saç Boyama', value: 30, color: '#4ecdc4' },
    { name: 'Fön', value: 15, color: '#45b7d1' },
    { name: 'Perma', value: 10, color: '#f9ca24' },
    { name: 'Diğer', value: 5, color: '#6c5ce7' }
  ];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{`${payload[0].name}`}</p>
          <p className="text-primary">{`Oran: %${payload[0].value}`}</p>
        </div>
      );
    }
    return null;
  };

  return (
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
  );
};

export default ServicePieChart;
