
import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { addStockMovement, getStock, setStock, type StockItem, type StockMovement } from "@/utils/localStorage";
import { format } from 'date-fns';

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
    description: '',
    type: 'in' as 'in' | 'out', // Explicit type cast to 'in' | 'out'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const productId = parseInt(formData.productId);
      const quantity = parseInt(formData.quantity);
      const cost = parseFloat(formData.cost);

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
          description: "Bu ürün ID'siyle eşleşen bir ürün bulunamadı.",
        });
        return;
      }

      const newStockMovement: Omit<StockMovement, 'id'> = {
        productId: productId,
        quantity: quantity,
        type: formData.type,
        date: format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
        cost: cost,
        description: formData.description,
      };

      await addStockMovement(newStockMovement);

      // Update stock quantity
      const updatedStock = stock.map(item => {
        if (item.productId === productId) {
          const newQuantity = formData.type === 'in' ? item.quantity + quantity : item.quantity - quantity;
          return { ...item, quantity: newQuantity };
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
          <Label>Ürün ID</Label>
          <Input
            value={formData.productId}
            onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
            placeholder="Ürün ID'sini girin"
            required
          />
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
            value={formData.cost}
            onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
            placeholder="Birim maliyeti girin"
            required
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
          <select
            className="w-full border rounded-md py-2 px-3"
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value as 'in' | 'out' })}
          >
            <option value="in">Giriş</option>
            <option value="out">Çıkış</option>
          </select>
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
