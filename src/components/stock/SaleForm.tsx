
import React, { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DialogFooter } from "@/components/ui/dialog";
import { addCustomerRecord, type CustomerRecord } from '@/utils/storage';
import { useQueryClient } from "@tanstack/react-query";

interface SaleFormProps {
  customerId: number;
  productName: string;
  productPrice: number;
  onSuccess?: () => void;
}

const SaleForm = ({ customerId, productName, productPrice, onSuccess }: SaleFormProps) => {
  const [quantity, setQuantity] = useState('1');
  const [price, setPrice] = useState(productPrice.toString());
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const totalAmount = parseFloat(price) * parseFloat(quantity);

      const record: Omit<CustomerRecord, 'id' | 'createdAt'> = {
        customerId,
        type: 'product',
        itemId: Date.now(),
        itemName: productName,
        amount: totalAmount,
        quantity: parseFloat(quantity),
        date: new Date(),
        description: description || `${productName} ürün satışı`,
        recordType: 'product',
      };

      await addCustomerRecord(record);
      
      queryClient.invalidateQueries({ queryKey: ['customerRecords'] });
      
      toast({
        title: "Ürün satışı eklendi",
        description: "Ürün satışı başarıyla kaydedildi.",
      });

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Ürün satışı eklenirken hata:", error);
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Ürün satışı eklenirken bir hata oluştu.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalPrice = parseFloat(price || '0') * parseFloat(quantity || '0');

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="productName">Ürün Adı</Label>
        <Input
          id="productName"
          type="text"
          value={productName}
          disabled
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="quantity">Miktar</Label>
          <Input
            id="quantity"
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="Miktar"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="price">Birim Fiyat</Label>
          <Input
            id="price"
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="Birim fiyat"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Toplam Tutar</Label>
        <div className="text-lg font-semibold">
          ₺{totalPrice.toLocaleString()}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Açıklama</Label>
        <Input
          id="description"
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Açıklama (opsiyonel)"
        />
      </div>

      <DialogFooter className="pt-4">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Kaydediliyor...' : 'Ürün Satışı Kaydet'}
        </Button>
      </DialogFooter>
    </form>
  );
};

export default SaleForm;
