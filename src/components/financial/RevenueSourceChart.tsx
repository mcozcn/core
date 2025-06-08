
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { useQuery } from "@tanstack/react-query";
import { getSales, getServiceSales, getCustomerRecords } from "@/utils/localStorage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const RevenueSourceChart = () => {
  const { data: sales = [] } = useQuery({
    queryKey: ['sales'],
    queryFn: getSales,
  });

  const { data: serviceSales = [] } = useQuery({
    queryKey: ['serviceSales'],
    queryFn: getServiceSales,
  });

  const { data: customerRecords = [] } = useQuery({
    queryKey: ['customerRecords'],
    queryFn: getCustomerRecords,
  });

  const calculateRevenueDistribution = () => {
    const productRevenue = sales.reduce((sum, sale) => sum + sale.totalPrice, 0);
    const serviceRevenue = serviceSales.reduce((sum, sale) => sum + sale.price, 0);
    const paymentRevenue = customerRecords
      .filter(record => record.type === 'payment')
      .reduce((sum, payment) => sum + payment.amount, 0);

    const totalRevenue = productRevenue + serviceRevenue;

    if (totalRevenue === 0) return [];

    const data = [
      {
        name: 'Ürün Satışları',
        value: Math.round((productRevenue / totalRevenue) * 100),
        actualValue: productRevenue,
        color: '#3b82f6'
      },
      {
        name: 'Hizmet Satışları',
        value: Math.round((serviceRevenue / totalRevenue) * 100),
        actualValue: serviceRevenue,
        color: '#10b981'
      }
    ].filter(item => item.actualValue > 0);

    return data;
  };

  const data = calculateRevenueDistribution();

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
          <CardTitle>Gelir Kaynakları Dağılımı</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            <p>Henüz gelir verisi bulunmuyor</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gelir Kaynakları Dağılımı</CardTitle>
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

export default RevenueSourceChart;
