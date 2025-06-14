import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useQuery } from "@tanstack/react-query";
import { getCustomerRecords, getCosts, getSales, getServiceSales } from "@/utils/localStorage";
import { getPersonnelRecords } from "@/utils/storage/personnel";
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

  const { data: sales = [] } = useQuery({
    queryKey: ['sales'],
    queryFn: getSales,
  });

  const { data: serviceSales = [] } = useQuery({
    queryKey: ['serviceSales'],
    queryFn: getServiceSales,
  });

  const { data: personnelRecords = [] } = useQuery({
    queryKey: ['personnelRecords'],
    queryFn: () => getPersonnelRecords(),
  });

  const calculateMonthlyComparison = () => {
    const monthlyData = new Map();
    
    // Gelir Kalemleri - Tahsilatlar
    Array.isArray(customerRecords) && customerRecords
      .filter(record => record.type === 'payment')
      .forEach(payment => {
        const date = new Date(payment.date);
        const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
        const monthName = date.toLocaleDateString('tr-TR', { month: 'short', year: 'numeric' });
        
        if (!monthlyData.has(monthKey)) {
          monthlyData.set(monthKey, {
            month: monthName,
            tahsilat: 0,
            cikislar: 0,
            net: 0,
            date: date
          });
        }
        
        monthlyData.get(monthKey).tahsilat += payment.amount;
      });

    // Nakit satışları da tahsilat olarak ekle
    Array.isArray(sales) && sales.forEach(sale => {
      const date = new Date(sale.saleDate);
      const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
      const monthName = date.toLocaleDateString('tr-TR', { month: 'short', year: 'numeric' });
      
      if (!monthlyData.has(monthKey)) {
        monthlyData.set(monthKey, {
          month: monthName,
          tahsilat: 0,
          cikislar: 0,
          net: 0,
          date: date
        });
      }
      
      monthlyData.get(monthKey).tahsilat += sale.totalPrice || 0;
    });

    // Nakit hizmet satışları
    Array.isArray(serviceSales) && serviceSales.forEach(serviceSale => {
      const date = new Date(serviceSale.saleDate);
      const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
      const monthName = date.toLocaleDateString('tr-TR', { month: 'short', year: 'numeric' });
      
      if (!monthlyData.has(monthKey)) {
        monthlyData.set(monthKey, {
          month: monthName,
          tahsilat: 0,
          cikislar: 0,
          net: 0,
          date: date
        });
      }
      
      monthlyData.get(monthKey).tahsilat += serviceSale.totalPrice || 0;
    });

    // Çıkış Kalemleri - Masraflar
    Array.isArray(costs) && costs.forEach(cost => {
      const date = new Date(cost.date);
      const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
      const monthName = date.toLocaleDateString('tr-TR', { month: 'short', year: 'numeric' });
      
      if (!monthlyData.has(monthKey)) {
        monthlyData.set(monthKey, {
          month: monthName,
          tahsilat: 0,
          cikislar: 0,
          net: 0,
          date: date
        });
      }
      
      monthlyData.get(monthKey).cikislar += cost.amount;
    });

    // Personel ödemeleri - sadece payment tipini kontrol et
    Array.isArray(personnelRecords) && personnelRecords
      .filter(record => record.type === 'deduction')
      .forEach(payment => {
        const date = new Date(payment.date);
        const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
        const monthName = date.toLocaleDateString('tr-TR', { month: 'short', year: 'numeric' });
        
        if (!monthlyData.has(monthKey)) {
          monthlyData.set(monthKey, {
            month: monthName,
            tahsilat: 0,
            cikislar: 0,
            net: 0,
            date: date
          });
        }
        
        monthlyData.get(monthKey).cikislar += Math.abs(payment.amount);
      });

    // Stok maliyetleri (satış fiyatının %60'ı olarak varsayıyoruz)
    Array.isArray(sales) && sales.forEach(sale => {
      const date = new Date(sale.saleDate);
      const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
      const monthName = date.toLocaleDateString('tr-TR', { month: 'short', year: 'numeric' });
      
      if (!monthlyData.has(monthKey)) {
        monthlyData.set(monthKey, {
          month: monthName,
          tahsilat: 0,
          cikislar: 0,
          net: 0,
          date: date
        });
      }
      
      const estimatedCost = (sale.unitPrice * sale.quantity) * 0.6;
      monthlyData.get(monthKey).cikislar += estimatedCost;
    });

    // Net hesaplama
    return Array.from(monthlyData.values())
      .map(data => {
        data.net = data.tahsilat - data.cikislar;
        return data;
      })
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .slice(-6); // Son 6 ay
  };

  const data = calculateMonthlyComparison();

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border rounded-lg p-4 shadow-lg">
          <p className="font-medium mb-2">{`${label}`}</p>
          <div className="space-y-1">
            <p className="text-green-600">
              <span className="font-medium">Tahsilat: </span>
              ₺{payload.find((p: any) => p.dataKey === 'tahsilat')?.value?.toLocaleString('tr-TR') || '0'}
            </p>
            <p className="text-red-600">
              <span className="font-medium">Çıkışlar: </span>
              ₺{payload.find((p: any) => p.dataKey === 'cikislar')?.value?.toLocaleString('tr-TR') || '0'}
            </p>
            <p className={`font-bold ${payload.find((p: any) => p.dataKey === 'net')?.value >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
              <span>Net: </span>
              ₺{payload.find((p: any) => p.dataKey === 'net')?.value?.toLocaleString('tr-TR') || '0'}
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Aylık Tahsilat vs Çıkış Analizi</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            <p>Henüz finansal veri bulunmuyor</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Aylık Tahsilat vs Çıkış Analizi</CardTitle>
        <p className="text-sm text-muted-foreground">
          Aylık bazda tahsil edilen ödemeler ile yapılan çıkışların karşılaştırması
        </p>
      </CardHeader>
      <CardContent>
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="month" 
                axisLine={false}
                tickLine={false}
                className="text-muted-foreground"
                fontSize={12}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                className="text-muted-foreground"
                fontSize={12}
                tickFormatter={(value) => `₺${value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                wrapperStyle={{ fontSize: '12px' }}
                iconType="rect"
              />
              <Bar 
                dataKey="tahsilat" 
                fill="#10b981" 
                name="Tahsilat"
                radius={[2, 2, 0, 0]}
                opacity={0.9}
              />
              <Bar 
                dataKey="cikislar" 
                fill="#ef4444" 
                name="Çıkışlar"
                radius={[2, 2, 0, 0]}
                opacity={0.9}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        {/* Özet İstatistikleri */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-4 p-4 bg-muted/20 rounded-lg">
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Toplam Tahsilat</p>
            <p className="text-lg font-bold text-green-600">
              ₺{data.reduce((sum, item) => sum + item.tahsilat, 0).toLocaleString('tr-TR')}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Toplam Çıkış</p>
            <p className="text-lg font-bold text-red-600">
              ₺{data.reduce((sum, item) => sum + item.cikislar, 0).toLocaleString('tr-TR')}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Net Durum</p>
            <p className={`text-lg font-bold ${data.reduce((sum, item) => sum + item.net, 0) >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
              ₺{data.reduce((sum, item) => sum + item.net, 0).toLocaleString('tr-TR')}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CashFlowChart;
