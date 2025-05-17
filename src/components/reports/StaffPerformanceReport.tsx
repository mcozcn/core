
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { getStaffPerformance } from "@/utils/storage/staff";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency } from "@/utils/format";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { DateRange } from "react-day-picker";
import { addDays } from "date-fns";

const StaffPerformanceReport = () => {
  const [period, setPeriod] = useState("30"); // Keep period for backward compatibility
  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date(),
    to: addDays(new Date(), 30),
  });
  
  // Use date range in query key for refetching when date range changes
  const { data: staffPerformance = [] } = useQuery({
    queryKey: ['staffPerformance', date?.from?.toISOString(), date?.to?.toISOString()],
    queryFn: () => getStaffPerformance(),
  });

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold">Personel Performans Raporu</h3>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <DatePickerWithRange 
            date={date} 
            setDate={setDate} 
          />
        </div>
      </div>
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Personel</TableHead>
            <TableHead>Rol</TableHead>
            <TableHead className="text-right">Verilen Hizmet</TableHead>
            <TableHead className="text-right">Gelir</TableHead>
            <TableHead className="text-right">Ortalama Değerlendirme</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {staffPerformance.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-muted-foreground py-10">
                Bu periyotta personel performans verisi bulunamadı.
              </TableCell>
            </TableRow>
          ) : (
            staffPerformance.map((staff) => (
              <TableRow key={staff.id}>
                <TableCell className="font-medium">{staff.name}</TableCell>
                <TableCell>{staff.role}</TableCell>
                <TableCell className="text-right">{staff.servicesProvided}</TableCell>
                <TableCell className="text-right">{formatCurrency(staff.totalRevenue)}</TableCell>
                <TableCell className="text-right">{staff.avgRating}/5</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </Card>
  );
};

export default StaffPerformanceReport;
