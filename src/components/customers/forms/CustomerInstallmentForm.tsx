
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
  const [dueDate, setDueDate] = useState<Date | undefined>();
  const [description, setDescription] = useState('');
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
    (record.type === 'debt' || record.type === 'service' || record.type === 'product') && record.recordType !== 'installment' 
      ? acc + record.amount : acc, 0
  );
  const totalPayments = existingRecords.reduce((acc, record) => 
    record.type === 'payment' ? acc + Math.abs(record.amount) : acc, 0
  );
  const installmentedAmount = existingRecords.reduce((acc, record) => 
    record.recordType === 'installment' ? acc + record.amount : acc, 0
  );
  const currentDebt = Math.max(0, totalDebt - totalPayments);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!amount || !dueDate) {
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Vadeli ödeme tutarı ve vade tarihini girin.",
      });
      return;
    }

    const installmentAmount = Number(amount);
    
    if (installmentAmount > currentDebt) {
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Vadeli ödeme tutarı mevcut borçtan fazla olamaz.",
      });
      return;
    }

    // Vadeli ödeme kaydı oluştur
    const installmentRecord: CustomerRecord = {
      id: Date.now(),
      customerId,
      type: 'debt',
      itemId: 0,
      itemName: 'Vadeli Ödeme',
      amount: installmentAmount,
      date: new Date(),
      dueDate,
      isPaid: false,
      description: description || 'Vadeli ödeme planlaması',
      recordType: 'installment'
    };

    const existingRecords = await getCustomerRecords();
    await setCustomerRecords([...existingRecords, installmentRecord]);

    queryClient.invalidateQueries({ queryKey: ['customerRecords'] });

    toast({
      title: "Vadeli ödeme oluşturuldu",
      description: `${installmentAmount} ₺ tutarında vadeli ödeme ${format(dueDate, 'dd/MM/yyyy')} tarihine planlandı.`,
    });

    setAmount('');
    setDescription('');
    setDueDate(undefined);

    if (onSuccess) {
      onSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        {currentDebt > 0 && (
          <div className="mb-4 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
            <p className="text-sm text-orange-700 dark:text-orange-300">
              Mevcut Borç: <span className="font-medium">₺{currentDebt.toLocaleString()}</span>
            </p>
          </div>
        )}

        {installmentedAmount > 0 && (
          <div className="mb-4 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <p className="text-sm text-purple-700 dark:text-purple-300">
              Vadelenen Tutar: <span className="font-medium">₺{installmentedAmount.toLocaleString()}</span>
            </p>
          </div>
        )}
      </div>

      <div>
        <Label>Vadeli Ödeme Tutarı (₺)</Label>
        <p className="text-xs text-muted-foreground mb-1">
          Maksimum: ₺{currentDebt.toLocaleString()}
        </p>
        <Input
          type="number"
          max={currentDebt}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Vadeli ödeme tutarını girin"
          required
        />
      </div>

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
          placeholder="Vadeli ödeme açıklaması"
          className="min-h-[100px]"
        />
      </div>

      <Button type="submit" className="w-full">
        Vadeli Ödeme Planla
      </Button>
    </form>
  );
};

export default CustomerInstallmentForm;
