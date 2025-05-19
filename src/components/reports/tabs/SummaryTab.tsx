
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/utils/format";

interface SummaryTabProps {
  weeklySummary: {
    totalSales: number;
    customerCount: number;
    appointmentCount: number;
    netProfit: number;
  };
  monthlySummary: {
    totalSales: number;
    customerCount: number;
    appointmentCount: number;
    netProfit: number;
  };
  topProducts: Array<{ name: string; count: number }>;
  topServices: Array<{ name: string; count: number }>;
}

export const SummaryTab = ({ weeklySummary, monthlySummary, topProducts, topServices }: SummaryTabProps) => {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-xl font-semibold mb-4">Haftalık Özet</h3>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Toplam Satış</span>
              <span className="font-medium">{formatCurrency(weeklySummary.totalSales)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Müşteri Sayısı</span>
              <span className="font-medium">{weeklySummary.customerCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Randevu Sayısı</span>
              <span className="font-medium">{weeklySummary.appointmentCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Net Kâr</span>
              <span className="font-medium">{formatCurrency(weeklySummary.netProfit)}</span>
            </div>
          </div>
          <Button variant="outline" className="w-full mt-6">Detaylı Rapor</Button>
        </Card>
        
        <Card className="p-6">
          <h3 className="text-xl font-semibold mb-4">Aylık Özet</h3>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Toplam Satış</span>
              <span className="font-medium">{formatCurrency(monthlySummary.totalSales)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Müşteri Sayısı</span>
              <span className="font-medium">{monthlySummary.customerCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Randevu Sayısı</span>
              <span className="font-medium">{monthlySummary.appointmentCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Net Kâr</span>
              <span className="font-medium">{formatCurrency(monthlySummary.netProfit)}</span>
            </div>
          </div>
          <Button variant="outline" className="w-full mt-6">Detaylı Rapor</Button>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-4">Diğer İstatistikler</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="border rounded-lg p-4">
            <h4 className="font-medium mb-2">En Yoğun Günler</h4>
            <ol className="list-decimal list-inside text-muted-foreground">
              <li>Cumartesi: 24 randevu</li>
              <li>Cuma: 18 randevu</li>
              <li>Pazar: 15 randevu</li>
            </ol>
          </div>
          <div className="border rounded-lg p-4">
            <h4 className="font-medium mb-2">En Çok Satan Ürünler</h4>
            <ol className="list-decimal list-inside text-muted-foreground">
              {topProducts.length > 0 ? (
                topProducts.map((product, index) => (
                  <li key={index}>{product.name}: {String(product.count)} adet</li>
                ))
              ) : (
                <li>Veri bulunamadı</li>
              )}
            </ol>
          </div>
          <div className="border rounded-lg p-4">
            <h4 className="font-medium mb-2">En Çok Tercih Edilen Hizmetler</h4>
            <ol className="list-decimal list-inside text-muted-foreground">
              {topServices.length > 0 ? (
                topServices.map((service, index) => (
                  <li key={index}>{service.name}: {String(service.count)} kez</li>
                ))
              ) : (
                <li>Veri bulunamadı</li>
              )}
            </ol>
          </div>
        </div>
      </Card>
    </>
  );
};
