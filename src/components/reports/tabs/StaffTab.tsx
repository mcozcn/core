
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import StaffPerformanceReport from "@/components/reports/StaffPerformanceReport";

export const StaffTab = () => {
  return (
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
  );
};
