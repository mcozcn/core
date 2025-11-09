import React, { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DialogFooter } from "@/components/ui/dialog";
import { getCustomers, setCustomers, type Customer, getMembershipPackages, saveMemberSubscription, getCustomerRecords, setCustomerRecords, type MembershipPackage, type CustomerRecord } from '@/utils/storage';
import { addGroupSchedule, getSchedulesByDayAndTime } from '@/utils/storage/groupSchedules';
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface AddCustomerFormProps {
  onSuccess?: () => void;
}

const AddCustomerForm = ({ onSuccess }: AddCustomerFormProps) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [membershipStartDate, setMembershipStartDate] = useState<Date>();
  const [selectedPackageId, setSelectedPackageId] = useState<string>('');
  const [selectedGroup, setSelectedGroup] = useState<'A' | 'B' | ''>('');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('');
  const [packages, setPackages] = useState<MembershipPackage[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const timeSlots = Array.from({ length: 14 }, (_, i) => {
    const hour = 7 + i;
    return `${hour.toString().padStart(2, '0')}:00`;
  });

  useEffect(() => {
    const loadPackages = async () => {
      const loadedPackages = await getMembershipPackages();
      setPackages(loadedPackages.filter(p => p.isActive));
    };
    loadPackages();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const newCustomer: Customer = {
        id: Date.now(),
        name,
        phone,
        email,
        address,
        notes,
        createdAt: new Date(),
      };

      console.log('Yeni müşteri oluşturuluyor:', newCustomer);

      const existingCustomers = await getCustomers();
      await setCustomers([...existingCustomers, newCustomer]);

      // Üyelik paketi seçildiyse, üyelik kaydı ve borç kaydı oluştur
      if (selectedPackageId && membershipStartDate) {
        const selectedPackage = packages.find(p => p.id.toString() === selectedPackageId);
        
        if (selectedPackage) {
          // Üyelik bitiş tarihini hesapla
          const endDate = new Date(membershipStartDate);
          endDate.setMonth(endDate.getMonth() + selectedPackage.duration);

          // Üyelik kaydı oluştur
          await saveMemberSubscription({
            memberId: newCustomer.id,
            memberName: newCustomer.name,
            packageId: selectedPackage.id,
            packageName: selectedPackage.name,
            packageType: selectedPackage.type,
            startDate: membershipStartDate,
            endDate: endDate,
            price: selectedPackage.price,
            isPaid: false,
            isActive: true,
            autoRenew: false,
          });

          // Müşteri carisine borç kaydı ekle
          const existingRecords = await getCustomerRecords();
          const debtRecord: CustomerRecord = {
            id: Date.now(),
            customerId: newCustomer.id,
            customerName: newCustomer.name,
            type: 'debt',
            recordType: 'debt',
            itemId: selectedPackage.id,
            itemName: selectedPackage.name,
            amount: selectedPackage.price,
            description: `${selectedPackage.name} - Üyelik Ücreti`,
            date: membershipStartDate,
            isPaid: false,
          };
          await setCustomerRecords([...existingRecords, debtRecord]);

          // Grup programı seçildiyse ekle
          if (selectedGroup && selectedTimeSlot) {
            // Kontenjan kontrolü
            const groupDays = selectedGroup === 'A' ? [1, 3, 5] : [2, 4, 6];
            let hasCapacity = true;

            for (const dayOfWeek of groupDays) {
              const existingSchedules = await getSchedulesByDayAndTime(dayOfWeek, selectedTimeSlot);
              if (existingSchedules.length >= 4) {
                hasCapacity = false;
                break;
              }
            }

            if (hasCapacity) {
              await addGroupSchedule({
                customerId: newCustomer.id,
                customerName: newCustomer.name,
                group: selectedGroup,
                timeSlot: selectedTimeSlot,
                startDate: membershipStartDate,
                isActive: true,
              });
              console.log('Grup programı oluşturuldu');
            } else {
              toast({
                variant: "destructive",
                title: "Uyarı",
                description: "Seçilen grup ve saat için kontenjan dolu! Grup programı oluşturulamadı.",
              });
            }
          }

          console.log('Üyelik kaydı ve borç kaydı oluşturuldu');
        }
      }

      // Grup programı seçildiyse ekle (üyelikten bağımsız)
      if (selectedGroup && selectedTimeSlot && !membershipStartDate) {
        // Kontenjan kontrolü
        const groupDays = selectedGroup === 'A' ? [1, 3, 5] : [2, 4, 6];
        let hasCapacity = true;

        for (const dayOfWeek of groupDays) {
          const existingSchedules = await getSchedulesByDayAndTime(dayOfWeek, selectedTimeSlot);
          if (existingSchedules.length >= 4) {
            hasCapacity = false;
            break;
          }
        }

        if (hasCapacity) {
          await addGroupSchedule({
            customerId: newCustomer.id,
            customerName: newCustomer.name,
            group: selectedGroup,
            timeSlot: selectedTimeSlot,
            startDate: new Date(), // Bugünü başlangıç tarihi olarak kullan
            isActive: true,
          });
          console.log('Grup programı oluşturuldu');
        } else {
          toast({
            variant: "destructive",
            title: "Uyarı",
            description: "Seçilen grup ve saat için kontenjan dolu! Grup programı oluşturulamadı.",
          });
        }
      }

      const hasGroupSchedule = selectedGroup && selectedTimeSlot;
      const hasMembership = selectedPackageId && membershipStartDate;

      toast({
        title: "Müşteri eklendi",
        description: hasMembership && hasGroupSchedule
          ? "Yeni müşteri, üyelik kaydı ve grup programı başarıyla oluşturuldu."
          : hasMembership
          ? "Yeni müşteri ve üyelik kaydı başarıyla oluşturuldu."
          : hasGroupSchedule
          ? "Yeni müşteri ve grup programı başarıyla oluşturuldu."
          : "Yeni müşteri başarıyla eklendi.",
      });

      // Reset form
      setName('');
      setPhone('');
      setEmail('');
      setAddress('');
      setNotes('');
      setMembershipStartDate(undefined);
      setSelectedPackageId('');
      setSelectedGroup('');
      setSelectedTimeSlot('');

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Müşteri eklenirken hata:", error);
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Müşteri eklenirken bir hata oluştu.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      
      <div className="space-y-2">
        <Label htmlFor="name">Müşteri Adı</Label>
        <Input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Müşteri adını girin"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Telefon</Label>
        <Input
          id="phone"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Telefon numarasını girin"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">E-posta</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="E-posta adresini girin"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Adres</Label>
        <Input
          id="address"
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Adres bilgisini girin"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notlar</Label>
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Müşteri hakkında notlar"
          className="min-h-[80px]"
        />
      </div>

      <div className="space-y-4 pt-4 border-t">
        <h4 className="font-medium text-sm">Üyelik Bilgileri (İsteğe Bağlı)</h4>
        
        <div className="space-y-2">
          <Label htmlFor="membershipPackage">Üyelik Paketi</Label>
          <Select value={selectedPackageId} onValueChange={setSelectedPackageId}>
            <SelectTrigger>
              <SelectValue placeholder="Üyelik paketi seçin" />
            </SelectTrigger>
            <SelectContent>
              {packages.map((pkg) => (
                <SelectItem key={pkg.id} value={pkg.id.toString()}>
                  {pkg.name} - {pkg.price.toFixed(2)} TL ({pkg.duration} ay)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Üyelik Başlama Tarihi</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !membershipStartDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {membershipStartDate ? format(membershipStartDate, "PPP") : <span>Tarih seçin</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={membershipStartDate}
                onSelect={setMembershipStartDate}
                initialFocus
                className={cn("p-3 pointer-events-auto")}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="space-y-4 pt-4 border-t">
        <h4 className="font-medium text-sm">Grup Takvimi (İsteğe Bağlı)</h4>
        
        <div className="space-y-2">
          <Label htmlFor="groupSelect">Grup Seçimi</Label>
          <Select value={selectedGroup} onValueChange={(value: 'A' | 'B' | '') => setSelectedGroup(value)}>
            <SelectTrigger>
              <SelectValue placeholder="Grup seçin" />
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

        {selectedGroup && (
          <div className="space-y-2">
            <Label htmlFor="timeSlot">Saat Seçimi</Label>
            <Select value={selectedTimeSlot} onValueChange={setSelectedTimeSlot}>
              <SelectTrigger>
                <SelectValue placeholder="Saat seçin (07:00 - 21:00)" />
              </SelectTrigger>
              <SelectContent>
                {timeSlots.map((slot) => (
                  <SelectItem key={slot} value={slot}>
                    {slot} - {parseInt(slot.split(':')[0]) + 1}:00
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Her saat dilimi maksimum 4 kişilik gruptur
            </p>
          </div>
        )}
      </div>

      <DialogFooter className="pt-4">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Ekleniyor...' : 'Müşteri Ekle'}
        </Button>
      </DialogFooter>
    </form>
  );
};

export default AddCustomerForm;
