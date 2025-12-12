
import { Button } from "@/components/ui/button";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { DateRange } from "react-day-picker";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Download } from "lucide-react";

interface ReportsHeaderProps {
  dateRange: DateRange | undefined;
  setDateRange: (date: DateRange | undefined) => void;
  reportType: string;
  setReportType: (type: string) => void;
  handleDownloadReport: () => void;
}

export const ReportsHeader = ({
  dateRange,
  setDateRange,
  reportType,
  setReportType,
  handleDownloadReport
}: ReportsHeaderProps) => {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl md:text-3xl font-serif">Performans Raporları</h1>
      
      <div className="flex flex-col sm:flex-row flex-wrap gap-2 md:gap-3">
        <DatePickerWithRange 
          date={dateRange} 
          setDate={setDateRange} 
        />
        
        <Select value={reportType} onValueChange={setReportType}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Rapor türü" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tüm Rapor</SelectItem>
            <SelectItem value="daily">Günlük Rapor</SelectItem>
            <SelectItem value="weekly">Haftalık Rapor</SelectItem>
            <SelectItem value="monthly">Aylık Rapor</SelectItem>
            <SelectItem value="yearly">Yıllık Rapor</SelectItem>
          </SelectContent>
        </Select>
        
        <Button onClick={handleDownloadReport} size="sm" className="w-full sm:w-auto">
          <Download className="mr-2 h-4 w-4" />
          PDF İndir
        </Button>
      </div>
    </div>
  );
};
