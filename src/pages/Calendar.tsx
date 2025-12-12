import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { getGroupSchedules } from "@/utils/storage/groupSchedules";
import { format, addWeeks, subWeeks, startOfWeek, addDays } from "date-fns";
import { tr } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Printer, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import GroupScheduleManagement from "@/components/customers/GroupScheduleManagement";

const Calendar = () => {
  const [currentWeek, setCurrentWeek] = useState<Date>(new Date());
  const [selectedCustomer, setSelectedCustomer] = useState<{ id: number; name: string } | null>(null);

  const { data: schedules = [] } = useQuery({
    queryKey: ['groupSchedules'],
    queryFn: getGroupSchedules,
  });

  // Pazartesi ile başla (weekStartsOn: 1)
  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });

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

  // Çalışma günleri: Pazartesi-Cumartesi (weekStart zaten Pazartesi)
  const workingDays = Array.from({ length: 6 }, (_, i) => {
    return addDays(weekStart, i); // Pazartesi'den başla
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

  const weekEnd = addDays(weekStart, 5); // Cumartesi

  return (
    <div className="p-4 md:p-6 md:pl-72 animate-fadeIn">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-4 md:mb-6 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-serif">Grup Takvimi</h1>
          <p className="text-sm md:text-base text-muted-foreground mt-1">Haftalık grup antrenman programı</p>
        </div>
      </div>

      <Card>
        <CardHeader className="p-3 md:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <CardTitle className="flex items-center gap-2 text-sm md:text-base">
              <CalendarIcon className="h-4 w-4 md:h-5 md:w-5" />
              <span className="truncate">{format(weekStart, 'd MMM', { locale: tr })} - {format(weekEnd, 'd MMM yyyy', { locale: tr })}</span>
            </CardTitle>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={goToPreviousWeek}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={goToCurrentWeek}>
                Bugün
              </Button>
              <Button variant="outline" size="sm" onClick={goToNextWeek}>
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={handlePrint} className="hidden sm:flex">
                <Printer className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Yazdır</span>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-2 md:p-6">
          <div id="calendar-content" className="overflow-x-auto -mx-2 md:mx-0 scrollbar-hide">
            <div className="min-w-[800px] px-2 md:px-0">
              {/* Başlıklar */}
              <div className="grid grid-cols-7 gap-1 md:gap-2 mb-2 md:mb-4">
                <div className="font-semibold text-center text-xs md:text-sm p-1.5 md:p-2 bg-muted rounded">Saat</div>
                {workingDays.map((day) => (
                  <div key={day.toString()} className="font-semibold text-center text-xs md:text-sm p-1.5 md:p-2 bg-muted rounded">
                    <div className="truncate">{format(day, 'EEE', { locale: tr })}</div>
                    <div className="text-[10px] md:text-xs text-muted-foreground">{format(day, 'd MMM', { locale: tr })}</div>
                    <div className="text-[10px] md:text-xs font-normal text-primary mt-0.5 md:mt-1">{getGroupLabel(day)}</div>
                  </div>
                ))}
              </div>

              {/* Saat slotları */}
              {workingHours.map((hour) => (
                <div key={hour} className="grid grid-cols-7 gap-1 md:gap-2 mb-1 md:mb-2">
                  <div className="text-center py-1.5 md:py-2 text-xs md:text-sm font-medium bg-muted/50 rounded flex items-center justify-center">
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
                        className={`border rounded p-1 md:p-2 min-h-[60px] md:min-h-[80px] ${
                          filled >= capacity 
                            ? 'bg-destructive/10 border-destructive/20' 
                            : filled > 0 
                            ? 'bg-primary/5 border-primary/20' 
                            : 'bg-background border-border'
                        }`}
                      >
                        <div className="space-y-0.5 md:space-y-1">
                          {slotSchedules.map((schedule) => (
                            <div 
                              key={schedule.id}
                              className="group relative text-[10px] md:text-xs p-1 md:p-1.5 bg-primary/20 hover:bg-primary/30 rounded truncate cursor-pointer transition-colors"
                              onClick={() => setSelectedCustomer({ id: schedule.customerId, name: schedule.customerName })}
                              title="Üye programını düzenlemek için tıklayın"
                            >
                              <span className="font-medium truncate block">{schedule.customerName}</span>
                              <button
                                className="absolute right-0.5 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity p-0.5 hover:bg-destructive/20 rounded"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedCustomer({ id: schedule.customerId, name: schedule.customerName });
                                }}
                              >
                                <X className="h-2.5 w-2.5 md:h-3 md:w-3" />
                              </button>
                            </div>
                          ))}
                          <div className="text-[10px] md:text-xs text-muted-foreground text-center mt-1 md:mt-2">
                            {available > 0 ? `${available} yer` : 'Dolu'}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}

              {/* Legends */}
              <div className="mt-4 md:mt-6 flex flex-wrap gap-2 md:gap-4 justify-center text-xs md:text-sm">
                <div className="flex items-center gap-1 md:gap-2">
                  <div className="w-3 h-3 md:w-4 md:h-4 bg-background border border-border rounded"></div>
                  <span>Boş</span>
                </div>
                <div className="flex items-center gap-1 md:gap-2">
                  <div className="w-3 h-3 md:w-4 md:h-4 bg-primary/5 border border-primary/20 rounded"></div>
                  <span>Kısmi</span>
                </div>
                <div className="flex items-center gap-1 md:gap-2">
                  <div className="w-3 h-3 md:w-4 md:h-4 bg-destructive/10 border border-destructive/20 rounded"></div>
                  <span>Dolu</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Üye Programı Düzenleme Dialog */}
      <Dialog open={!!selectedCustomer} onOpenChange={(open) => !open && setSelectedCustomer(null)}>
        <DialogContent className="w-[95vw] max-w-[500px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Üye Programını Düzenle</DialogTitle>
          </DialogHeader>
          {selectedCustomer && (
            <GroupScheduleManagement
              customerId={selectedCustomer.id}
              customerName={selectedCustomer.name}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Calendar;
