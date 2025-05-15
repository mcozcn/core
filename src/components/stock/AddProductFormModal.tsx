
import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { getStock, setStock, type StockItem } from "@/utils/localStorage";
import { X, Save, Tag } from "lucide-react";

interface AddProductFormModalProps {
  showForm: boolean;
  setShowForm: (show: boolean) => void;
  stock: StockItem[];
}

const AddProductFormModal = ({ showForm, setShowForm, stock }: AddProductFormModalProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    productName: '',
    quantity: '',
    price: '',
    cost: '',
    category: '',
    criticalLevel: '5', // Varsayılan kritik stok seviyesi
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
        criticalLevel: Number(formData.criticalLevel),
        createdAt: new Date(),
        lastUpdated: new Date(),
      };

      console.log('Yeni ürün ekleniyor:', newStockItem);

      const updatedStock = [...stock, newStockItem];
      setStock(updatedStock);
      queryClient.setQueryData(['stock'], updatedStock);

      toast({
        title: "Başarıyla kaydedildi",
        description: `${newStockItem.productName} stok listenize eklendi.`,
      });

      if (newStockItem.quantity <= newStockItem.criticalLevel) {
        toast({
          variant: "destructive",
          title: "Kritik Stok Uyarısı!",
          description: `${newStockItem.productName} kritik stok seviyesinde başladı.`,
        });
      }

      setFormData({
        productName: '',
        quantity: '',
        price: '',
        cost: '',
        category: '',
        criticalLevel: '5',
      });
      setShowForm(false);
    } catch (error) {
      console.error('Ürün kaydı sırasında hata:', error);
      toast({
        variant: "destructive",
        title: "Hata!",
        description: "Kayıt sırasında bir hata oluştu. Lütfen tekrar deneyin.",
      });
    }
  };

  if (!showForm) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <Card className="w-full max-w-2xl bg-white shadow-lg max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 z-10 bg-white border-b p-4 flex justify-between items-center">
          <h3 className="text-xl font-semibold flex items-center">
            <Tag className="mr-2 h-5 w-5" />
            Yeni Ürün Ekle
          </h3>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setShowForm(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="p-4">
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

            <div className="grid grid-cols-2 gap-4">
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
                <Label>Kritik Stok Seviyesi</Label>
                <Input
                  type="number"
                  value={formData.criticalLevel}
                  onChange={(e) => setFormData({ ...formData, criticalLevel: e.target.value })}
                  placeholder="Kritik stok seviyesini girin"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
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

            <div className="flex gap-2 pt-4">
              <Button type="submit" className="flex-1">
                <Save className="mr-2 h-4 w-4" /> Kaydet
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowForm(false)}
              >
                <X className="mr-2 h-4 w-4" /> İptal
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
};

export default AddProductFormModal;
