
import React, { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DialogFooter } from "@/components/ui/dialog";
import { addCustomerRecord, type CustomerRecord } from '@/utils/storage';
import { useQueryClient } from "@tanstack/react-query";

interface CustomerDebtFormProps {
  customerId: number;
  onSuccess?: () => void;
}

const CustomerDebtForm = ({ customerId, onSuccess }: CustomerDebtFormProps) => {
  const [itemName, setItemName] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const record: Omit<CustomerRecord, 'id' | 'createdAt'> = {
        customerId,
        type: 'debt',
        itemId: Date.now(),
        itemName,
        amount: parseFloat(amount),
        date: new Date(),
        dueDate: dueDate ? new Date(dueDate) : undefined,
        isPaid: false,
        description,
        recordType: 'debt',
      };

      await addCustomerRecord(record);
      
      queryClient.invalidateQueries({ queryKey: ['customerRecords'] });
      
      toast({
        title: "Borç eklendi",
        description: "Müşteri borcu başarıyla eklendi.",
      });

      // Reset form
      setItemName('');
      setAmount('');
      setDueDate('');
      setDescription('');

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Borç eklenirken hata:", error);
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Borç eklenirken bir hata oluştu.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="itemName">Ürün/Hizmet Adı</Label>
        <Input
          id="itemName"
          type="text"
          value={itemName}
          onChange={(e) => setItemName(e.target.value)}
          placeholder="Ürün veya hizmet adını girin"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="amount">Tutar</Label>
        <Input
          id="amount"
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Tutar girin"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="dueDate">Vade Tarihi</Label>
        <Input
          id="dueDate"
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Açıklama</Label>
        <Input
          id="description"
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Açıklama"
        />
      </div>

      <DialogFooter className="pt-4">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Ekleniyor...' : 'Borç Ekle'}
        </Button>
      </DialogFooter>
    </form>
  );
};

export default CustomerDebtForm;
