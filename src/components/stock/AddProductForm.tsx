import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { getStock, setStock, type StockItem } from "@/utils/localStorage";

interface AddProductFormProps {
  showForm: boolean;
  setShowForm: (show: boolean) => void;
  stock: StockItem[];
}

const AddProductForm = ({ showForm, setShowForm, stock }: AddProductFormProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    productName: '',
    quantity: '',
    price: '',
    cost: '',
    category: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const newStockItem: StockItem = {
        id: Date.now(),
        productId: Date.now(),
        productName: formData.productName,
        quantity: Number(formData.quantity),
        price: Number(formData.price),
        cost: Number(formData.cost),
        category: formData.category,
        createdAt: new Date(),
        lastUpdated: new Date(),
      };

      const updatedStock = [...stock, newStockItem];
      setStock(updatedStock);
      queryClient.setQueryData(['stock'], updatedStock);

      console.log('Stock item saved to localStorage:', newStockItem);

      toast({
        title: "Başarıyla kaydedildi",
        description: `${newStockItem.productName} stok listenize eklendi.`,
      });

      setFormData({
        productName: '',
        quantity: '',
        price: '',
        cost: '',
        category: '',
      });
      setShowForm(false);
    } catch (error) {
      console.error('Error saving stock item:', error);
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
          <Label>Ürün Adı</Label>
          <Input
            value={formData.productName}
            onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
            placeholder="Ürün adını girin"
            required
          />
        </div>

        <div>
          <Label>Miktar</Label>
          <Input
            type="number"
            value={formData.quantity}
            onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
            placeholder="Stok miktarını girin"
            required
          />
        </div>

        <div>
          <Label>Maliyet (₺)</Label>
          <Input
            type="number"
            value={formData.cost}
            onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
            placeholder="Ürün maliyetini girin"
            required
          />
        </div>

        <div>
          <Label>Satış Fiyatı (₺)</Label>
          <Input
            type="number"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            placeholder="Ürün satış fiyatını girin"
            required
          />
        </div>

        <div>
          <Label>Kategori</Label>
          <Input
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            placeholder="Ürün kategorisini girin"
            required
          />
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

export default AddProductForm;