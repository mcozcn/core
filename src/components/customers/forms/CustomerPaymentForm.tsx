import React, { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
import { addDays } from 'date-fns';
import { DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { getCustomerRecords, setCustomerRecords, CustomerRecord } from '@/utils/localStorage';

interface CustomerPaymentFormProps {
  customer: any;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const CustomerPaymentForm = ({ customer, onSuccess, onCancel }: CustomerPaymentFormProps) => {
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [description, setDescription] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<CustomerRecord | null>(null);
  const [showInstallmentPayment, setShowInstallmentPayment] = useState(false);
  const { toast } = useToast();

  const customerRecords = getCustomerRecords().filter(record => record.customerId === customer.id && record.recordType === 'installment' && !record.isPaid);

  useEffect(() => {
    setShowInstallmentPayment(customerRecords.length > 0);
  }, [customerRecords]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (showInstallmentPayment && selectedRecord) {
        // Handle installment payment
        const newRecord = {
          id: Date.now(),
          customerId: customer.id,
          type: 'payment' as const,
          itemId: selectedRecord.id,
          itemName: selectedRecord.itemName,
          amount: parseFloat(amount),
          date: new Date(date),
          isPaid: true,
          description: `Taksit ödemesi: ${selectedRecord.itemName}`,
          recordType: 'installment_payment' as const,
          paymentMethod: paymentMethod,
          createdAt: new Date(),
        };

        const allRecords = getCustomerRecords();
        const updatedRecords = allRecords.map(record =>
          record.id === selectedRecord.id ? { ...record, isPaid: true } : record
        );

        setCustomerRecords([...updatedRecords, newRecord]);

        toast({
          title: "Taksit ödendi",
          description: "Taksit ödemesi başarıyla kaydedildi.",
        });
      } else {
        // Handle regular payment
        const newRecord = {
          id: Date.now(),
          customerId: customer.id,
          type: 'payment' as const,
          itemId: Date.now(),
          itemName: 'Ödeme',
          amount: parseFloat(amount),
          date: new Date(date),
          isPaid: true,
          description: description || 'Müşteri ödemesi',
          recordType: 'payment' as const,
          paymentMethod: paymentMethod,
          createdAt: new Date(),
        };

        setCustomerRecords([...getCustomerRecords(), newRecord]);

        toast({
          title: "Ödeme kaydedildi",
          description: "Ödeme başarıyla kaydedildi.",
        });
      }

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
    <>
      <DialogHeader>
        <DialogTitle>Ödeme Ekle</DialogTitle>
        <DialogDescription>
          Müşteri ödemesini kaydetmek için aşağıdaki formu kullanın.
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-4">
        {showInstallmentPayment && (
          <div className="space-y-2">
            <Label htmlFor="installment">Taksit Seç</Label>
            <Select onValueChange={(value) => setSelectedRecord(customerRecords.find(record => record.id.toString() === value) || null)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Taksit seçin" defaultValue={customerRecords[0]?.id.toString()} />
              </SelectTrigger>
              <SelectContent>
                {customerRecords.map(record => (
                  <SelectItem key={record.id} value={record.id.toString()}>
                    {record.itemName} - {record.amount} ₺ ({format(record.dueDate || new Date(), 'dd/MM/yyyy')})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="amount">Miktar</Label>
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
                {date ? format(date, "PPP") : <span>Tarih seçin</span>}
                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="center" side="bottom">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                disabled={(date) =>
                  date > addDays(new Date(), 365)
                }
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
            placeholder="Ödeme açıklaması girin"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="paymentMethod">Ödeme Yöntemi</Label>
          <Select onValueChange={setPaymentMethod}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Ödeme yöntemi seçin" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="cash">Nakit</SelectItem>
              <SelectItem value="credit_card">Kredi Kartı</SelectItem>
              <SelectItem value="eft">EFT</SelectItem>
              <SelectItem value="other">Diğer</SelectItem>
            </SelectContent>
          </Select>
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

export default CustomerPaymentForm;
