
import React, { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { getCustomerRecords, setCustomerRecords, type CustomerRecord } from '@/utils/storage';

interface CustomerInstallmentFormProps {
  customerId: number;
  onSuccess?: () => void;
}

const CustomerInstallmentForm = ({ customerId, onSuccess }: CustomerInstallmentFormProps) => {
  const [amount, setAmount] = useState('');
  const [installmentAmount, setInstallmentAmount] = useState('');
  const [dueDate, setDueDate] = useState<Date | undefined>();
  const [description, setDescription] = useState('');
  const [operationType, setOperationType] = useState<'add_debt' | 'installment'>('add_debt');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Use useQuery to get customer records
  const { data: allRecords = [] } = useQuery({
    queryKey: ['customerRecords'],
    queryFn: getCustomerRecords,
  });

  // Mevcut borç hesaplama
  const existingRecords = allRecords.filter(record => record.customerId === customerId);
  const totalDebt = existingRecords.reduce((acc, record) => 
    record.type !== 'payment' && record.recordType !== 'installment' ? acc + record.amount : acc, 0
  );
  const totalPayments = existingRecords.reduce((acc, record) => 
    record.type === 'payment' ? acc + Math.abs(record.amount) : acc, 0
  );
  const totalInstallments = existingRecords.reduce((acc, record) => 
    record.recordType === 'installment' ? acc + record.amount : acc, 0
  );
  const currentDebt = Math.max(0, totalDebt - totalPayments);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (operationType === 'installment' && (!installmentAmount || Number(installmentAmount) > totalInstallments)) {
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Ödeme tutarı vadelendirilen tutardan fazla olamaz.",
      });
      return;
    }

    if (operationType === 'add_debt' && !amount) {
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Borç tutarını girin.",
      });
      return;
    }

    if (operationType === 'installment') {
      // Vadeli ödeme kaydı - vadelenen tutardan düş
      const paymentRecord: CustomerRecord = {
        id: Date.now(),
        customerId,
        type: 'payment',
        itemId: 0,
        itemName: 'Vadeli Ödeme',
        amount: -Number(installmentAmount),
        date: new Date(),
        dueDate,
        isPaid: true,
        description: description || 'Vadeli ödeme',
        recordType: 'installment_payment'
      };

      const existingRecords = await getCustomerRecords();
      await setCustomerRecords([...existingRecords, paymentRecord]);
    } else {
      // Borç ekleme
      const newRecord: CustomerRecord = {
        id: Date.now(),
        customerId,
        type: 'debt',
        itemId: 0,
        itemName: 'Borç Eklendi',
        amount: Number(amount),
        date: new Date(),
        dueDate,
        isPaid: false,
        description,
        recordType: 'debt'
      };

      const existingRecords = await getCustomerRecords();
      await setCustomerRecords([...existingRecords, newRecord]);
    }

    queryClient.invalidateQueries({ queryKey: ['customerRecords'] });

    toast({
      title: operationType === 'add_debt' ? "Borç eklendi" : "Vadeli ödeme yapıldı",
      description: operationType === 'add_debt' 
        ? `${amount} ₺ tutarında borç eklendi.`
        : `${installmentAmount} ₺ tutarında vadeli ödeme yapıldı.`,
    });

    setAmount('');
    setInstallmentAmount('');
    setDescription('');
    setDueDate(undefined);

    if (onSuccess) {
      onSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label className="text-base font-medium">İşlem Türü</Label>
        <RadioGroup value={operationType} onValueChange={(value: 'add_debt' | 'installment') => setOperationType(value)} className="mt-2">
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="add_debt" id="add_debt" />
            <Label htmlFor="add_debt">Borç Ekleme</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="installment" id="installment" />
            <Label htmlFor="installment">Vadeli Ödeme Yap</Label>
          </div>
        </RadioGroup>
        
        {currentDebt > 0 && (
          <div className="mt-2 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
            <p className="text-sm text-orange-700 dark:text-orange-300">
              Mevcut Borç: <span className="font-medium">₺{currentDebt.toLocaleString()}</span>
            </p>
          </div>
        )}

        {totalInstallments > 0 && (
          <div className="mt-2 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <p className="text-sm text-purple-700 dark:text-purple-300">
              Vadelenen Tutar: <span className="font-medium">₺{totalInstallments.toLocaleString()}</span>
            </p>
          </div>
        )}
      </div>

      {operationType === 'add_debt' ? (
        <div>
          <Label>Borç Tutarı (₺)</Label>
          <Input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Tutarı girin"
            required
          />
        </div>
      ) : (
        <div>
          <Label>Ödeme Tutarı (₺)</Label>
          <p className="text-xs text-muted-foreground mb-1">
            Maksimum: ₺{totalInstallments.toLocaleString()}
          </p>
          <Input
            type="number"
            max={totalInstallments}
            value={installmentAmount}
            onChange={(e) => setInstallmentAmount(e.target.value)}
            placeholder="Ödeme tutarını girin"
            required
          />
        </div>
      )}

      <div>
        <Label>Vade Tarihi</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-full justify-start text-left font-normal",
                !dueDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dueDate ? format(dueDate, "PPP") : "Tarih seçin"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={dueDate}
              onSelect={setDueDate}
              initialFocus
            />
          </PopoverContent>
        </Popover>
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

      <Button type="submit" className="w-full">
        {operationType === 'add_debt' ? 'Borç Ekle' : 'Vadeli Ödeme Yap'}
      </Button>
    </form>
  );
};

export default CustomerInstallmentForm;
