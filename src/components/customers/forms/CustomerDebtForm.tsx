import React, { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { DatePicker } from "@/components/ui/date-picker"
import { DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { addCustomerRecord } from '@/utils/storage/customers';
import type { Customer } from '@/utils/storage';

interface CustomerDebtFormProps {
  customer: Customer;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const CustomerDebtForm = ({ customer, onSuccess, onCancel }: CustomerDebtFormProps) => {
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [dueDate, setDueDate] = useState<Date | undefined>(new Date());
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const newRecord = {
        id: Date.now(),
        customerId: customer.id,
        type: 'debt' as const,
        itemId: Date.now(),
        itemName: 'Borç',
        amount: parseFloat(amount),
        date: new Date(date),
        dueDate: dueDate ? new Date(dueDate) : new Date(date),
        isPaid: false,
        description: description || 'Müşteri borcu',
        recordType: 'debt' as const,
        createdAt: new Date(),
      };

      const success = await addCustomerRecord(newRecord);

      if (success) {
        toast({
          title: "Borç eklendi",
          description: "Müşteri borcu başarıyla eklendi.",
        });

        if (onSuccess) {
          onSuccess();
        }
      } else {
        toast({
          variant: "destructive",
          title: "Hata",
          description: "Borç eklenirken bir hata oluştu.",
        });
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
    <>
      <DialogHeader>
        <DialogTitle>Yeni Borç Ekle</DialogTitle>
        <DialogDescription>
          Müşteri için yeni bir borç kaydı oluşturun.
        </DialogDescription>
      </DialogHeader>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="amount">Tutar</Label>
          <Input
            id="amount"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Borç tutarını girin"
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
                  "w-[240px] justify-start text-left font-normal",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP") : <span>Tarih seçin</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="center">
              <DatePicker
                mode="single"
                selected={date}
                onSelect={setDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <Label htmlFor="dueDate">Vade Tarihi</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-[240px] justify-start text-left font-normal",
                  !dueDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dueDate ? format(dueDate, "PPP") : <span>Vade tarihi seçin</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="center">
              <DatePicker
                mode="single"
                selected={dueDate}
                onSelect={setDueDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Açıklama</Label>
          <Input
            id="description"
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Açıklama girin"
          />
        </div>

        <DialogFooter className="pt-4">
          {onCancel && (
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel}
              disabled={isSubmitting}
            >
              İptal
            </Button>
          )}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Kaydediliyor...' : 'Kaydet'}
          </Button>
        </DialogFooter>
      </form>
    </>
  );
};

export default CustomerDebtForm;
