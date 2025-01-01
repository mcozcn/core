import React, { useState } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { getCustomerRecords, setCustomerRecords, type CustomerRecord } from '@/utils/localStorage';

interface AddCustomerRecordFormProps {
  customerId: number;
  onSuccess?: () => void;
}

const AddCustomerRecordForm = ({ customerId, onSuccess }: AddCustomerRecordFormProps) => {
  const [itemName, setItemName] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'service' | 'product'>('service');
  const [recordType, setRecordType] = useState<'debt' | 'payment'>('debt');
  const [isPaid, setIsPaid] = useState(false);
  const [date, setDate] = useState<Date>(new Date());
  const [dueDate, setDueDate] = useState<Date | undefined>();
  const [description, setDescription] = useState('');
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newRecord: CustomerRecord = {
      id: Date.now(),
      customerId,
      itemId: Date.now(),
      itemName,
      amount: recordType === 'debt' ? Number(amount) : -Number(amount), // Negatif değer tahsilat için
      type: recordType === 'payment' ? 'payment' : type,
      isPaid: recordType === 'payment' ? true : isPaid,
      date: date,
      dueDate,
      description,
      recordType,
    };

    console.log('Yeni müşteri kaydı oluşturuluyor:', newRecord);

    const existingRecords = getCustomerRecords();
    setCustomerRecords([...existingRecords, newRecord]);

    toast({
      title: "Kayıt eklendi",
      description: `${recordType === 'debt' ? 'Borç' : 'Tahsilat'} kaydı başarıyla eklendi.`,
    });

    // Formu sıfırla
    setItemName('');
    setAmount('');
    setType('service');
    setRecordType('debt');
    setIsPaid(false);
    setDueDate(undefined);
    setDescription('');

    if (onSuccess) {
      onSuccess();
    }
  };

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label>Kayıt Türü</Label>
          <RadioGroup value={recordType} onValueChange={(value) => setRecordType(value as 'debt' | 'payment')} className="flex space-x-4">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="debt" id="debt" />
              <Label htmlFor="debt">Borç</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="payment" id="payment" />
              <Label htmlFor="payment">Tahsilat</Label>
            </div>
          </RadioGroup>
        </div>

        {recordType === 'debt' && (
          <div>
            <Label>Tür</Label>
            <RadioGroup value={type} onValueChange={(value) => setType(value as 'service' | 'product')} className="flex space-x-4">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="service" id="service" />
                <Label htmlFor="service">Hizmet</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="product" id="product" />
                <Label htmlFor="product">Ürün</Label>
              </div>
            </RadioGroup>
          </div>
        )}

        <div>
          <Label>{recordType === 'debt' ? 'Ürün/Hizmet Adı' : 'Tahsilat Açıklaması'}</Label>
          <Input
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
            placeholder={recordType === 'debt' ? "Ürün veya hizmet adını girin" : "Tahsilat açıklaması girin"}
            required
          />
        </div>

        <div>
          <Label>Tutar (₺)</Label>
          <Input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Tutarı girin"
            required
          />
        </div>

        {recordType === 'debt' && (
          <div>
            <Label>Ödeme Durumu</Label>
            <RadioGroup value={isPaid ? "paid" : "unpaid"} onValueChange={(value) => setIsPaid(value === "paid")} className="flex space-x-4">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="paid" id="paid" />
                <Label htmlFor="paid">Ödendi</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="unpaid" id="unpaid" />
                <Label htmlFor="unpaid">Ödenmedi</Label>
              </div>
            </RadioGroup>
          </div>
        )}

        {recordType === 'debt' && !isPaid && (
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
        )}

        <div>
          <Label>Açıklama</Label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Açıklama ekleyin (opsiyonel)"
            className="min-h-[100px]"
          />
        </div>

        <Button type="submit" className="w-full">Kaydet</Button>
      </form>
    </Card>
  );
};

export default AddCustomerRecordForm;