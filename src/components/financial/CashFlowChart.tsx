
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useQuery } from "@tanstack/react-query";
import { getCustomerRecords, getCosts, getSales, getServiceSales, getPersonnelRecords } from "@/utils/localStorage";
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
    queryFn: getPersonnelRecords,
  });

  const calculateComprehensiveCashFlow = () => {
    const monthlyData = new Map();
    
    // Gelir Kalemleri
    
    // 1. Müşteri ödemeleri (tahsilat)
    customerRecords
      .filter(record => record.type === 'payment')
      .forEach(payment => {
        const date = new Date(payment.date);
        const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
        const monthName = date.toLocaleDateString('tr-TR', { month: 'short', year: 'numeric' });
        
        if (!monthlyData.has(monthKey)) {
          monthlyData.set(monthKey, {
            month: monthName,
            tahsilat: 0,
            urun_satislari: 0,
            hizmet_satislari: 0,
            toplam_gelir: 0,
            masraflar: 0,
            personel_odemeler: 0,
            stok_alimlar: 0,
            toplam_gider: 0,
            net_nakit_akisi: 0,
            date: date
          });
        }
        
        monthlyData.get(monthKey).tahsilat += payment.amount;
      });

    // 2. Ürün satışları (nakit satışlar)
    sales.forEach(sale => {
      const date = new Date(sale.saleDate);
      const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
      const monthName = date.toLocaleDateString('tr-TR', { month: 'short', year: 'numeric' });
      
      if (!monthlyData.has(monthKey)) {
        monthlyData.set(monthKey, {
          month: monthName,
          tahsilat: 0,
          urun_satislari: 0,
          hizmet_satislari: 0,
          toplam_gelir: 0,
          masraflar: 0,
          personel_odemeler: 0,
          stok_alimlar: 0,
          toplam_gider: 0,
          net_nakit_akisi: 0,
          date: date
        });
      }
      
      monthlyData.get(monthKey).urun_satislari += sale.totalPrice || 0;
    });

    // 3. Hizmet satışları (nakit hizmet satışları)
    serviceSales.forEach(serviceSale => {
      const date = new Date(serviceSale.saleDate);
      const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
      const monthName = date.toLocaleDateString('tr-TR', { month: 'short', year: 'numeric' });
      
      if (!monthlyData.has(monthKey)) {
        monthlyData.set(monthKey, {
          month: monthName,
          tahsilat: 0,
          urun_satislari: 0,
          hizmet_satislari: 0,
          toplam_gelir: 0,
          masraflar: 0,
          personel_odemeler: 0,
          stok_alimlar: 0,
          toplam_gider: 0,
          net_nakit_akisi: 0,
          date: date
        });
      }
      
      monthlyData.get(monthKey).hizmet_satislari += serviceSale.totalPrice || 0;
    });

    // Gider Kalemleri
    
    // 1. Masraflar ve işletme giderleri
    costs.forEach(cost => {
      const date = new Date(cost.date);
      const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
      const monthName = date.toLocaleDateString('tr-TR', { month: 'short', year: 'numeric' });
      
      if (!monthlyData.has(monthKey)) {
        monthlyData.set(monthKey, {
          month: monthName,
          tahsilat: 0,
          urun_satislari: 0,
          hizmet_satislari: 0,
          toplam_gelir: 0,
          masraflar: 0,
          personel_odemeler: 0,
          stok_alimlar: 0,
          toplam_gider: 0,
          net_nakit_akisi: 0,
          date: date
        });
      }
      
      monthlyData.get(monthKey).masraflar += cost.amount;
    });

    // 2. Personel ödemeleri
    personnelRecords
      .filter(record => record.type === 'payment')
      .forEach(payment => {
        const date = new Date(payment.date);
        const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
        const monthName = date.toLocaleDateString('tr-TR', { month: 'short', year: 'numeric' });
        
        if (!monthlyData.has(monthKey)) {
          monthlyData.set(monthKey, {
            month: monthName,
            tahsilat: 0,
            urun_satislari: 0,
            hizmet_satislari: 0,
            toplam_gelir: 0,
            masraflar: 0,
            personel_odemeler: 0,
            stok_alimlar: 0,
            toplam_gider: 0,
            net_nakit_akisi: 0,
            date: date
          });
        }
        
        monthlyData.get(monthKey).personel_odemeler += Math.abs(payment.amount);
      });

    // 3. Stok alımları (ürün maliyetleri)
    sales.forEach(sale => {
      const date = new Date(sale.saleDate);
      const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
      const monthName = date.toLocaleDateString('tr-TR', { month: 'short', year: 'numeric' });
      
      if (!monthlyData.has(monthKey)) {
        monthlyData.set(monthKey, {
          month: monthName,
          tahsilat: 0,
          urun_satislari: 0,
          hizmet_satislari: 0,
          toplam_gelir: 0,
          masraflar: 0,
          personel_odemeler: 0,
          stok_alimlar: 0,
          toplam_gider: 0,
          net_nakit_akisi: 0,
          date: date
        });
      }
      
      // Stok maliyeti olarak satış fiyatının %60'ını varsayıyoruz
      const estimatedCost = (sale.unitPrice * sale.quantity) * 0.6;
      monthlyData.get(monthKey).stok_alimlar += estimatedCost;
    });

    // Toplam hesaplamaları
    return Array.from(monthlyData.values())
      .map(data => {
        data.toplam_gelir = data.tahsilat + data.urun_satislari + data.hizmet_satislari;
        data.toplam_gider = data.masraflar + data.personel_odemeler + data.stok_alimlar;
        data.net_nakit_akisi = data.toplam_gelir - data.toplam_gider;
        return data;
      })
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .slice(-6);
  };

  const data = calculateComprehensiveCashFlow();

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border rounded-lg p-4 shadow-lg">
          <p className="font-medium mb-2">{`${label}`}</p>
          <div className="space-y-1">
            <p className="text-green-600">
              <span className="font-medium">Toplam Gelir: </span>
              ₺{payload.find((p: any) => p.dataKey === 'toplam_gelir')?.value?.toLocaleString('tr-TR') || '0'}
            </p>
            <p className="text-red-600">
              <span className="font-medium">Toplam Gider: </span>
              ₺{payload.find((p: any) => p.dataKey === 'toplam_gider')?.value?.toLocaleString('tr-TR') || '0'}
            </p>
            <p className={`font-bold ${payload.find((p: any) => p.dataKey === 'net_nakit_akisi')?.value >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
              <span>Net Nakit Akışı: </span>
              ₺{payload.find((p: any) => p.dataKey === 'net_nakit_akisi')?.value?.toLocaleString('tr-TR') || '0'}
            </p>
            <div className="mt-2 pt-2 border-t border-gray-200">
              <p className="text-xs text-gray-600">Gelir Detayı:</p>
              <p className="text-xs">• Tahsilat: ₺{payload.find((p: any) => p.dataKey === 'tahsilat')?.value?.toLocaleString('tr-TR') || '0'}</p>
              <p className="text-xs">• Ürün Satışları: ₺{payload.find((p: any) => p.dataKey === 'urun_satislari')?.value?.toLocaleString('tr-TR') || '0'}</p>
              <p className="text-xs">• Hizmet Satışları: ₺{payload.find((p: any) => p.dataKey === 'hizmet_satislari')?.value?.toLocaleString('tr-TR') || '0'}</p>
            </div>
            <div className="mt-1">
              <p className="text-xs text-gray-600">Gider Detayı:</p>
              <p className="text-xs">• Masraflar: ₺{payload.find((p: any) => p.dataKey === 'masraflar')?.value?.toLocaleString('tr-TR') || '0'}</p>
              <p className="text-xs">• Personel Ödemeleri: ₺{payload.find((p: any) => p.dataKey === 'personel_odemeler')?.value?.toLocaleString('tr-TR') || '0'}</p>
              <p className="text-xs">• Stok Maliyetleri: ₺{payload.find((p: any) => p.dataKey === 'stok_alimlar')?.value?.toLocaleString('tr-TR') || '0'}</p>
            </div>
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
          <CardTitle>Kapsamlı Nakit Akışı Analizi</CardTitle>
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
        <CardTitle>Kapsamlı Nakit Akışı Analizi</CardTitle>
        <p className="text-sm text-muted-foreground">
          Tüm gelir ve gider kalemlerini içeren detaylı nakit akışı görünümü
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
                dataKey="toplam_gelir" 
                fill="#10b981" 
                name="Toplam Gelir"
                radius={[2, 2, 0, 0]}
                opacity={0.8}
              />
              <Bar 
                dataKey="toplam_gider" 
                fill="#ef4444" 
                name="Toplam Gider"
                radius={[2, 2, 0, 0]}
                opacity={0.8}
              />
              <Bar 
                dataKey="net_nakit_akisi" 
                fill="#3b82f6" 
                name="Net Nakit Akışı"
                radius={[2, 2, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        {/* Özet İstatistikleri */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted/20 rounded-lg">
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Toplam Gelir</p>
            <p className="text-lg font-bold text-green-600">
              ₺{data.reduce((sum, item) => sum + item.toplam_gelir, 0).toLocaleString('tr-TR')}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Toplam Gider</p>
            <p className="text-lg font-bold text-red-600">
              ₺{data.reduce((sum, item) => sum + item.toplam_gider, 0).toLocaleString('tr-TR')}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Net Akış</p>
            <p className={`text-lg font-bold ${data.reduce((sum, item) => sum + item.net_nakit_akisi, 0) >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
              ₺{data.reduce((sum, item) => sum + item.net_nakit_akisi, 0).toLocaleString('tr-TR')}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Ortalama Aylık</p>
            <p className={`text-lg font-bold ${(data.reduce((sum, item) => sum + item.net_nakit_akisi, 0) / data.length) >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
              ₺{Math.round(data.reduce((sum, item) => sum + item.net_nakit_akisi, 0) / data.length).toLocaleString('tr-TR')}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CashFlowChart;
