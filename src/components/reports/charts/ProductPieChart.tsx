
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { useQuery } from "@tanstack/react-query";
import { getSales, getStock } from "@/utils/localStorage";

const ProductPieChart = () => {
  const { data: sales = [] } = useQuery({
    queryKey: ['sales'],
    queryFn: getSales,
  });

  const { data: stock = [] } = useQuery({
    queryKey: ['stock'],
    queryFn: getStock,
  });

  // Calculate real product sales data
  const calculateProductData = () => {
    const productSales = new Map();
    
    sales.forEach(sale => {
      if (!productSales.has(sale.productId)) {
        const product = stock.find(item => item.productId === sale.productId);
        productSales.set(sale.productId, {
          name: sale.productName || product?.name || 'Bilinmeyen Ürün',
          value: 0,
          count: 0
        });
      }
      
      const product = productSales.get(sale.productId);
      product.value += sale.totalPrice;
      product.count += sale.quantity;
    });

    const totalValue = Array.from(productSales.values()).reduce((sum, product) => sum + product.value, 0);
    
    return Array.from(productSales.values())
      .map((product, index) => ({
        name: product.name,
        value: totalValue > 0 ? Math.round((product.value / totalValue) * 100) : 0,
        actualValue: product.value,
        count: product.count,
        color: ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#8dd1e1', '#d084d0', '#ffb347', '#87ceeb'][index % 8]
      }))
      .sort((a, b) => b.actualValue - a.actualValue)
      .slice(0, 8); // Top 8 products
  };

  const data = calculateProductData();

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{`${payload[0].payload.name}`}</p>
          <p className="text-primary">{`Oran: %${payload[0].value}`}</p>
          <p className="text-sm text-muted-foreground">{`Gelir: ₺${payload[0].payload.actualValue.toLocaleString('tr-TR')}`}</p>
          <p className="text-sm text-muted-foreground">{`Adet: ${payload[0].payload.count}`}</p>
        </div>
      );
    }
    return null;
  };

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        <p>Henüz ürün satış verisi bulunmuyor</p>
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

export default ProductPieChart;
