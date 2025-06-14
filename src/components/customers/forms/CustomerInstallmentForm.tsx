import React, { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { DayPicker } from "react-day-picker"
import { DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { updateCustomer, type Customer } from '@/utils/storage/customers';
import { addCustomerRecord } from '@/utils/storage/customerRecords';

interface CustomerInstallmentFormProps {
  customer: Customer;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const CustomerInstallmentForm = ({ customer, onSuccess, onCancel }: CustomerInstallmentFormProps) => {
  const [amount, setAmount] = useState('');
  const [installmentCount, setInstallmentCount] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = React.useState<Date | undefined>(new Date());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const parsedAmount = parseFloat(amount);
      const parsedInstallmentCount = parseInt(installmentCount, 10);

      if (isNaN(parsedAmount) || isNaN(parsedInstallmentCount) || !date) {
        toast({
          variant: "destructive",
          title: "Hata",
          description: "Lütfen geçerli bir tutar ve taksit sayısı girin.",
        });
        return;
      }

      const installmentAmount = parsedAmount / parsedInstallmentCount;
      const installmentDates = [];
      let currentDate = new Date(date);

      for (let i = 0; i < parsedInstallmentCount; i++) {
        installmentDates.push(new Date(currentDate));
        currentDate.setMonth(currentDate.getMonth() + 1);
      }

      installmentDates.forEach((installmentDate, index) => {
        const newRecord = {
          id: Date.now() + index,
          customerId: customer.id,
          type: 'debt' as const,
          itemId: Date.now(),
          itemName: `${description} - Taksit ${index + 1}`,
          amount: installmentAmount,
          date: new Date(),
          dueDate: installmentDate,
          isPaid: false,
          description: `${description} - Taksit ${index + 1}/${installmentCount}`,
          recordType: 'installment' as const,
          createdAt: new Date(),
        };

        addCustomerRecord(newRecord);
      });

      toast({
        title: "Taksitler oluşturuldu",
        description: "Taksitler başarıyla oluşturuldu.",
      });

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
    <>
      <DialogHeader>
        <DialogTitle>Taksit Oluştur</DialogTitle>
        <DialogDescription>
          Müşteri için taksit oluşturmak için aşağıdaki alanları kullanın.
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="amount">Toplam Tutar</Label>
          <Input
            id="amount"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
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
          <Label htmlFor="description">Açıklama</Label>
          <Input
            id="description"
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Açıklama girin"
          />
        </div>

        <div className="space-y-2">
          <Label>Başlangıç Tarihi</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-[240px] justify-start text-left font-normal",
                  !date && "text-muted-foreground"
                )}
              >
                {date ? format(date, "PPP") : (
                  <span>Tarih Seç</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="center">
              <DayPicker
                mode="single"
                selected={date}
                onSelect={setDate}
                disabled={(date) =>
                  date < new Date()
                }
                initialFocus
              />
            </PopoverContent>
          </Popover>
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
            {isSubmitting ? 'Oluşturuluyor...' : 'Oluştur'}
          </Button>
        </DialogFooter>
      </form>
    </>
  );
};

export default CustomerInstallmentForm;
