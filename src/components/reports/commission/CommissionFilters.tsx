
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { DateRange } from "react-day-picker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface CommissionFiltersProps {
  selectedStaffId: string;
  setSelectedStaffId: (id: string) => void;
  staffUsers: any[];
  personnel?: any[]; // Personnel tablosundan gelen personeller
  date: DateRange | undefined;
  setDate: (date: DateRange | undefined) => void;
}

export const CommissionFilters = ({
  selectedStaffId,
  setSelectedStaffId,
  staffUsers,
  personnel = [],
  date,
  setDate
}: CommissionFiltersProps) => {
  // Hem users hem de personnel'i birleştir
  const allStaffOptions = [
    ...staffUsers.map(user => ({
      id: user.id.toString(),
      name: user.displayName || user.username,
      type: 'user'
    })),
    ...personnel.map(person => ({
      id: person.id.toString(),
      name: person.name,
      type: 'personnel'
    }))
  ];

  return (
    <div className="flex flex-col sm:flex-row gap-3 mt-3 sm:mt-0">
      <Select value={selectedStaffId} onValueChange={setSelectedStaffId}>
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Personel Seçin" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tüm Personeller</SelectItem>
          {allStaffOptions.map((staff) => (
            <SelectItem key={`${staff.type}-${staff.id}`} value={staff.id}>
              {staff.name} {staff.type === 'personnel' && '(Personel)'}
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
