
import { useState } from "react";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import ServiceProfitLossAnalysis from "@/components/dashboard/ServiceProfitLossAnalysis";
import ProductProfitLossAnalysis from "@/components/dashboard/ProductProfitLossAnalysis";
import TopSellingProducts from "@/components/reports/TopSellingProducts";
import TopSellingServices from "@/components/reports/TopSellingServices";
import CustomerValueReport from "@/components/reports/CustomerValueReport";
import StaffPerformanceReport from "@/components/reports/StaffPerformanceReport";
import CommissionReport from "@/components/reports/CommissionReport";

const Reports = () => {
  return (
    <div className="p-8 pl-72 animate-fadeIn space-y-8">
      <h1 className="text-3xl font-serif">Performans Raporları</h1>

      <Tabs defaultValue="products" className="space-y-6">
        <TabsList className="grid grid-cols-6 w-full max-w-5xl">
          <TabsTrigger value="products">Ürün Analizi</TabsTrigger>
          <TabsTrigger value="services">Hizmet Analizi</TabsTrigger>
          <TabsTrigger value="customers">Müşteri Analizi</TabsTrigger>
          <TabsTrigger value="staff">Personel Performansı</TabsTrigger>
          <TabsTrigger value="commission">Hakediş</TabsTrigger>
          <TabsTrigger value="summary">Genel Özet</TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="space-y-8">
          <ProductProfitLossAnalysis />
          <TopSellingProducts />
        </TabsContent>

        <TabsContent value="services" className="space-y-8">
          <ServiceProfitLossAnalysis />
          <TopSellingServices />
        </TabsContent>

        <TabsContent value="customers" className="space-y-8">
          <CustomerValueReport />
        </TabsContent>

        <TabsContent value="staff" className="space-y-8">
          <StaffPerformanceReport />
        </TabsContent>
        
        <TabsContent value="commission" className="space-y-8">
          <CommissionReport />
        </TabsContent>

        <TabsContent value="summary" className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4">Haftalık Özet</h3>
              <p className="text-muted-foreground">Haftalık performans özetini görebilirsiniz.</p>
            </Card>
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4">Aylık Özet</h3>
              <p className="text-muted-foreground">Aylık performans özetini görebilirsiniz.</p>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Reports;
