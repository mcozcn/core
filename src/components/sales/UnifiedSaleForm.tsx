import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";
import CustomerSelect from '../common/CustomerSelect';
import SaleItemSelector from './SaleItemSelector';
import { Plus } from "lucide-react";
import {
  getStock,
  getServices,
  getSales,
  getServiceSales,
  setStock,
  setSales,
  setServiceSales,
  setCustomerRecords,
  getCustomerRecords,
  type StockItem,
  type Service,
  type Sale,
  type ServiceSale,
  type CustomerRecord
} from '@/utils/localStorage';
import { UnifiedSaleFormData, SaleItem } from './types';

interface UnifiedSaleFormProps {
  showForm: boolean;
  setShowForm: (show: boolean) => void;
}

const UnifiedSaleForm = ({ showForm, setShowForm }: UnifiedSaleFormProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<UnifiedSaleFormData>({
    customerId: '',
    items: [{ type: 'product', itemId: '', quantity: 1, discount: 0 }]
  });

  const { data: stock = [] } = useQuery({
    queryKey: ['stock'],
    queryFn: getStock
  });

  const { data: services = [] } = useQuery({
    queryKey: ['services'],
    queryFn: getServices
  });

  const { data: sales = [] } = useQuery({
    queryKey: ['sales'],
    queryFn: getSales
  });

  const { data: serviceSales = [] } = useQuery({
    queryKey: ['serviceSales'],
    queryFn: getServiceSales
  });

  const handleAddItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { type: 'product', itemId: '', quantity: 1, discount: 0 }]
    }));
  };

  const handleRemoveItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const handleUpdateItem = (index: number, item: SaleItem) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map((oldItem, i) => i === index ? item : oldItem)
    }));
  };

  const handleSale = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Process each item in the sale
      for (const item of formData.items) {
        if (item.type === 'product') {
          const product = stock.find(p => p.productId.toString() === item.itemId);
          if (!product) throw new Error("Ürün bulunamadı");
          if (product.quantity < (item.quantity || 0)) throw new Error(`${product.productName} için yetersiz stok`);

          const totalPrice = (product.price * (item.quantity || 0)) - item.discount;

          // Create product sale record
          const newSale: Sale = {
            id: Date.now() + Math.random(), // Ensure unique ID
            productId: product.productId,
            productName: product.productName,
            quantity: item.quantity || 0,
            totalPrice,
            discount: item.discount,
            customerName: '',  // Will be set from customer records
            customerPhone: '', // Will be set from customer records
            saleDate: new Date(),
          };

          // Update stock
          const updatedStock = stock.map(stockItem =>
            stockItem.productId === product.productId
              ? { ...stockItem, quantity: stockItem.quantity - (item.quantity || 0), lastUpdated: new Date() }
              : stockItem
          );

          setStock(updatedStock);
          setSales([...sales, newSale]);
          queryClient.setQueryData(['stock'], updatedStock);
          queryClient.setQueryData(['sales'], [...sales, newSale]);

          // Add to customer records
          const newRecord: CustomerRecord = {
            id: Date.now() + Math.random(),
            customerId: Number(formData.customerId),
            type: 'product',
            itemId: product.productId,
            itemName: product.productName,
            amount: totalPrice,
            date: new Date(),
            isPaid: false,
            description: `Ürün satışı: ${product.productName} (${item.quantity} adet)`,
            recordType: 'debt'
          };

          const existingRecords = getCustomerRecords();
          setCustomerRecords([...existingRecords, newRecord]);
          queryClient.invalidateQueries({ queryKey: ['customerRecords'] });

        } else {
          const service = services.find(s => s.id.toString() === item.itemId);
          if (!service) throw new Error("Hizmet bulunamadı");

          // Create service sale record
          const newServiceSale: ServiceSale = {
            id: Date.now() + Math.random(),
            serviceId: service.id,
            serviceName: service.name,
            price: service.price - item.discount,
            customerName: '',  // Will be set from customer records
            customerPhone: '', // Will be set from customer records
            saleDate: new Date(),
          };

          setServiceSales([...serviceSales, newServiceSale]);
          queryClient.setQueryData(['serviceSales'], [...serviceSales, newServiceSale]);

          // Add to customer records
          const newRecord: CustomerRecord = {
            id: Date.now() + Math.random(),
            customerId: Number(formData.customerId),
            type: 'service',
            itemId: service.id,
            itemName: service.name,
            amount: service.price - item.discount,
            date: new Date(),
            isPaid: false,
            description: `Hizmet satışı: ${service.name}`,
            recordType: 'debt'
          };

          const existingRecords = getCustomerRecords();
          setCustomerRecords([...existingRecords, newRecord]);
          queryClient.invalidateQueries({ queryKey: ['customerRecords'] });
        }
      }

      toast({
        title: "Satış başarılı",
        description: "Tüm satışlar başarıyla kaydedildi.",
      });

      setFormData({
        customerId: '',
        items: [{ type: 'product', itemId: '', quantity: 1, discount: 0 }]
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
          <CustomerSelect
            value={formData.customerId}
            onValueChange={(value) => setFormData(prev => ({ ...prev, customerId: value }))}
          />
        </div>

        <div className="space-y-4">
          {formData.items.map((item, index) => (
            <SaleItemSelector
              key={index}
              item={item}
              index={index}
              stock={stock}
              services={services}
              onUpdate={handleUpdateItem}
              onRemove={handleRemoveItem}
            />
          ))}
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={handleAddItem}
          className="w-full"
        >
          <Plus className="mr-2 h-4 w-4" /> Yeni Ürün/Hizmet Ekle
        </Button>

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

export default UnifiedSaleForm;