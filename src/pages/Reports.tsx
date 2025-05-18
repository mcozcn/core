import { useState } from "react";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { DateRange } from "react-day-picker";
import { addDays } from "date-fns";
import ServiceProfitLossAnalysis from "@/components/dashboard/ServiceProfitLossAnalysis";
import ProductProfitLossAnalysis from "@/components/dashboard/ProductProfitLossAnalysis";
import TopSellingProducts from "@/components/reports/TopSellingProducts";
import TopSellingServices from "@/components/reports/TopSellingServices";
import CustomerValueReport from "@/components/reports/CustomerValueReport";
import StaffPerformanceReport from "@/components/reports/StaffPerformanceReport";
import CommissionReport from "@/components/reports/CommissionReport";
import { Download, FileText, BarChart, PieChart } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getSales, getServiceSales, getCosts } from "@/utils/storage";
import { formatCurrency } from "@/utils/format";

const Reports = () => {
  const [activeTab, setActiveTab] = useState("products");
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: addDays(new Date(), -30),
    to: new Date(),
  });
  const [reportType, setReportType] = useState("all");

  const { data: sales = [] } = useQuery({
    queryKey: ['sales'],
    queryFn: getSales,
  });

  const { data: serviceSales = [] } = useQuery({
    queryKey: ['serviceSales'],
    queryFn: getServiceSales,
  });

  const { data: costs = [] } = useQuery({
    queryKey: ['costs'],
    queryFn: getCosts,
  });

  // Calculate summary statistics based on real data
  const calculateSummaryStats = (days: number) => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    const periodSales = sales.filter(sale => 
      new Date(sale.saleDate || sale.date) >= cutoffDate
    );
    
    const periodServiceSales = serviceSales.filter(sale => 
      new Date(sale.saleDate) >= cutoffDate
    );
    
    const periodCosts = costs.filter(cost => 
      new Date(cost.date) >= cutoffDate
    );
    
    // Fix type issues by using Number() to ensure we're working with numbers
    const totalSales = periodSales.reduce((sum, sale) => sum + Number(sale.totalPrice || sale.total || 0), 0);
    const totalServiceSales = periodServiceSales.reduce((sum, sale) => sum + Number(sale.price || 0), 0);
    const totalCosts = periodCosts.reduce((sum, cost) => sum + Number(cost.amount || 0), 0);
    
    const uniqueCustomers = new Set();
    [...periodSales, ...periodServiceSales].forEach(sale => {
      if (sale.customerId) uniqueCustomers.add(sale.customerId);
    });
    
    return {
      totalSales: totalSales + totalServiceSales,
      customerCount: uniqueCustomers.size,
      appointmentCount: periodServiceSales.length,
      netProfit: totalSales + totalServiceSales - totalCosts
    };
  };

  const weeklySummary = calculateSummaryStats(7);
  const monthlySummary = calculateSummaryStats(30);

  // Get top selling items
  const getTopItems = (items: any[], count: number, nameKey: string) => {
    const itemCounts = items.reduce((acc, item) => {
      const name = item[nameKey];
      if (!name) return acc;
      acc[name] = (acc[name] || 0) + 1;
      return acc;
    }, {});
    
    return Object.entries(itemCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, count)
      .map(([name, count]) => ({ name, count }));
  };

  const topProducts = getTopItems(sales, 3, 'productName');
  const topServices = getTopItems(serviceSales, 3, 'serviceName');

  const handleDownloadReport = () => {
    // Burada PDF indirme işlemi gerçekleştirilecek
    console.log("Rapor indiriliyor:", activeTab, reportType, dateRange);
  };

  return (
    <div className="p-8 pl-72 animate-fadeIn space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-3xl font-serif">Performans Raporları</h1>
        
        <div className="flex flex-wrap gap-3">
          <DatePickerWithRange 
            date={dateRange} 
            setDate={setDateRange} 
          />
          
          <Select value={reportType} onValueChange={setReportType}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Rapor türü" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm Rapor</SelectItem>
              <SelectItem value="daily">Günlük Rapor</SelectItem>
              <SelectItem value="weekly">Haftalık Rapor</SelectItem>
              <SelectItem value="monthly">Aylık Rapor</SelectItem>
              <SelectItem value="yearly">Yıllık Rapor</SelectItem>
            </SelectContent>
          </Select>
          
          <Button onClick={handleDownloadReport}>
            <Download className="mr-2 h-4 w-4" />
            PDF İndir
          </Button>
        </div>
      </div>

      <Tabs 
        defaultValue="products" 
        className="space-y-6"
        value={activeTab}
        onValueChange={setActiveTab}
      >
        <TabsList className="bg-muted/20 p-1 grid grid-cols-2 md:grid-cols-6 w-full max-w-5xl gap-1">
          <TabsTrigger value="products" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <BarChart className="h-4 w-4" />
            <span className="hidden sm:inline">Ürün</span> Analizi
          </TabsTrigger>
          <TabsTrigger value="services" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <PieChart className="h-4 w-4" />
            <span className="hidden sm:inline">Hizmet</span> Analizi
          </TabsTrigger>
          <TabsTrigger value="customers" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            Müşteri Analizi
          </TabsTrigger>
          <TabsTrigger value="staff" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            Personel Performansı
          </TabsTrigger>
          <TabsTrigger value="commission" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            Hakediş
          </TabsTrigger>
          <TabsTrigger value="summary" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            Genel Özet
          </TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Ürün Kâr/Zarar Analizi</h3>
                <Button variant="outline" size="sm">
                  <FileText className="h-4 w-4 mr-2" />
                  Detay
                </Button>
              </div>
              <div className="h-[350px]">
                <ProductProfitLossAnalysis />
              </div>
            </Card>
            
            <Card className="p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">En Çok Satan Ürünler</h3>
                <Button variant="outline" size="sm">
                  <FileText className="h-4 w-4 mr-2" />
                  Detay
                </Button>
              </div>
              <div className="h-[350px]">
                <TopSellingProducts />
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="services" className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Hizmet Kâr/Zarar Analizi</h3>
                <Button variant="outline" size="sm">
                  <FileText className="h-4 w-4 mr-2" />
                  Detay
                </Button>
              </div>
              <div className="h-[350px]">
                <ServiceProfitLossAnalysis />
              </div>
            </Card>
            
            <Card className="p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">En Çok Satan Hizmetler</h3>
                <Button variant="outline" size="sm">
                  <FileText className="h-4 w-4 mr-2" />
                  Detay
                </Button>
              </div>
              <div className="h-[350px]">
                <TopSellingServices />
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="customers" className="space-y-8">
          <Card className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Müşteri Değer Analizi</h3>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Excel İndir
              </Button>
            </div>
            <CustomerValueReport />
          </Card>
        </TabsContent>

        <TabsContent value="staff" className="space-y-8">
          <Card className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Personel Performans Raporu</h3>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Excel İndir
              </Button>
            </div>
            <StaffPerformanceReport />
          </Card>
        </TabsContent>
        
        <TabsContent value="commission" className="space-y-8">
          <Card className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Personel Hakediş Raporu</h3>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Excel İndir
              </Button>
            </div>
            <CommissionReport />
          </Card>
        </TabsContent>

        <TabsContent value="summary" className="space-y-8">
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
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Reports;
