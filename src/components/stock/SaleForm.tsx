import React, { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { tr } from 'date-fns/locale';
import { DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { getCustomers, getStockItems, type Customer, type StockItem } from '@/utils/storage';
import { useQuery } from '@tanstack/react-query';
import { createCustomerRecord } from '@/utils/storage/customers';

interface SaleFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

const SaleForm = ({ onSuccess, onCancel }: SaleFormProps) => {
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<StockItem | null>(null);
  const [quantity, setQuantity] = useState('1');
  const [discount, setDiscount] = useState('0');
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const { data: customers = [] } = useQuery({
    queryKey: ['customers'],
    queryFn: getCustomers,
  });

  const { data: products = [] } = useQuery({
    queryKey: ['stockItems'],
    queryFn: getStockItems,
  });

  const totalPrice = selectedProduct ? selectedProduct.price * parseInt(quantity) * (1 - parseFloat(discount) / 100) : 0;

  useEffect(() => {
    if (!selectedCustomer) return;
  }, [selectedCustomer]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer || !selectedProduct) return;

    setIsSubmitting(true);

    try {
      const parsedQuantity = parseInt(quantity, 10);
      const parsedDiscount = parseFloat(discount);
      const unitPrice = selectedProduct.price;
      const totalPrice = unitPrice * parsedQuantity * (1 - parsedDiscount / 100);

      const newRecord = {
        id: Date.now(),
        customerId: selectedCustomer.id,
        type: 'product' as const,
        itemId: selectedProduct.id,
        itemName: selectedProduct.name,
        amount: totalPrice,
        date: new Date(date),
        isPaid: false,
        description: `Ürün satışı: ${selectedProduct.name} (${quantity} adet)`,
        recordType: 'debt' as const,
        discount: parseFloat(discount) || 0,
        createdAt: new Date(),
      };

      const success = await createCustomerRecord(newRecord);

      if (success) {
        toast({
          title: "Satış kaydedildi",
          description: "Satış başarıyla kaydedildi.",
        });

        if (onSuccess) {
          onSuccess();
        }
      } else {
        toast({
          variant: "destructive",
          title: "Hata",
          description: "Satış kaydedilirken bir hata oluştu.",
        });
      }
    } catch (error) {
      console.error("Satış kaydedilirken hata:", error);
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Satış kaydedilirken bir hata oluştu.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>Ürün Satışı</DialogTitle>
        <DialogDescription>
          Müşteriye ürün satışı yapmak için aşağıdaki alanları kullanın.
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="customer">Müşteri</Label>
          <Select onValueChange={(value) => setSelectedCustomer(customers.find(c => c.id === parseInt(value)) || null)}>
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
          <Label htmlFor="product">Ürün</Label>
          <Select onValueChange={(value) => setSelectedProduct(products.find(p => p.id === parseInt(value)) || null)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Ürün seçin" />
            </SelectTrigger>
            <SelectContent>
              {products.map((product) => (
                <SelectItem key={product.id} value={product.id.toString()}>
                  {product.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="quantity">Miktar</Label>
          <Input
            id="quantity"
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="Miktar girin"
            min="1"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="discount">İndirim (%)</Label>
          <Input
            id="discount"
            type="number"
            value={discount}
            onChange={(e) => setDiscount(e.target.value)}
            placeholder="İndirim oranını girin"
            min="0"
            max="100"
          />
        </div>

        <div className="space-y-2">
          <Label>Satış Tarihi</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className="w-full justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP", { locale: tr }) : <span>Tarih Seç</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="center">
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
          <Label htmlFor="total">Toplam Tutar</Label>
          <Input
            id="total"
            type="text"
            value={totalPrice.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
            readOnly
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
            {isSubmitting ? 'Kaydediliyor...' : 'Satışı Kaydet'}
          </Button>
        </DialogFooter>
      </form>
    </>
  );
};

export default SaleForm;
