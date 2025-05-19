
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import ProductProfitLossAnalysis from "@/components/dashboard/ProductProfitLossAnalysis";
import TopSellingProducts from "@/components/reports/TopSellingProducts";

export const ProductsTab = () => {
  return (
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
  );
};
