import React, { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DialogFooter } from "@/components/ui/dialog";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getCustomerRecords, addCustomerRecord, updateCustomerRecord, type CustomerRecord } from '@/utils/storage';
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface CustomerPaymentFormProps {
  customerId: number;
  onSuccess?: () => void;
}

const CustomerPaymentForm = ({ customerId, onSuccess }: CustomerPaymentFormProps) => {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: records = [] } = useQuery({
    queryKey: ['customerRecords'],
    queryFn: getCustomerRecords,
  });

  const handleInstallmentPayment = async (installmentId: number) => {
    try {
      // Update the installment as paid
      await updateCustomerRecord(installmentId, { isPaid: true });

      // Create payment record
      const installment = records.find(r => r.id === installmentId);
      if (installment) {
        const paymentRecord: CustomerRecord = {
          id: Date.now(),
          customerId,
          type: 'payment',
          itemId: installmentId,
          itemName: installment.itemName,
          amount: installment.amount,
          date: new Date(),
          isPaid: true,
          description: `${installment.description} ödemesi`,
          recordType: 'installment_payment',
          paymentMethod,
          createdAt: new Date(),
        };

        await addCustomerRecord(paymentRecord);
      }

      queryClient.invalidateQueries({ queryKey: ['customerRecords'] });
      
      toast({
        title: "Ödeme kaydedildi",
        description: "Taksit ödemesi başarıyla kaydedildi.",
      });

      setPaymentMethod('');
    } catch (error) {
      console.error("Ödeme kaydedilirken hata:", error);
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Ödeme kaydedilirken bir hata oluştu.",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const record: CustomerRecord = {
        id: Date.now(),
        customerId,
        type: 'payment',
        itemId: Date.now(),
        itemName: description,
        amount: parseFloat(amount),
        date: new Date(),
        isPaid: true,
        description,
        recordType: 'payment',
        paymentMethod,
        createdAt: new Date(),
      };

      await addCustomerRecord(record);
      queryClient.invalidateQueries({ queryKey: ['customerRecords'] });
      
      toast({
        title: "Ödeme kaydedildi",
        description: "Müşteri ödemesi başarıyla kaydedildi.",
      });

      // Reset form
      setAmount('');
      setDescription('');
      setPaymentMethod('');

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Ödeme kaydedilirken hata:", error);
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Ödeme kaydedilirken bir hata oluştu.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      
      <div className="space-y-2">
        <Label htmlFor="amount">Ödeme Miktarı</Label>
        <Input
          id="amount"
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Ödeme miktarını girin"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Açıklama</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Ödeme açıklaması"
          className="min-h-[80px]"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="paymentMethod">Ödeme Yöntemi</Label>
        <Select onValueChange={setPaymentMethod}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Ödeme yöntemi seçin" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="nakit">Nakit</SelectItem>
            <SelectItem value="kredi kartı">Kredi Kartı</SelectItem>
            <SelectItem value="havale">Havale</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DialogFooter className="pt-4">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Kaydediliyor...' : 'Ödeme Kaydet'}
        </Button>
      </DialogFooter>
    </form>
  );
};

export default CustomerPaymentForm;
