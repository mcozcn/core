import React, { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DialogFooter } from "@/components/ui/dialog";
import { getCustomers, setCustomers, type Customer, getMembershipPackages, saveMemberSubscription, getCustomerRecords, setCustomerRecords, type MembershipPackage, type CustomerRecord } from '@/utils/storage';
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
  const [packages, setPackages] = useState<MembershipPackage[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

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

          console.log('Üyelik kaydı ve borç kaydı oluşturuldu');
        }
      }

      toast({
        title: "Müşteri eklendi",
        description: selectedPackageId && membershipStartDate 
          ? "Yeni müşteri ve üyelik kaydı başarıyla oluşturuldu." 
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

      <DialogFooter className="pt-4">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Ekleniyor...' : 'Müşteri Ekle'}
        </Button>
      </DialogFooter>
    </form>
  );
};

export default AddCustomerForm;
