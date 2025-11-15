import React, { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getCustomers, setCustomers, type Customer, getMembershipPackages, saveMemberSubscription, getCustomerRecords, setCustomerRecords, type MembershipPackage, type CustomerRecord } from '@/utils/storage';
import { addGroupSchedule, getSchedulesByDayAndTime } from '@/utils/storage/groupSchedules';
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

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
    
    // Validation
    if (!name.trim() || !phone.trim()) {
      toast({
        variant: "destructive",
        title: "Eksik Bilgi",
        description: "Lütfen ad ve telefon bilgilerini giriniz.",
      });
      return;
    }

    if (!membershipStartDate || !selectedPackageId) {
      toast({
        variant: "destructive",
        title: "Eksik Bilgi",
        description: "Lütfen üyelik bilgilerini eksiksiz giriniz.",
      });
      return;
    }

    if (!selectedGroup || !selectedTimeSlot) {
      toast({
        variant: "destructive",
        title: "Eksik Bilgi",
        description: "Lütfen grup takvimi bilgilerini eksiksiz giriniz.",
      });
      return;
    }
    
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
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Temel Bilgiler */}
        <Card>
          <CardHeader>
            <CardTitle>Temel Bilgiler</CardTitle>
            <CardDescription>Müşterinin temel iletişim bilgileri</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Ad Soyad *</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ad ve soyad girin"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Telefon *</Label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Telefon numarası girin"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-posta</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="E-posta adresi girin"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Adres</Label>
                <Input
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Adres girin"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notlar</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Notlar ekleyin"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Üyelik Bilgileri */}
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="text-primary">Üyelik Bilgileri *</CardTitle>
            <CardDescription>Müşteri için üyelik paketi ve tarihi seçin</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="package">Üyelik Paketi *</Label>
                <Select value={selectedPackageId} onValueChange={setSelectedPackageId} required>
                  <SelectTrigger id="package">
                    <SelectValue placeholder="Paket seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {packages.map((pkg) => (
                      <SelectItem key={pkg.id} value={pkg.id.toString()}>
                        {pkg.name} - {pkg.price}₺ ({pkg.duration} ay)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="start-date">Başlangıç Tarihi *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="start-date"
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !membershipStartDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {membershipStartDate ? format(membershipStartDate, "PPP") : "Tarih seçin"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={membershipStartDate}
                      onSelect={setMembershipStartDate}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Grup Takvimi */}
        <Card className="border-secondary/20">
          <CardHeader>
            <CardTitle className="text-secondary">Grup Takvimi *</CardTitle>
            <CardDescription>Müşteri için antrenman grubu ve saati belirleyin</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="group">Grup *</Label>
                <Select value={selectedGroup} onValueChange={(value) => setSelectedGroup(value as 'A' | 'B')} required>
                  <SelectTrigger id="group">
                    <SelectValue placeholder="Grup seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A">Grup A (Pazartesi-Çarşamba-Cuma)</SelectItem>
                    <SelectItem value="B">Grup B (Salı-Perşembe-Cumartesi)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="time-slot">Saat *</Label>
                <Select value={selectedTimeSlot} onValueChange={setSelectedTimeSlot} required>
                  <SelectTrigger id="time-slot">
                    <SelectValue placeholder="Saat seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeSlots.map((slot) => (
                      <SelectItem key={slot} value={slot}>
                        {slot}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Button type="submit" className="w-full h-12 text-base font-semibold" disabled={isSubmitting}>
          {isSubmitting ? 'Ekleniyor...' : 'Müşteri Ekle'}
        </Button>
      </form>
    </div>
  );
};

export default AddCustomerForm;
