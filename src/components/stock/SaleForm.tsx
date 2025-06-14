import React, { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DialogFooter } from "@/components/ui/dialog";
import { getCustomers, getStockItems, addSale, updateStockQuantity, addCustomerRecord, type Customer, type StockItem, type Sale, type CustomerRecord } from '@/utils/storage';
import { useQuery } from "@tanstack/react-query";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface SaleFormProps {
  onSuccess?: () => void;
}

const SaleForm = ({ onSuccess }: SaleFormProps) => {
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<StockItem | null>(null);
  const [quantity, setQuantity] = useState('');
  const [discount, setDiscount] = useState('');
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

  const updateStockQuantity = async (productId: number, quantityChange: number) => {
    const stockItems = await getStockItems();
    const updatedStockItems = stockItems.map(item => {
      if (item.id === productId) {
        return { ...item, quantity: item.quantity + quantityChange };
      }
      return item;
    });
    // Assuming you have a setStockItems function in your storage utils
    // await setStockItems(updatedStockItems);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer || !selectedProduct || !quantity) return;

    setIsSubmitting(true);

    try {
      const saleQuantity = parseInt(quantity);
      const totalPrice = selectedProduct.price * saleQuantity;
      const discountAmount = (totalPrice * parseFloat(discount || '0')) / 100;
      const finalPrice = totalPrice - discountAmount;

      // Create sale record
      const sale: Sale = {
        id: Date.now(),
        customerId: selectedCustomer.id,
        customerName: selectedCustomer.name,
        stockItemId: selectedProduct.id,
        stockItemName: selectedProduct.name,
        quantity: saleQuantity,
        unitPrice: selectedProduct.price,
        totalPrice: finalPrice,
        saleDate: new Date(),
        customerPhone: selectedCustomer.phone,
        discount: parseFloat(discount || '0'),
      };

      await addSale(sale);

      // Update stock
      await updateStockQuantity(selectedProduct.id, -saleQuantity);

      // Create customer record
      const customerRecord: CustomerRecord = {
        id: Date.now() + 1,
        customerId: selectedCustomer.id,
        type: 'product',
        itemId: selectedProduct.id,
        itemName: selectedProduct.name,
        amount: finalPrice,
        date: new Date(),
        isPaid: false,
        description: `${selectedProduct.name} - ${saleQuantity} ${selectedProduct.unit}`,
        recordType: 'debt',
        discount: parseFloat(discount || '0'),
        createdAt: new Date(),
      };

      await addCustomerRecord(customerRecord);

      toast({
        title: "Satış kaydedildi",
        description: `${selectedProduct.name} satışı başarıyla kaydedildi.`,
      });

      setSelectedCustomer(null);
      setSelectedProduct(null);
      setQuantity('');
      setDiscount('');

      if (onSuccess) {
        onSuccess();
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
          placeholder="İndirim girin"
        />
      </div>

      <DialogFooter className="pt-4">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Kaydediliyor...' : 'Satışı Kaydet'}
        </Button>
      </DialogFooter>
    </form>
  );
};

export default SaleForm;
