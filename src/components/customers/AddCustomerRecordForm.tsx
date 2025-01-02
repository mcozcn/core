import React, { useState, useEffect } from 'react';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { getCustomerRecords, setCustomerRecords, type CustomerRecord, getServices, getProducts, type Service, type StockItem } from '@/utils/localStorage';

interface AddCustomerRecordFormProps {
  customerId: number;
  onSuccess?: () => void;
}

const AddCustomerRecordForm = ({ customerId, onSuccess }: AddCustomerRecordFormProps) => {
  const [selectedItemId, setSelectedItemId] = useState('');
  const [amount, setAmount] = useState('');
  const [discount, setDiscount] = useState('0');
  const [type, setType] = useState<'service' | 'product'>('service');
  const [recordType, setRecordType] = useState<'debt' | 'payment'>('debt');
  const [isPaid, setIsPaid] = useState(false);
  const [date, setDate] = useState<Date>(new Date());
  const [dueDate, setDueDate] = useState<Date | undefined>();
  const [description, setDescription] = useState('');
  const { toast } = useToast();

  const { data: services = [] } = useQuery({
    queryKey: ['services'],
    queryFn: getServices,
  });

  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: getProducts,
  });

  useEffect(() => {
    if (selectedItemId) {
      const selectedService = services.find(s => s.id.toString() === selectedItemId);
      const selectedProduct = products.find(p => p.id.toString() === selectedItemId);
      const price = selectedService?.price || selectedProduct?.price || 0;
      setAmount(price.toString());
    }
  }, [selectedItemId, services, products]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const finalAmount = Number(amount) - Number(discount);
    const selectedItem = type === 'service' 
      ? services.find(s => s.id.toString() === selectedItemId)
      : products.find(p => p.id.toString() === selectedItemId);

    if (!selectedItem) {
      toast({
        variant: "destructive",
        title: "Hata!",
        description: "Lütfen bir ürün veya hizmet seçin.",
      });
      return;
    }

    const newRecord: CustomerRecord = {
      id: Date.now(),
      customerId,
      itemId: type === 'service' ? selectedItem.id : selectedItem.id,
      itemName: type === 'service' 
        ? (selectedItem as Service).name 
        : (selectedItem as StockItem).productName,
      amount: recordType === 'debt' ? finalAmount : -finalAmount,
      type: recordType === 'payment' ? 'payment' : type,
      isPaid: recordType === 'payment' ? true : isPaid,
      date,
      dueDate,
      description,
      recordType,
      discount: Number(discount),
    };

    console.log('Yeni müşteri kaydı oluşturuluyor:', newRecord);

    const existingRecords = getCustomerRecords();
    setCustomerRecords([...existingRecords, newRecord]);

    toast({
      title: "Kayıt eklendi",
      description: `${recordType === 'debt' ? 'Borç' : 'Tahsilat'} kaydı başarıyla eklendi.`,
    });

    // Reset form
    setSelectedItemId('');
    setAmount('');
    setDiscount('0');
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

        {recordType === 'debt' && (
          <div>
            <Label>{type === 'service' ? 'Hizmet' : 'Ürün'}</Label>
            <Select value={selectedItemId} onValueChange={setSelectedItemId}>
              <SelectTrigger>
                <SelectValue placeholder={type === 'service' ? 'Hizmet seçin' : 'Ürün seçin'} />
              </SelectTrigger>
              <SelectContent>
                {type === 'service' ? (
                  services.map((service) => (
                    <SelectItem key={service.id} value={service.id.toString()}>
                      {service.name} - {service.price} ₺
                    </SelectItem>
                  ))
                ) : (
                  products.map((product) => (
                    <SelectItem key={product.id} value={product.id.toString()}>
                      {product.productName} - {product.price} ₺
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
        )}

        <div>
          <Label>Tutar (₺)</Label>
          <Input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Tutarı girin"
            required
            readOnly={recordType === 'debt'}
          />
        </div>

        {recordType === 'debt' && (
          <div>
            <Label>İndirim Tutarı (₺)</Label>
            <Input
              type="number"
              value={discount}
              onChange={(e) => setDiscount(e.target.value)}
              placeholder="İndirim tutarını girin"
              min="0"
            />
          </div>
        )}

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