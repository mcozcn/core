import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { addStockMovement, getStock, setStock, type StockItem, type StockMovement } from "@/utils/localStorage";

interface StockEntryFormProps {
  showForm: boolean;
  setShowForm: (show: boolean) => void;
  stock: StockItem[];
}

const StockEntryForm = ({ showForm, setShowForm, stock }: StockEntryFormProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    productId: '',
    quantity: '',
    cost: '',
    price: '',
    description: '',
    type: 'in' as 'in' | 'out',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const productId = parseInt(formData.productId);
      const quantity = parseInt(formData.quantity);
      const cost = parseFloat(formData.cost);
      const price = parseFloat(formData.price);

      if (isNaN(productId) || isNaN(quantity) || isNaN(cost)) {
        toast({
          variant: "destructive",
          title: "Hata!",
          description: "Lütfen geçerli sayısal değerler girin.",
        });
        return;
      }

      const existingProduct = stock.find(item => item.productId === productId);

      if (!existingProduct) {
        toast({
          variant: "destructive",
          title: "Hata!",
          description: "Bu ürün bulunamadı.",
        });
        return;
      }

      const newStockMovement: Omit<StockMovement, 'id'> = {
        stockItemId: productId,
        stockItemName: existingProduct.productName || existingProduct.name || '',
        quantityChange: quantity,
        type: formData.type,
        movementDate: new Date(),
        reason: formData.description,
      };

      await addStockMovement(newStockMovement);

      // Update stock quantity and price
      const updatedStock = stock.map(item => {
        if (item.productId === productId) {
          const newQuantity = formData.type === 'in' ? item.quantity + quantity : item.quantity - quantity;
          const updatedItem = { ...item, quantity: newQuantity };
          
          // Update price if provided
          if (!isNaN(price) && price > 0) {
            updatedItem.price = price;
          }
          
          return updatedItem;
        }
        return item;
      });

      setStock(updatedStock);
      queryClient.setQueryData(['stock'], updatedStock);
      queryClient.invalidateQueries({ queryKey: ['stockMovements'] });

      toast({
        title: "Başarıyla kaydedildi",
        description: "Stok hareketi başarıyla kaydedildi.",
      });

      setFormData({
        productId: '',
        quantity: '',
        cost: '',
        price: '',
        description: '',
        type: 'in',
      });
      setShowForm(false);
    } catch (error) {
      console.error('Stok hareketi kaydı sırasında hata:', error);
      toast({
        variant: "destructive",
        title: "Hata!",
        description: "Kayıt sırasında bir hata oluştu. Lütfen tekrar deneyin.",
      });
    }
  };

  if (!showForm) return null;

  return (
    <Card className="p-6 mb-8">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label>Ürün Seçimi</Label>
          <Select value={formData.productId} onValueChange={(value) => setFormData({ ...formData, productId: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Ürün seçin" />
            </SelectTrigger>
            <SelectContent>
              {stock.map((item) => (
                <SelectItem key={item.productId} value={item.productId.toString()}>
                  {item.productName} - Stok: {item.quantity}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Miktar</Label>
          <Input
            type="number"
            value={formData.quantity}
            onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
            placeholder="Miktarı girin"
            required
          />
        </div>

        <div>
          <Label>Birim Maliyet (₺)</Label>
          <Input
            type="number"
            step="0.01"
            value={formData.cost}
            onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
            placeholder="Birim maliyeti girin"
            required
          />
        </div>

        <div>
          <Label>Yeni Fiyat (₺) - Opsiyonel</Label>
          <Input
            type="number"
            step="0.01"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            placeholder="Yeni satış fiyatı"
          />
        </div>

        <div>
          <Label>Açıklama</Label>
          <Input
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Açıklama girin"
          />
        </div>

        <div>
          <Label>Hareket Tipi</Label>
          <Select value={formData.type} onValueChange={(value: 'in' | 'out') => setFormData({ ...formData, type: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="in">Giriş</SelectItem>
              <SelectItem value="out">Çıkış</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2">
          <Button type="submit" className="flex-1">
            Kaydet
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowForm(false)}
          >
            İptal
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default StockEntryForm;
