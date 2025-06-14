import React, { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DialogFooter } from "@/components/ui/dialog";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getCustomers, addCustomerRecord, type CustomerRecord } from '@/utils/storage';
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";

interface AddCustomerRecordFormProps {
  customerId: number;
  onSuccess?: () => void;
}

const AddCustomerRecordForm = ({ customerId, onSuccess }: AddCustomerRecordFormProps) => {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [type, setType] = useState('debt');
  const [discount, setDiscount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: customers = [] } = useQuery({
    queryKey: ['customers'],
    queryFn: getCustomers,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const customer = customers.find(c => c.id === customerId);
      if (!customer) {
        throw new Error('Müşteri bulunamadı');
      }

      const record: CustomerRecord = {
        id: Date.now(),
        customerId,
        itemId: Date.now(),
        itemName: description,
        amount: parseFloat(amount),
        type: type as CustomerRecord['type'],
        isPaid: type === 'payment',
        date: new Date(date),
        dueDate: dueDate ? new Date(dueDate) : new Date(),
        description,
        recordType: type === 'payment' ? 'payment' : 'debt',
        discount: parseFloat(discount) || 0,
        createdAt: new Date(),
      };

      await addCustomerRecord(record);
      queryClient.invalidateQueries({ queryKey: ['customerRecords'] });

      toast({
        title: "Kayıt eklendi",
        description: "Müşteri kaydı başarıyla eklendi.",
      });

      // Reset form
      setAmount('');
      setDescription('');
      setDate('');
      setDueDate('');
      setDiscount('');

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Kayıt eklenirken hata:", error);
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Kayıt eklenirken bir hata oluştu.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="type">Kayıt Tipi</Label>
        <select
          id="type"
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          value={type}
          onChange={(e) => setType(e.target.value)}
        >
          <option value="debt">Borç</option>
          <option value="payment">Ödeme</option>
        </select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="amount">Miktar</Label>
        <Input
          id="amount"
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Miktarı girin"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Açıklama</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Açıklama girin"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="date">Tarih</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-full justify-start text-left font-normal",
                !date && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(new Date(date), "PPP") : <span>Tarih seçin</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={date ? new Date(date) : undefined}
              onSelect={(selectedDate) => setDate(selectedDate ? format(selectedDate, 'yyyy-MM-dd') : '')}
              disabled={(date) =>
                date > new Date()
              }
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      {type === 'debt' && (
        <div className="space-y-2">
          <Label htmlFor="dueDate">Vade Tarihi</Label>
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
                {dueDate ? format(new Date(dueDate), "PPP") : <span>Vade tarihi seçin</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={dueDate ? new Date(dueDate) : undefined}
                onSelect={(selectedDate) => setDueDate(selectedDate ? format(selectedDate, 'yyyy-MM-dd') : '')}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="discount">İndirim</Label>
        <Input
          id="discount"
          type="number"
          value={discount}
          onChange={(e) => setDiscount(e.target.value)}
          placeholder="İndirim miktarını girin"
        />
      </div>

      <DialogFooter className="pt-4">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Ekleniyor...' : 'Kaydet'}
        </Button>
      </DialogFooter>
    </form>
  );
};

export default AddCustomerRecordForm;
