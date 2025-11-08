import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { getGroupSchedules } from "@/utils/storage/groupSchedules";
import { format, addWeeks, subWeeks, startOfWeek, endOfWeek, addDays } from "date-fns";
import { tr } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Printer } from "lucide-react";

const Calendar = () => {
  const [currentWeek, setCurrentWeek] = useState<Date>(new Date());

  const { data: schedules = [] } = useQuery({
    queryKey: ['groupSchedules'],
    queryFn: getGroupSchedules,
  });

  const weekStart = startOfWeek(currentWeek, { locale: tr });
  const weekEnd = endOfWeek(currentWeek, { locale: tr });

  const goToNextWeek = () => setCurrentWeek(addWeeks(currentWeek, 1));
  const goToPreviousWeek = () => setCurrentWeek(subWeeks(currentWeek, 1));
  const goToCurrentWeek = () => setCurrentWeek(new Date());

  const handlePrint = () => {
    const printContent = document.getElementById('calendar-content');
    if (!printContent) return;
    
    const printWindow = window.open('', '', 'height=600,width=800');
    if (!printWindow) return;
    
    printWindow.document.write('<html><head><title>Grup Takvimi</title>');
    printWindow.document.write('<style>body{font-family:Arial,sans-serif;margin:20px;}table{width:100%;border-collapse:collapse;}th,td{border:1px solid #ddd;padding:8px;text-align:center;}th{background-color:#f4f4f4;}.customer-name{font-size:12px;padding:4px;margin:2px;background:#e3f2fd;border-radius:4px;}.capacity{color:#666;font-size:11px;}</style>');
    printWindow.document.write('</head><body>');
    printWindow.document.write(printContent.innerHTML);
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.print();
  };

  // Çalışma günleri: Pazartesi-Cumartesi
  const workingDays = Array.from({ length: 6 }, (_, i) => {
    const day = addDays(weekStart, i + 1); // +1 to skip Sunday
    return day;
  });

  // Çalışma saatleri: 07:00-21:00
  const workingHours = Array.from({ length: 14 }, (_, i) => {
    const hour = 7 + i;
    return `${hour.toString().padStart(2, '0')}:00`;
  });

  const getSchedulesForSlot = (day: Date, timeSlot: string) => {
    const dayOfWeek = day.getDay(); // 0=Pazar, 1=Pazartesi, ..., 6=Cumartesi
    
    return schedules.filter(schedule => {
      if (!schedule.isActive) return false;
      if (schedule.timeSlot !== timeSlot) return false;
      
      const group = schedule.group;
      // Grup A: Pazartesi(1), Çarşamba(3), Cuma(5)
      // Grup B: Salı(2), Perşembe(4), Cumartesi(6)
      const matchesDay = (group === 'A' && [1, 3, 5].includes(dayOfWeek)) ||
                         (group === 'B' && [2, 4, 6].includes(dayOfWeek));
      
      return matchesDay;
    });
  };

  const getGroupLabel = (day: Date) => {
    const dayOfWeek = day.getDay();
    if ([1, 3, 5].includes(dayOfWeek)) return 'Grup A';
    if ([2, 4, 6].includes(dayOfWeek)) return 'Grup B';
    return '';
  };

  return (
    <div className="p-6 pl-72 animate-fadeIn">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-serif">Grup Takvimi</h1>
          <p className="text-muted-foreground mt-1">Haftalık grup antrenman programı</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              {format(weekStart, 'd MMMM', { locale: tr })} - {format(weekEnd, 'd MMMM yyyy', { locale: tr })}
            </CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={goToPreviousWeek}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={goToCurrentWeek}>
                Bugün
              </Button>
              <Button variant="outline" size="sm" onClick={goToNextWeek}>
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={handlePrint}>
                <Printer className="h-4 w-4 mr-2" />
                Yazdır
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div id="calendar-content" className="overflow-x-auto">
            <div className="min-w-[1000px]">
              {/* Başlıklar */}
              <div className="grid grid-cols-7 gap-2 mb-4">
                <div className="font-semibold text-center text-sm p-2 bg-muted rounded">Saat</div>
                {workingDays.map((day) => (
                  <div key={day.toString()} className="font-semibold text-center text-sm p-2 bg-muted rounded">
                    <div>{format(day, 'EEEE', { locale: tr })}</div>
                    <div className="text-xs text-muted-foreground">{format(day, 'd MMMM', { locale: tr })}</div>
                    <div className="text-xs font-normal text-primary mt-1">{getGroupLabel(day)}</div>
                  </div>
                ))}
              </div>

              {/* Saat slotları */}
              {workingHours.map((hour) => (
                <div key={hour} className="grid grid-cols-7 gap-2 mb-2">
                  <div className="text-center py-2 text-sm font-medium bg-muted/50 rounded flex items-center justify-center">
                    {hour}
                  </div>
                  {workingDays.map((day) => {
                    const slotSchedules = getSchedulesForSlot(day, hour);
                    const capacity = 4;
                    const filled = slotSchedules.length;
                    const available = capacity - filled;

                    return (
                      <div 
                        key={`${day}-${hour}`} 
                        className={`border rounded p-2 min-h-[80px] ${
                          filled >= capacity 
                            ? 'bg-destructive/10 border-destructive/20' 
                            : filled > 0 
                            ? 'bg-primary/5 border-primary/20' 
                            : 'bg-background border-border'
                        }`}
                      >
                        <div className="space-y-1">
                          {slotSchedules.map((schedule) => (
                            <div 
                              key={schedule.id}
                              className="text-xs p-1.5 bg-primary/20 rounded truncate"
                              title={schedule.customerName}
                            >
                              {schedule.customerName}
                            </div>
                          ))}
                          <div className="text-xs text-muted-foreground text-center mt-2">
                            {available > 0 ? `${available} kontenjan` : 'Dolu'}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}

              {/* Legends */}
              <div className="mt-6 flex gap-4 justify-center text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-background border border-border rounded"></div>
                  <span>Boş</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-primary/5 border border-primary/20 rounded"></div>
                  <span>Kısmi Dolu</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-destructive/10 border border-destructive/20 rounded"></div>
                  <span>Tam Dolu</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Calendar;
