
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, PieChart } from "lucide-react";

interface ReportsTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const ReportsTabs = ({ activeTab, setActiveTab }: ReportsTabsProps) => {
  return (
    <TabsList className="bg-muted/20 p-1 grid grid-cols-2 md:grid-cols-6 w-full max-w-5xl gap-1">
      <TabsTrigger 
        value="products" 
        className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
      >
        <BarChart className="h-4 w-4" />
        <span className="hidden sm:inline">Ürün</span> Analizi
      </TabsTrigger>
      <TabsTrigger 
        value="services" 
        className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
      >
        <PieChart className="h-4 w-4" />
        <span className="hidden sm:inline">Hizmet</span> Analizi
      </TabsTrigger>
      <TabsTrigger 
        value="customers" 
        className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
      >
        Müşteri Analizi
      </TabsTrigger>
      <TabsTrigger 
        value="staff" 
        className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
      >
        Personel Performansı
      </TabsTrigger>
      <TabsTrigger 
        value="commission" 
        className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
      >
        Hakediş
      </TabsTrigger>
      <TabsTrigger 
        value="summary" 
        className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
      >
        Genel Özet
      </TabsTrigger>
    </TabsList>
  );
};
