
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { DateRange } from "react-day-picker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { getPersonnel } from "@/utils/storage/personnel";

interface CommissionFiltersProps {
  selectedStaffId: string;
  setSelectedStaffId: (id: string) => void;
  date: DateRange | undefined;
  setDate: (date: DateRange | undefined) => void;
}

export const CommissionFilters = ({
  selectedStaffId,
  setSelectedStaffId,
  date,
  setDate
}: CommissionFiltersProps) => {
  const { data: personnel = [] } = useQuery({
    queryKey: ['personnel'],
    queryFn: getPersonnel,
  });

  // Aktif personelleri filtrele
  const activePersonnel = personnel.filter(person => person.isActive);

  return (
    <div className="flex flex-col sm:flex-row gap-3 mt-3 sm:mt-0">
      <Select value={selectedStaffId} onValueChange={setSelectedStaffId}>
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Personel Seçin" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tüm Personeller</SelectItem>
          {activePersonnel.map((person) => (
            <SelectItem key={person.id} value={person.id.toString()}>
              {person.name}
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
