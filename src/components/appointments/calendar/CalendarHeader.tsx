
import { Button } from "@/components/ui/button";
import { Calendar, Printer } from "lucide-react";
import { DateRange } from "react-day-picker";
import { format, startOfWeek, endOfWeek, addWeeks, subWeeks } from "date-fns";
import { tr } from 'date-fns/locale';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface CalendarHeaderProps {
  dateRange: DateRange;
  onPreviousWeek: () => void;
  onNextWeek: () => void;
  onCurrentWeek: () => void;
  onPrint: () => void;
}

const CalendarHeader = ({ 
  dateRange, 
  onPreviousWeek, 
  onNextWeek, 
  onCurrentWeek, 
  onPrint 
}: CalendarHeaderProps) => {
  return (
    <div className="flex flex-wrap justify-between items-center gap-3 mb-4">
      <div className="flex items-center gap-2">
        <div className="flex items-center rounded-md border shadow-sm">
          <Button 
            variant="ghost" 
            size="sm"
            className="rounded-r-none border-r"
            onClick={onPreviousWeek}
          >
            &#8592; Önceki Hafta
          </Button>
          
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="sm" className="flex gap-2">
                <Calendar className="h-4 w-4" />
                <span className="hidden sm:inline">
                  {format(dateRange.from!, 'd MMM', { locale: tr })} - {format(dateRange.to!, 'd MMM', { locale: tr })}
                </span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <div className="p-3">
                <div className="space-y-2">
                  <div className="grid gap-2">
                    <Button 
                      variant="outline" 
                      onClick={onCurrentWeek}
                      size="sm"
                    >
                      Bu Haftaya Git
                    </Button>
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
          
          <Button 
            variant="ghost" 
            size="sm"
            className="rounded-l-none border-l"
            onClick={onNextWeek}
          >
            Sonraki Hafta &#8594;
          </Button>
        </div>
      </div>
      
      <Button 
        variant="outline" 
        size="sm"
        onClick={onPrint}
        className="gap-2"
      >
        <Printer className="h-4 w-4" />
        Yazdır
      </Button>
    </div>
  );
};

export default CalendarHeader;
