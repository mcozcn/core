import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { getStock, setStock, getSales, setSales, getCustomers, type StockItem, type Sale } from "@/utils/localStorage";
import CustomerSelect from '../common/CustomerSelect';

interface SaleFormProps {
  showForm: boolean;
  setShowForm: (show: boolean) => void;
  stock: StockItem[];
  sales: Sale[];
}

const SaleForm = ({ showForm, setShowForm, stock, sales }: SaleFormProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [saleData, setSaleData] = useState({
    productId: '',
    quantity: '',
    customerId: '',
  });

  const handleSale = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const product = stock.find(item => item.productId === Number(saleData.productId));
      const customer = await getCustomers().then(customers => 
        customers.find(c => c.id === Number(saleData.customerId))
      );
      
      if (!product) {
        throw new Error("Ürün bulunamadı");
      }

      if (!customer) {
        throw new Error("Müşteri bulunamadı");
      }

      if (product.quantity < Number(saleData.quantity)) {
        throw new Error("Yetersiz stok");
      }

      const newSale: Sale = {
        id: Date.now(),
        productId: product.productId,
        productName: product.productName,
        quantity: Number(saleData.quantity),
        totalPrice: product.price * Number(saleData.quantity),
        customerName: customer.name,
        customerPhone: customer.phone,
        saleDate: new Date(),
      };

      // Update stock
      const updatedStock = stock.map(item => 
        item.productId === product.productId 
          ? { ...item, quantity: item.quantity - Number(saleData.quantity), lastUpdated: new Date() }
          : item
      );

      // Update sales
      const updatedSales = [...sales, newSale];

      setStock(updatedStock);
      setSales(updatedSales);
      queryClient.setQueryData(['stock'], updatedStock);
      queryClient.setQueryData(['sales'], updatedSales);

      console.log('Sale completed:', newSale);

      toast({
        title: "Satış başarılı",
        description: `${product.productName} satışı gerçekleştirildi.`,
      });

      setSaleData({
        productId: '',
        quantity: '',
        customerId: '',
      });
      setShowForm(false);
    } catch (error) {
      console.error('Error processing sale:', error);
      toast({
        variant: "destructive",
        title: "Hata!",
        description: error instanceof Error ? error.message : "Satış işlemi sırasında bir hata oluştu.",
      });
    }
  };

  if (!showForm) return null;

  return (
    <Card className="p-6 mb-8">
      <form onSubmit={handleSale} className="space-y-4">
        <div>
          <Label>Ürün</Label>
          <select
            value={saleData.productId}
            onChange={(e) => setSaleData({ ...saleData, productId: e.target.value })}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2"
            required
          >
            <option value="">Ürün seçin</option>
            {stock.map((item) => (
              <option key={item.productId} value={item.productId}>
                {item.productName} - Stok: {item.quantity}
              </option>
            ))}
          </select>
        </div>

        <div>
          <Label>Satış Miktarı</Label>
          <input
            type="number"
            value={saleData.quantity}
            onChange={(e) => setSaleData({ ...saleData, quantity: e.target.value })}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2"
            placeholder="Satış miktarını girin"
            required
          />
        </div>

        <div>
          <Label>Müşteri</Label>
          <CustomerSelect
            value={saleData.customerId}
            onValueChange={(value) => setSaleData({ ...saleData, customerId: value })}
          />
        </div>

        <div className="flex gap-2">
          <Button type="submit" className="flex-1">
            Satışı Tamamla
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

export default SaleForm;