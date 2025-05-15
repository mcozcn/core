
import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { getStock, setStock, addStockMovement, type StockItem } from "@/utils/localStorage";
import { X, Save, Package } from "lucide-react";

interface StockEntryFormModalProps {
  showForm: boolean;
  setShowForm: (show: boolean) => void;
  stock: StockItem[];
}

const StockEntryFormModal = ({ showForm, setShowForm, stock }: StockEntryFormModalProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    productId: '',
    quantity: '',
    cost: '',
    date: new Date().toISOString().split('T')[0],
    notes: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const selectedProduct = stock.find(item => item.productId.toString() === formData.productId);
      
      if (!selectedProduct) {
        throw new Error("Ürün bulunamadı");
      }

      const quantity = Number(formData.quantity);
      const cost = Number(formData.cost) || selectedProduct.cost;
      
      // Stok hareketi ekle
      await addStockMovement({
        productId: selectedProduct.productId,
        type: 'in',
        quantity,
        cost,
        date: new Date(formData.date),
        description: formData.notes || 'Stok girişi'
      });

      // Query cache'i güncelle
      queryClient.invalidateQueries({ queryKey: ['stock'] });

      console.log('Stok girişi yapıldı:', {
        product: selectedProduct.productName,
        quantity,
        cost
      });

      toast({
        title: "Stok girişi başarılı",
        description: `${selectedProduct.productName} için ${quantity} adet giriş yapıldı.`,
      });

      setFormData({
        productId: '',
        quantity: '',
        cost: '',
        date: new Date().toISOString().split('T')[0],
        notes: ''
      });
      setShowForm(false);
    } catch (error) {
      console.error('Stok girişi sırasında hata:', error);
      toast({
        variant: "destructive",
        title: "Hata!",
        description: error instanceof Error ? error.message : "Stok girişi sırasında bir hata oluştu.",
      });
    }
  };

  if (!showForm) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <Card className="w-full max-w-2xl bg-white shadow-lg max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 z-10 bg-white border-b p-4 flex justify-between items-center">
          <h3 className="text-xl font-semibold flex items-center">
            <Package className="mr-2 h-5 w-5" />
            Stok Girişi
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
              <Label>Ürün</Label>
              <select
                value={formData.productId}
                onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2"
                required
              >
                <option value="">Ürün seçin</option>
                {stock.map((item) => (
                  <option key={item.productId} value={item.productId}>
                    {item.productName} - Mevcut Stok: {item.quantity}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label>Miktar</Label>
              <Input
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                placeholder="Giriş miktarını girin"
                min="1"
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
                min="0"
                step="0.01"
              />
            </div>

            <div>
              <Label>Tarih</Label>
              <Input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />
            </div>

            <div>
              <Label>Notlar</Label>
              <Input
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Varsa notları girin"
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="submit" className="flex-1">
                <Save className="mr-2 h-4 w-4" /> Stok Girişi Yap
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

export default StockEntryFormModal;
