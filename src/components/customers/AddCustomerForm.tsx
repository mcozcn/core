
import React, { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DialogFooter } from "@/components/ui/dialog";
import { getCustomers, setCustomers, type Customer } from '@/utils/storage';
import { Textarea } from "@/components/ui/textarea";

interface AddCustomerFormProps {
  onSuccess?: () => void;
}

const AddCustomerForm = ({ onSuccess }: AddCustomerFormProps) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

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

      toast({
        title: "Müşteri eklendi",
        description: "Yeni müşteri başarıyla eklendi.",
      });

      // Reset form
      setName('');
      setPhone('');
      setEmail('');
      setAddress('');
      setNotes('');

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

      <DialogFooter className="pt-4">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Ekleniyor...' : 'Müşteri Ekle'}
        </Button>
      </DialogFooter>
    </form>
  );
};

export default AddCustomerForm;
