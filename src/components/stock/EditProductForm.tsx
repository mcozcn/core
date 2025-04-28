
import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { getStock, setStock, type StockItem } from "@/utils/localStorage";

interface EditProductFormProps {
  product: StockItem;
  showForm: boolean;
  setShowForm: (show: boolean) => void;
}

const EditProductForm = ({ product, showForm, setShowForm }: EditProductFormProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    productName: product.productName,
    price: product.price.toString(),
    cost: product.cost.toString(),
    category: product.category,
    criticalLevel: product.criticalLevel.toString(),
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const stock = getStock();
      const updatedStock = stock.map(item => 
        item.id === product.id
          ? {
              ...item,
              productName: formData.productName,
              price: Number(formData.price),
              cost: Number(formData.cost),
              category: formData.category,
              criticalLevel: Number(formData.criticalLevel),
              lastUpdated: new Date()
            }
          : item
      );

      setStock(updatedStock);
      queryClient.setQueryData(['stock'], updatedStock);

      toast({
        title: "Başarıyla güncellendi",
        description: `${formData.productName} ürünü güncellendi.`,
      });

      setShowForm(false);
    } catch (error) {
      console.error('Ürün güncellenirken hata:', error);
      toast({
        variant: "destructive",
        title: "Hata!",
        description: "Güncelleme sırasında bir hata oluştu. Lütfen tekrar deneyin.",
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
          <Label>Kritik Stok Seviyesi</Label>
          <Input
            type="number"
            value={formData.criticalLevel}
            onChange={(e) => setFormData({ ...formData, criticalLevel: e.target.value })}
            placeholder="Kritik stok seviyesini girin"
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
            Güncelle
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

export default EditProductForm;
