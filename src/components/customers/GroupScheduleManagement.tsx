import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCustomerSchedule, updateGroupSchedule, addGroupSchedule, getSchedulesByDayAndTime } from "@/utils/storage/groupSchedules";
import { toast } from "sonner";
import { Calendar, Users, Clock } from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

interface GroupScheduleManagementProps {
  customerId: string | number;
  customerName: string;
}

const GroupScheduleManagement = ({ customerId, customerName }: GroupScheduleManagementProps) => {
  const queryClient = useQueryClient();
  const [selectedGroup, setSelectedGroup] = useState<'A' | 'B'>('A');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('07:00');

  const { data: currentSchedule, isLoading } = useQuery({
    queryKey: ['customerSchedule', customerId],
    queryFn: () => getCustomerSchedule(customerId),
  });

  // Çalışma saatleri: 07:00-21:00
  const timeSlots = Array.from({ length: 14 }, (_, i) => {
    const hour = 7 + i;
    return `${hour.toString().padStart(2, '0')}:00`;
  });

  const updateMutation = useMutation({
    mutationFn: async ({ group, timeSlot }: { group: 'A' | 'B'; timeSlot: string }) => {
      // Seçilen gün ve saate göre kontenjana bak
      const groupDays = group === 'A' ? [1, 3, 5] : [2, 4, 6]; // Hafta günleri
      
      // Herhangi bir günde kontenjan kontrolü (4 kişi max)
      for (const dayOfWeek of groupDays) {
        const existingSchedules = await getSchedulesByDayAndTime(dayOfWeek, timeSlot);
        if (existingSchedules.length >= 4) {
          throw new Error(`${group} grubu ${timeSlot} saati için kontenjan dolu!`);
        }
      }

      if (currentSchedule) {
        // Mevcut programı güncelle
        await updateGroupSchedule(currentSchedule.id, {
          group,
          timeSlot,
        });
      } else {
        // Yeni program oluştur
        await addGroupSchedule({
          customerId,
          customerName,
          group,
          timeSlot,
          startDate: new Date(),
          isActive: true,
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customerSchedule', customerId] });
      queryClient.invalidateQueries({ queryKey: ['groupSchedules'] });
      toast.success('Grup programı başarıyla güncellendi!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Bir hata oluştu!');
    },
  });

  const deactivateMutation = useMutation({
    mutationFn: async () => {
      if (!currentSchedule) return;
      await updateGroupSchedule(currentSchedule.id, {
        isActive: false,
        endDate: new Date(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customerSchedule', customerId] });
      queryClient.invalidateQueries({ queryKey: ['groupSchedules'] });
      toast.success('Grup programı iptal edildi!');
    },
  });

  const handleUpdateSchedule = () => {
    updateMutation.mutate({
      group: selectedGroup,
      timeSlot: selectedTimeSlot,
    });
  };

  if (isLoading) {
    return <div>Yükleniyor...</div>;
  }

  const getGroupDays = (group: 'A' | 'B') => {
    return group === 'A' 
      ? 'Pazartesi, Çarşamba, Cuma' 
      : 'Salı, Perşembe, Cumartesi';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Grup Antrenman Programı
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {currentSchedule && currentSchedule.isActive ? (
          <div className="space-y-4">
            <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Users className="h-4 w-4" />
                Mevcut Program
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Grup:</span>
                  <Badge>{currentSchedule.group} Grubu</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Günler:</span>
                  <span className="font-medium">{getGroupDays(currentSchedule.group)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Saat:</span>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span className="font-medium">{currentSchedule.timeSlot}</span>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Başlangıç:</span>
                  <span>{format(new Date(currentSchedule.startDate), 'd MMMM yyyy', { locale: tr })}</span>
                </div>
              </div>
            </div>

            <Button 
              variant="destructive" 
              onClick={() => deactivateMutation.mutate()}
              disabled={deactivateMutation.isPending}
              className="w-full"
            >
              Programı İptal Et
            </Button>
          </div>
        ) : (
          <div className="text-center text-muted-foreground py-4">
            Aktif grup programı bulunmuyor
          </div>
        )}

        <div className="border-t pt-6">
          <h3 className="font-semibold mb-4">
            {currentSchedule?.isActive ? 'Program Güncelle' : 'Yeni Program Oluştur'}
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Grup Seçimi</label>
              <Select value={selectedGroup} onValueChange={(value: 'A' | 'B') => setSelectedGroup(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A">
                    <div className="flex flex-col items-start">
                      <span className="font-medium">Grup A</span>
                      <span className="text-xs text-muted-foreground">Pazartesi, Çarşamba, Cuma</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="B">
                    <div className="flex flex-col items-start">
                      <span className="font-medium">Grup B</span>
                      <span className="text-xs text-muted-foreground">Salı, Perşembe, Cumartesi</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Saat Seçimi</label>
              <Select value={selectedTimeSlot} onValueChange={setSelectedTimeSlot}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {timeSlots.map((slot) => (
                    <SelectItem key={slot} value={slot}>
                      {slot} - {parseInt(slot.split(':')[0]) + 1}:00
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-2">
                Her saat dilimi maksimum 4 kişilik gruptur
              </p>
            </div>

            <Button 
              onClick={handleUpdateSchedule}
              disabled={updateMutation.isPending}
              className="w-full"
            >
              {updateMutation.isPending ? 'Kaydediliyor...' : 'Kaydet'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default GroupScheduleManagement;
