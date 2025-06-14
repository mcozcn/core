import React, { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DialogFooter } from "@/components/ui/dialog";
import { addCustomerRecord, type CustomerRecord } from '@/utils/storage';
import { useQueryClient } from "@tanstack/react-query";

interface CustomerInstallmentFormProps {
  customerId: number;
  onSuccess?: () => void;
}

const CustomerInstallmentForm = ({ customerId, onSuccess }: CustomerInstallmentFormProps) => {
  const [totalAmount, setTotalAmount] = useState('');
  const [installmentCount, setInstallmentCount] = useState('');
  const [firstPaymentDate, setFirstPaymentDate] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const installmentAmount = parseFloat(totalAmount) / parseInt(installmentCount);
      const startDate = new Date(firstPaymentDate);

      // Create installment records
      for (let i = 0; i < parseInt(installmentCount); i++) {
        const dueDate = new Date(startDate);
        dueDate.setMonth(dueDate.getMonth() + i);

        const record: CustomerRecord = {
          id: Date.now() + i,
          customerId,
          type: 'debt',
          itemId: Date.now(),
          itemName: description,
          amount: installmentAmount,
          date: new Date(),
          dueDate,
          isPaid: false,
          description: `${description} - Taksit ${i + 1}/${installmentCount}`,
          recordType: 'installment',
          createdAt: new Date(),
        };

        await addCustomerRecord(record);
      }
      
      toast({
        title: "Taksitler oluşturuldu",
        description: `${installmentCount} adet taksit başarıyla oluşturuldu.`,
      });

      // Reset form
      setTotalAmount('');
      setInstallmentCount('');
      setFirstPaymentDate('');
      setDescription('');

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Taksit oluşturulurken hata:", error);
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Taksit oluşturulurken bir hata oluştu.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="totalAmount">Toplam Tutar</Label>
        <Input
          id="totalAmount"
          type="number"
          value={totalAmount}
          onChange={(e) => setTotalAmount(e.target.value)}
          placeholder="Toplam tutarı girin"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="installmentCount">Taksit Sayısı</Label>
        <Input
          id="installmentCount"
          type="number"
          value={installmentCount}
          onChange={(e) => setInstallmentCount(e.target.value)}
          placeholder="Taksit sayısını girin"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="firstPaymentDate">İlk Ödeme Tarihi</Label>
        <Input
          id="firstPaymentDate"
          type="date"
          value={firstPaymentDate}
          onChange={(e) => setFirstPaymentDate(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Açıklama</Label>
        <Input
          id="description"
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Taksit açıklaması"
          required
        />
      </div>

      <DialogFooter className="pt-4">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Oluşturuluyor...' : 'Taksit Oluştur'}
        </Button>
      </DialogFooter>
    </form>
  );
};

export default CustomerInstallmentForm;
