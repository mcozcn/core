
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import ServiceProfitLossAnalysis from "@/components/dashboard/ServiceProfitLossAnalysis";
import TopSellingServices from "@/components/reports/TopSellingServices";

export const ServicesTab = () => {
  return (
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
  );
};
