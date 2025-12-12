
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, PieChart } from "lucide-react";

interface ReportsTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const ReportsTabs = ({ activeTab, setActiveTab }: ReportsTabsProps) => {
  return (
    <TabsList className="bg-muted/20 p-1 grid grid-cols-3 md:grid-cols-6 w-full max-w-5xl gap-1 h-auto">
      <TabsTrigger 
        value="products" 
        className="flex items-center gap-1 md:gap-2 text-xs md:text-sm py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
      >
        <BarChart className="h-3 w-3 md:h-4 md:w-4" />
        <span className="hidden sm:inline">Ürün</span>
      </TabsTrigger>
      <TabsTrigger 
        value="services" 
        className="flex items-center gap-1 md:gap-2 text-xs md:text-sm py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
      >
        <PieChart className="h-3 w-3 md:h-4 md:w-4" />
        <span className="hidden sm:inline">Hizmet</span>
      </TabsTrigger>
      <TabsTrigger 
        value="customers" 
        className="text-xs md:text-sm py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
      >
        Müşteri
      </TabsTrigger>
      <TabsTrigger 
        value="staff" 
        className="text-xs md:text-sm py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
      >
        Personel
      </TabsTrigger>
      <TabsTrigger 
        value="commission" 
        className="text-xs md:text-sm py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
      >
        Hakediş
      </TabsTrigger>
      <TabsTrigger 
        value="summary" 
        className="text-xs md:text-sm py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
      >
        Özet
      </TabsTrigger>
    </TabsList>
  );
};
