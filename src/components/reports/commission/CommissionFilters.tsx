
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { DateRange } from "react-day-picker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface CommissionFiltersProps {
  selectedStaffId: string;
  setSelectedStaffId: (id: string) => void;
  staffUsers: any[];
  personnel?: any[];
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
  // Show personnel from personnel section primarily
  const allStaffOptions = [
    ...personnel.map(person => ({
      id: person.id.toString(),
      name: person.name,
      title: person.title,
      type: 'personnel'
    })),
    // Add users as fallback if no personnel exist
    ...staffUsers.map(user => ({
      id: user.id.toString(),
      name: user.displayName || user.username,
      title: 'Kullanıcı',
      type: 'user'
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
              {staff.name} {staff.title && `(${staff.title})`}
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
