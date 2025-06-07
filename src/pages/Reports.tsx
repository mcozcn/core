
import { useState } from "react";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { DateRange } from "react-day-picker";
import { addDays } from "date-fns";

// Import custom hooks
import { useReportStats } from "@/hooks/useReportStats";
import { useToast } from "@/hooks/use-toast";

// Import report components
import { ReportsHeader } from "@/components/reports/ReportsHeader";
import { ReportsTabs } from "@/components/reports/ReportsTabs";
import { ProductsTab } from "@/components/reports/tabs/ProductsTab";
import { ServicesTab } from "@/components/reports/tabs/ServicesTab";
import { CustomersTab } from "@/components/reports/tabs/CustomersTab";
import { StaffTab } from "@/components/reports/tabs/StaffTab";
import { CommissionTab } from "@/components/reports/tabs/CommissionTab";
import { SummaryTab } from "@/components/reports/tabs/SummaryTab";

const Reports = () => {
  const [activeTab, setActiveTab] = useState("products");
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: addDays(new Date(), -30),
    to: new Date(),
  });
  const [reportType, setReportType] = useState("all");
  const { toast } = useToast();

  // Get all the stats data using our custom hook
  const { weeklySummary, monthlySummary, topProducts, topServices } = useReportStats();

  const handleDownloadReport = () => {
    toast({
      title: "PDF İndiriliyor",
      description: `${getTabTitle(activeTab)} raporu PDF olarak indiriliyor...`,
    });
    
    // PDF indirme işlemi simülasyonu
    setTimeout(() => {
      toast({
        title: "İndirme Tamamlandı",
        description: "Rapor başarıyla indirildi.",
      });
    }, 2000);
  };

  const getTabTitle = (tab: string) => {
    switch (tab) {
      case "products": return "Ürün Analizi";
      case "services": return "Hizmet Analizi";
      case "customers": return "Müşteri Analizi";
      case "staff": return "Personel Performansı";
      case "commission": return "Hakediş";
      case "summary": return "Genel Özet";
      default: return "Rapor";
    }
  };

  return (
    <div className="p-8 pl-72 animate-fadeIn space-y-8">
      {/* Reports Header */}
      <ReportsHeader 
        dateRange={dateRange}
        setDateRange={setDateRange}
        reportType={reportType}
        setReportType={setReportType}
        handleDownloadReport={handleDownloadReport}
      />

      <Tabs 
        defaultValue="products" 
        className="space-y-6"
        value={activeTab}
        onValueChange={setActiveTab}
      >
        {/* Tabs Navigation */}
        <ReportsTabs activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Tab Contents */}
        <TabsContent value="products" className="space-y-8">
          <ProductsTab />
        </TabsContent>

        <TabsContent value="services" className="space-y-8">
          <ServicesTab />
        </TabsContent>

        <TabsContent value="customers" className="space-y-8">
          <CustomersTab />
        </TabsContent>

        <TabsContent value="staff" className="space-y-8">
          <StaffTab />
        </TabsContent>
        
        <TabsContent value="commission" className="space-y-8">
          <CommissionTab />
        </TabsContent>

        <TabsContent value="summary" className="space-y-8">
          <SummaryTab 
            weeklySummary={weeklySummary}
            monthlySummary={monthlySummary}
            topProducts={topProducts}
            topServices={topServices}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Reports;
