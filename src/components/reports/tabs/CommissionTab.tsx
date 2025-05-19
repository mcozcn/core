
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import CommissionReport from "@/components/reports/CommissionReport";

export const CommissionTab = () => {
  return (
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
  );
};
