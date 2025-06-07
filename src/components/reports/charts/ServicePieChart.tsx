
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { useQuery } from "@tanstack/react-query";
import { getServiceSales } from "@/utils/localStorage";

const ServicePieChart = () => {
  const { data: serviceSales = [] } = useQuery({
    queryKey: ['serviceSales'],
    queryFn: getServiceSales,
  });

  // Calculate real service sales data
  const calculateServiceData = () => {
    const serviceStats = new Map();
    
    serviceSales.forEach(sale => {
      if (!serviceStats.has(sale.serviceId)) {
        serviceStats.set(sale.serviceId, {
          name: sale.serviceName || 'Bilinmeyen Hizmet',
          value: 0,
          count: 0
        });
      }
      
      const service = serviceStats.get(sale.serviceId);
      service.value += sale.price;
      service.count += 1;
    });

    const totalValue = Array.from(serviceStats.values()).reduce((sum, service) => sum + service.value, 0);
    
    return Array.from(serviceStats.values())
      .map((service, index) => ({
        name: service.name,
        value: totalValue > 0 ? Math.round((service.value / totalValue) * 100) : 0,
        actualValue: service.value,
        count: service.count,
        color: ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#6c5ce7', '#fd79a8', '#00b894', '#e17055'][index % 8]
      }))
      .sort((a, b) => b.actualValue - a.actualValue)
      .slice(0, 8); // Top 8 services
  };

  const data = calculateServiceData();

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{`${payload[0].payload.name}`}</p>
          <p className="text-primary">{`Oran: %${payload[0].value}`}</p>
          <p className="text-sm text-muted-foreground">{`Gelir: ₺${payload[0].payload.actualValue.toLocaleString('tr-TR')}`}</p>
          <p className="text-sm text-muted-foreground">{`Seans: ${payload[0].payload.count}`}</p>
        </div>
      );
    }
    return null;
  };

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        <p>Henüz hizmet satış verisi bulunmuyor</p>
      </div>
    );
  }

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
