
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, TrendingUp, Package, DollarSign } from "lucide-react";
import ProductProfitLossAnalysis from "@/components/dashboard/ProductProfitLossAnalysis";
import TopSellingProducts from "@/components/reports/TopSellingProducts";
import ProductPieChart from "@/components/reports/charts/ProductPieChart";
import ProductRevenueChart from "@/components/reports/charts/ProductRevenueChart";
import { useToast } from "@/hooks/use-toast";

export const ProductsTab = () => {
  const { toast } = useToast();

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
        <Card className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500 rounded-lg">
              <Package className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-blue-600 font-medium">Toplam Ürün</p>
              <p className="text-2xl font-bold text-blue-700">247</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4 bg-gradient-to-r from-green-50 to-green-100 border-green-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500 rounded-lg">
              <DollarSign className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-green-600 font-medium">Toplam Gelir</p>
              <p className="text-2xl font-bold text-green-700">₺45,230</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4 bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500 rounded-lg">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-purple-600 font-medium">Kar Marjı</p>
              <p className="text-2xl font-bold text-purple-700">34.5%</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-xl font-semibold mb-2">Ürün Satış Dağılımı</h3>
              <p className="text-sm text-muted-foreground">En çok satan ürünlerin dağılımı</p>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleDetailClick("Ürün Satış Dağılımı")}
              >
                <FileText className="h-4 w-4 mr-2" />
                Detay
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleDownloadPDF("Ürün Satış Dağılımı")}
              >
                PDF
              </Button>
            </div>
          </div>
          <div className="h-[300px]">
            <ProductPieChart />
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-xl font-semibold mb-2">Gelir Trendi</h3>
              <p className="text-sm text-muted-foreground">Aylık gelir değişimi</p>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleDetailClick("Gelir Trendi")}
              >
                <FileText className="h-4 w-4 mr-2" />
                Detay
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleDownloadPDF("Gelir Trendi")}
              >
                PDF
              </Button>
            </div>
          </div>
          <div className="h-[300px]">
            <ProductRevenueChart />
          </div>
        </Card>
      </div>

      {/* Detailed Analysis Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-xl font-semibold mb-2">Ürün Kâr/Zarar Analizi</h3>
              <p className="text-sm text-muted-foreground">Detaylı karlılık analizi</p>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleDetailClick("Ürün Kâr/Zarar Analizi")}
              >
                <FileText className="h-4 w-4 mr-2" />
                Detay
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleDownloadPDF("Ürün Kâr/Zarar Analizi")}
              >
                PDF
              </Button>
            </div>
          </div>
          <div className="h-[400px]">
            <ProductProfitLossAnalysis />
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-xl font-semibold mb-2">En Çok Satan Ürünler</h3>
              <p className="text-sm text-muted-foreground">Satış performansı sıralaması</p>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleDetailClick("En Çok Satan Ürünler")}
              >
                <FileText className="h-4 w-4 mr-2" />
                Detay
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleDownloadPDF("En Çok Satan Ürünler")}
              >
                PDF
              </Button>
            </div>
          </div>
          <div className="h-[400px]">
            <TopSellingProducts />
          </div>
        </Card>
      </div>
    </div>
  );
};
