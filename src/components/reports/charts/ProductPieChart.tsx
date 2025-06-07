
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { useQuery } from "@tanstack/react-query";
import { getSales } from "@/utils/localStorage";

const ProductPieChart = () => {
  const { data: sales = [] } = useQuery({
    queryKey: ['sales'],
    queryFn: getSales,
  });

  // Mock data - gerçek verilerle değiştirilebilir
  const data = [
    { name: 'Saç Kremi', value: 35, color: '#8884d8' },
    { name: 'Şampuan', value: 25, color: '#82ca9d' },
    { name: 'Saç Maskesi', value: 20, color: '#ffc658' },
    { name: 'Fön Kremi', value: 15, color: '#ff7300' },
    { name: 'Diğer', value: 5, color: '#8dd1e1' }
  ];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{`${payload[0].name}`}</p>
          <p className="text-primary">{`Satış: %${payload[0].value}`}</p>
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

export default ProductPieChart;
