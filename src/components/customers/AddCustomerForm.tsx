import React, { useState } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { getCustomers, setCustomers, type Customer } from '@/utils/localStorage';

interface AddCustomerFormProps {
  onSuccess?: () => void;
}

const AddCustomerForm = ({ onSuccess }: AddCustomerFormProps) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newCustomer: Customer = {
      id: Date.now(),
      name,
      phone,
      email,
      createdAt: new Date(),
    };

    console.log('Yeni müşteri oluşturuluyor:', newCustomer);

    const existingCustomers = getCustomers();
    setCustomers([...existingCustomers, newCustomer]);

    toast({
      title: "Müşteri eklendi",
      description: "Yeni müşteri başarıyla eklendi.",
    });

    // Reset form
    setName('');
    setPhone('');
    setEmail('');

    if (onSuccess) {
      onSuccess();
    }
  };

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label>Müşteri Adı</Label>
          <Input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Müşteri adını girin"
            required
          />
        </div>

        <div>
          <Label>Telefon</Label>
          <Input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Telefon numarasını girin"
            required
          />
        </div>

        <div>
          <Label>E-posta</Label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="E-posta adresini girin"
          />
        </div>

        <Button type="submit" className="w-full">Müşteri Ekle</Button>
      </form>
    </Card>
  );
};

export default AddCustomerForm;