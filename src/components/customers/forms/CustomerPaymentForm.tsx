import React, { useState } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useQueryClient } from "@tanstack/react-query";
import { getCustomerRecords, setCustomerRecords, type CustomerRecord } from '@/utils/localStorage';

interface CustomerPaymentFormProps {
  customerId: number;
  onSuccess?: () => void;
}

const CustomerPaymentForm = ({ customerId, onSuccess }: CustomerPaymentFormProps) => {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newRecord: CustomerRecord = {
      id: Date.now(),
      customerId,
      type: 'payment',
      itemId: 0,
      itemName: 'Ödeme',
      amount: -Number(amount), // Negative amount for payments
      date: new Date(),
      isPaid: true,
      description,
      recordType: 'payment'
    };

    console.log('Yeni ödeme kaydı oluşturuluyor:', newRecord);

    const existingRecords = getCustomerRecords();
    setCustomerRecords([...existingRecords, newRecord]);
    queryClient.invalidateQueries({ queryKey: ['customerRecords'] });

    toast({
      title: "Ödeme kaydedildi",
      description: `${amount} ₺ tutarında ödeme kaydedildi.`,
    });

    setAmount('');
    setDescription('');

    if (onSuccess) {
      onSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>Ödeme Tutarı (₺)</Label>
        <Input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Tutarı girin"
          required
        />
      </div>

      <div>
        <Label>Açıklama</Label>
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Açıklama ekleyin"
          className="min-h-[100px]"
        />
      </div>

      <Button type="submit" className="w-full">Ödeme Kaydet</Button>
    </form>
  );
};

export default CustomerPaymentForm;