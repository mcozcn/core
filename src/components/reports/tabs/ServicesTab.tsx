
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, TrendingUp, Scissors, DollarSign } from "lucide-react";
import ServiceProfitLossAnalysis from "@/components/dashboard/ServiceProfitLossAnalysis";
import TopSellingServices from "@/components/reports/TopSellingServices";
import ServicePieChart from "@/components/reports/charts/ServicePieChart";
import ServiceRevenueChart from "@/components/reports/charts/ServiceRevenueChart";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { getServiceSales, getCosts } from "@/utils/localStorage";

export const ServicesTab = () => {
  const { toast } = useToast();

  const { data: serviceSales = [] } = useQuery({
    queryKey: ['serviceSales'],
    queryFn: getServiceSales,
  });

  const { data: costs = [] } = useQuery({
    queryKey: ['costs'],
    queryFn: getCosts,
  });

  // Calculate real statistics
  const calculateStats = () => {
    const totalServices = new Set(serviceSales.map(sale => sale.serviceId)).size;
    const totalRevenue = serviceSales.reduce((sum, sale) => sum + sale.price, 0);
    const totalCosts = costs.reduce((sum, cost) => sum + cost.amount, 0);
    const profitMargin = totalRevenue > 0 ? ((totalRevenue - totalCosts) / totalRevenue) * 100 : 0;

    return {
      totalServices,
      totalRevenue,
      profitMargin
    };
  };

  const stats = calculateStats();

  const handleDetailClick = (reportType: string) => {
    toast({
      title: "Detay Raporu",
      description: `${reportType} detay raporu açılıyor...`,
    });
  };

  const handleDownloadPDF = (reportType: string) => {
    toast({
      title: "PDF İndiriliyor",
      description: `${reportType} raporu PDF olarak indiriliyor...`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 bg-gradient-to-r from-pink-50 to-pink-100 border-pink-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-pink-500 rounded-lg">
              <Scissors className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-pink-600 font-medium">Toplam Hizmet</p>
              <p className="text-2xl font-bold text-pink-700">{stats.totalServices}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4 bg-gradient-to-r from-emerald-50 to-emerald-100 border-emerald-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500 rounded-lg">
              <DollarSign className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-emerald-600 font-medium">Toplam Gelir</p>
              <p className="text-2xl font-bold text-emerald-700">₺{stats.totalRevenue.toLocaleString('tr-TR')}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4 bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-500 rounded-lg">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-orange-600 font-medium">Kar Marjı</p>
              <p className="text-2xl font-bold text-orange-700">{stats.profitMargin.toFixed(1)}%</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-xl font-semibold mb-2">Hizmet Satış Dağılımı</h3>
              <p className="text-sm text-muted-foreground">En çok tercih edilen hizmetler</p>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleDetailClick("Hizmet Satış Dağılımı")}
              >
                <FileText className="h-4 w-4 mr-2" />
                Detay
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleDownloadPDF("Hizmet Satış Dağılımı")}
              >
                PDF
              </Button>
            </div>
          </div>
          <div className="h-[300px]">
            <ServicePieChart />
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-xl font-semibold mb-2">Hizmet Gelir Trendi</h3>
              <p className="text-sm text-muted-foreground">Aylık hizmet geliri</p>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleDetailClick("Hizmet Gelir Trendi")}
              >
                <FileText className="h-4 w-4 mr-2" />
                Detay
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleDownloadPDF("Hizmet Gelir Trendi")}
              >
                PDF
              </Button>
            </div>
          </div>
          <div className="h-[300px]">
            <ServiceRevenueChart />
          </div>
        </Card>
      </div>

      {/* Detailed Analysis Section */}
      <div className="grid grid-cols-1 gap-6">
        <Card className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-xl font-semibold mb-2">Hizmet Kâr/Zarar Analizi</h3>
              <p className="text-sm text-muted-foreground">Detaylı karlılık analizi</p>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleDetailClick("Hizmet Kâr/Zarar Analizi")}
              >
                <FileText className="h-4 w-4 mr-2" />
                Detay
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleDownloadPDF("Hizmet Kâr/Zarar Analizi")}
              >
                PDF
              </Button>
            </div>
          </div>
          <div className="min-h-[300px]">
            <ServiceProfitLossAnalysis />
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-xl font-semibold mb-2">En Çok Satan Hizmetler</h3>
              <p className="text-sm text-muted-foreground">Hizmet performansı sıralaması</p>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleDetailClick("En Çok Satan Hizmetler")}
              >
                <FileText className="h-4 w-4 mr-2" />
                Detay
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleDownloadPDF("En Çok Satan Hizmetler")}
              >
                PDF
              </Button>
            </div>
          </div>
          <div className="min-h-[400px] overflow-auto">
            <TopSellingServices />
          </div>
        </Card>
      </div>
    </div>
  );
};
