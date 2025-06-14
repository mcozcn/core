import React, { useState } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { useQueryClient } from "@tanstack/react-query";
import { getCustomerRecords, setCustomerRecords, type CustomerRecord } from '@/utils/localStorage';

interface CustomerDebtFormProps {
  customerId: number;
  onSuccess?: () => void;
}

const CustomerDebtForm = ({ customerId, onSuccess }: CustomerDebtFormProps) => {
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState<Date>(new Date());
  const [dueDate, setDueDate] = useState<Date | undefined>();
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
      itemName: 'Manuel Borç Kaydı',
      amount: Number(amount),
      date,
      dueDate,
      isPaid: false,
      description,
      recordType: 'debt'
    };

    console.log('Yeni borç kaydı oluşturuluyor:', newRecord);

    const existingRecords = getCustomerRecords();
    setCustomerRecords([...existingRecords, newRecord]);
    queryClient.invalidateQueries({ queryKey: ['customerRecords'] });

    toast({
      title: "Borç kaydı eklendi",
      description: `${amount} ₺ tutarında borç kaydı eklendi.`,
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
        <Label>Borç Tutarı (₺)</Label>
        <Input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Tutarı girin"
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
          placeholder="Açıklama ekleyin"
          className="min-h-[100px]"
        />
      </div>

      <Button type="submit" className="w-full">Borç Kaydı Ekle</Button>
    </form>
  );
};

export default CustomerDebtForm;