import { useState } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { UnifiedSaleFormData } from '../types';
import {
  getStock,
  setStock,
  getSales,
  setSales,
  getServiceSales,
  setServiceSales,
  getCustomerRecords,
  setCustomerRecords,
} from '@/utils/localStorage';

export const useSaleSubmit = (onSuccess: () => void) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleSubmit = async (formData: UnifiedSaleFormData) => {
    setIsSubmitting(true);
    console.log('Processing sale with data:', formData);

    try {
      const stock = getStock();
      const sales = getSales();
      const serviceSales = getServiceSales();
      const existingRecords = getCustomerRecords();
      const newRecords = [];

      // Process each item in the sale
      for (const item of formData.items) {
        if (item.type === 'product') {
          const product = stock.find(p => p.productId.toString() === item.itemId);
          if (!product) throw new Error("Ürün bulunamadı");
          if (product.quantity < (item.quantity || 0)) throw new Error(`${product.productName} için yetersiz stok`);

          const totalPrice = (product.price * (item.quantity || 0)) - item.discount;

          // Create product sale record
          const newSale = {
            id: Date.now() + Math.random(),
            productId: product.productId,
            productName: product.productName,
            quantity: item.quantity || 0,
            totalPrice,
            discount: item.discount,
            customerName: '',
            customerPhone: '',
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

          // Add to customer records with explicit type
          const newRecord = {
            id: Date.now() + Math.random(),
            customerId: Number(formData.customerId),
            type: 'product' as const,
            itemId: product.productId,
            itemName: product.productName,
            amount: totalPrice,
            date: new Date(),
            isPaid: false,
            description: `Ürün satışı: ${product.productName} (${item.quantity} adet)`,
            recordType: 'debt' as const
          };

          newRecords.push(newRecord);

        } else {
          const services = await queryClient.fetchQuery({
            queryKey: ['services'],
            queryFn: () => import('@/utils/localStorage').then(m => m.getServices()),
          });

          const service = services.find(s => s.id.toString() === item.itemId);
          if (!service) throw new Error("Hizmet bulunamadı");

          // Create service sale record
          const newServiceSale = {
            id: Date.now() + Math.random(),
            serviceId: service.id,
            serviceName: service.name,
            price: service.price - item.discount,
            customerName: '',
            customerPhone: '',
            saleDate: new Date(),
          };

          setServiceSales([...serviceSales, newServiceSale]);
          queryClient.setQueryData(['serviceSales'], [...serviceSales, newServiceSale]);

          // Add to customer records with explicit type
          const newRecord = {
            id: Date.now() + Math.random(),
            customerId: Number(formData.customerId),
            type: 'service' as const,
            itemId: service.id,
            itemName: service.name,
            amount: service.price - item.discount,
            date: new Date(),
            isPaid: false,
            description: `Hizmet satışı: ${service.name}`,
            recordType: 'debt' as const
          };

          newRecords.push(newRecord);
        }
      }

      // Tüm kayıtları bir kerede ekle
      setCustomerRecords([...existingRecords, ...newRecords]);
      queryClient.invalidateQueries({ queryKey: ['customerRecords'] });

      toast({
        title: "Satış başarılı",
        description: "Tüm satışlar başarıyla kaydedildi.",
      });

      onSuccess();

    } catch (error) {
      console.error('Error processing sale:', error);
      toast({
        variant: "destructive",
        title: "Hata!",
        description: error instanceof Error ? error.message : "Satış işlemi sırasında bir hata oluştu.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    handleSubmit,
    isSubmitting
  };
};