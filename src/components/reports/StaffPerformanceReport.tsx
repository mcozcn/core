
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
import { Loader2, Users } from "lucide-react";

const StaffPerformanceReport = () => {
  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date(),
    to: addDays(new Date(), 30),
  });
  
  // Query with detailed error handling
  const { data: staffPerformance = [], isLoading, error, refetch } = useQuery({
    queryKey: ['staffPerformance', date?.from?.toISOString(), date?.to?.toISOString()],
    queryFn: async () => {
      console.log('🔄 Fetching staff performance data...');
      const data = await getStaffPerformance();
      console.log('📊 Staff performance data received:', data);
      return data;
    },
    retry: 2,
    retryDelay: 1000,
  });

  console.log('📈 Staff Performance Report - Current data:', {
    isLoading,
    error,
    dataLength: staffPerformance?.length || 0,
    staffPerformance
  });

  if (error) {
    console.error('❌ Error in StaffPerformanceReport:', error);
  }

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
      
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin mr-3" />
          <span>Performans verileri yükleniyor...</span>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <div className="text-red-500 mb-4">⚠️ Veri yüklenirken hata oluştu</div>
          <button 
            onClick={() => refetch()} 
            className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
          >
            Tekrar Dene
          </button>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Personel</TableHead>
              <TableHead>Rol</TableHead>
              <TableHead className="text-right">Randevular</TableHead>
              <TableHead className="text-right">Hizmetler</TableHead>
              <TableHead className="text-right">Gelir</TableHead>
              <TableHead className="text-right">Komisyon</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {staffPerformance.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-10">
                  <div className="flex flex-col items-center gap-3">
                    <Users className="h-12 w-12 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Personel performans verisi bulunamadı</p>
                      <p className="text-sm">Personel ekleyip randevu ve satış işlemleri yapın</p>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              staffPerformance.map((staff) => (
                <TableRow key={staff.id}>
                  <TableCell className="font-medium">{staff.name}</TableCell>
                  <TableCell>
                    <span className="px-2 py-1 bg-muted rounded-full text-sm">
                      {staff.role}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex flex-col">
                      <span className="font-medium">{staff.appointmentsCount}</span>
                      <span className="text-xs text-muted-foreground">
                        {staff.confirmedAppointments} onay
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">{staff.servicesProvided}</TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(staff.totalRevenue)}
                  </TableCell>
                  <TableCell className="text-right font-medium text-green-600">
                    {formatCurrency(staff.totalCommission)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      )}
    </Card>
  );
};

export default StaffPerformanceReport;
