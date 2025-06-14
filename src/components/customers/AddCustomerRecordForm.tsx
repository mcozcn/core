import React, { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { getCustomers, getServices, getStockItems, type Customer, type Service, type StockItem } from '@/utils/storage';

interface AddCustomerRecordFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

const AddCustomerRecordForm = ({ onSuccess, onCancel }: AddCustomerRecordFormProps) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [selectedType, setSelectedType] = useState<'payment' | 'debt' | 'service' | 'product' | null>(null);
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
  const [selectedItemName, setSelectedItemName] = useState<string>('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [dueDate, setDueDate] = useState<Date | undefined>(new Date());
  const [description, setDescription] = useState('');
  const [discount, setDiscount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const loadData = async () => {
      const customerData = await getCustomers();
      setCustomers(customerData);

      const serviceData = await getServices();
      setServices(serviceData);

      const stockItemData = await getStockItems();
      setStockItems(stockItemData);
    };

    loadData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer || !selectedType || !selectedItemId || !selectedItemName) return;

    setIsSubmitting(true);

    try {
      const newRecord = {
        id: Date.now(),
        customerId: selectedCustomer.id,
        itemId: selectedItemId,
        itemName: selectedItemName,
        amount: parseFloat(amount),
        type: selectedType,
        isPaid: selectedType === 'payment',
        date: new Date(date),
        dueDate: new Date(dueDate),
        description: description || `${selectedType} - ${selectedItemName}`,
        recordType: selectedType === 'payment' ? 'payment' : 'debt',
        discount: parseFloat(discount) || 0,
        createdAt: new Date(),
      };

      // TODO: Save the new record to storage (IndexedDB)
      // For now, just log the new record
      console.log('New Record:', newRecord);

      toast({
        title: "Kayıt Eklendi",
        description: "Yeni müşteri kaydı başarıyla eklendi.",
      });

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

  const handleTypeChange = (type: 'payment' | 'debt' | 'service' | 'product') => {
    setSelectedType(type);
    setSelectedItemId(null);
    setSelectedItemName('');
  };

  const getItemOptions = () => {
    switch (selectedType) {
      case 'service':
        return services.map(service => ({ id: service.id, name: service.name }));
      case 'product':
        return stockItems.map(stockItem => ({ id: stockItem.id, name: stockItem.name }));
      default:
        return [];
    }
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>Yeni Kayıt Ekle</DialogTitle>
        <DialogDescription>
          Müşteri için yeni bir kayıt eklemek için aşağıdaki alanları doldurun.
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="customer">Müşteri</Label>
          <Select onValueChange={(value) => {
            const customer = customers.find(c => c.id === parseInt(value));
            setSelectedCustomer(customer || null);
          }}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Müşteri seçin" />
            </SelectTrigger>
            <SelectContent>
              {customers.map((customer) => (
                <SelectItem key={customer.id} value={customer.id.toString()}>
                  {customer.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="type">Kayıt Tipi</Label>
          <Select onValueChange={handleTypeChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Kayıt tipini seçin" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="payment">Ödeme</SelectItem>
              <SelectItem value="debt">Borç</SelectItem>
              <SelectItem value="service">Hizmet</SelectItem>
              <SelectItem value="product">Ürün</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {selectedType && selectedType !== 'payment' && (
          <div className="space-y-2">
            <Label htmlFor="item">
              {selectedType === 'service' ? 'Hizmet' : 'Ürün'}
            </Label>
            <Select onValueChange={(value) => {
              const itemId = parseInt(value);
              const itemName = getItemOptions().find(item => item.id === itemId)?.name || '';
              setSelectedItemId(itemId);
              setSelectedItemName(itemName);
            }}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder={`${selectedType === 'service' ? 'Hizmet' : 'Ürün'} seçin`} />
              </SelectTrigger>
              <SelectContent>
                {getItemOptions().map((item) => (
                  <SelectItem key={item.id} value={item.id.toString()}>
                    {item.name}
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
            placeholder="Miktarı girin"
            required
          />
        </div>

        <div className="space-y-2">
          <Label>Tarih</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !date && "text-muted-foreground"
                )}
              >
                {date ? format(date, "PPP") : (
                  <span>Tarih seçin</span>
                )}
                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                disabled={(date) =>
                  date > new Date()
                }
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
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
                {dueDate ? format(dueDate, "PPP") : (
                  <span>Vade Tarihi seçin</span>
                )}
                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={dueDate}
                onSelect={setDueDate}
                disabled={(date) =>
                  date < new Date()
                }
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

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

        <div className="space-y-2">
          <Label htmlFor="description">Açıklama</Label>
          <Textarea
            id="description"
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

export default AddCustomerRecordForm;
