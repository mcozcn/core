
import { useState } from "react";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import UserPerformanceComponent from "@/components/users/UserPerformance";
import CommissionReport from "@/components/reports/CommissionReport";

const Performance = () => {
  return (
    <div className="p-8 pl-72 animate-fadeIn space-y-8">
      <h1 className="text-3xl font-serif">Personel Performans İzleme</h1>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid grid-cols-3 w-full max-w-md">
          <TabsTrigger value="overview">Genel Bakış</TabsTrigger>
          <TabsTrigger value="commission">Hakediş Detayları</TabsTrigger>
          <TabsTrigger value="activity">Aktivite Takibi</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-8">
          <UserPerformanceComponent />
        </TabsContent>

        <TabsContent value="commission" className="space-y-8">
          <CommissionReport />
        </TabsContent>

        <TabsContent value="activity" className="space-y-8">
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4">Personel Aktivite Detayları</h3>
            <p className="text-muted-foreground mb-6">
              Personellerin günlük aktivitelerini ve performans metriklerini detaylı olarak takip edin.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="p-4 bg-accent/20">
                <h4 className="font-medium mb-2">Randevu Tamamlama Oranı</h4>
                <p className="text-3xl font-bold">%94.2</p>
              </Card>
              
              <Card className="p-4 bg-accent/20">
                <h4 className="font-medium mb-2">Müşteri Memnuniyet Oranı</h4>
                <p className="text-3xl font-bold">4.8/5</p>
              </Card>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Performance;
