
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { DateRange } from "react-day-picker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface CommissionFiltersProps {
  selectedStaffId: string;
  setSelectedStaffId: (id: string) => void;
  staffUsers: any[];
  date: DateRange | undefined;
  setDate: (date: DateRange | undefined) => void;
}

export const CommissionFilters = ({
  selectedStaffId,
  setSelectedStaffId,
  staffUsers,
  date,
  setDate
}: CommissionFiltersProps) => {
  return (
    <div className="flex flex-col sm:flex-row gap-3 mt-3 sm:mt-0">
      <Select value={selectedStaffId} onValueChange={setSelectedStaffId}>
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Personel Seçin" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tüm Personeller</SelectItem>
          {staffUsers.map((user) => (
            <SelectItem key={user.id} value={user.id.toString()}>
              {user.displayName || user.username}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      <DatePickerWithRange 
        date={date} 
        setDate={setDate} 
      />
    </div>
  );
};
