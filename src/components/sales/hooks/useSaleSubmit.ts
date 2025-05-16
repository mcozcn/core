
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
  getCustomers
} from '@/utils/storage';

export const useSaleSubmit = (onSuccess: () => void) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleSubmit = async (formData: UnifiedSaleFormData) => {
    setIsSubmitting(true);
    console.log('Processing sale with data:', formData);

    try {
      const stock = await getStock();
      const sales = await getSales();
      const serviceSales = await getServiceSales();
      const existingRecords = await getCustomerRecords();
      const customers = await getCustomers();
      const customer = customers.find(c => c.id === Number(formData.customerId));
      const newRecords = [];

      if (!customer) {
        throw new Error("Müşteri bulunamadı");
      }

      // Process each item in the sale
      for (const item of formData.items) {
        if (item.type === 'product') {
          const product = stock.find(p => p.productId.toString() === item.itemId);
          if (!product) throw new Error("Ürün bulunamadı");
          if (product.quantity < (item.quantity || 0)) throw new Error(`${product.productName} için yetersiz stok`);

          const totalPrice = (product.price * (item.quantity || 0)) - item.discount;
          const commissionRate = item.commissionRate || (product.commissionRate || 0);
          const commissionAmount = commissionRate > 0 ? (commissionRate / 100) * totalPrice : 0;

          // Create product sale record
          const newSale = {
            id: Date.now() + Math.random(),
            customerId: Number(formData.customerId),
            date: new Date().toISOString(),
            total: totalPrice,
            paymentMethod: "Nakit", // Default
            productId: product.productId,
            productName: product.productName,
            quantity: item.quantity || 0,
            totalPrice,
            discount: item.discount,
            customerName: customer.name,
            customerPhone: customer.phone,
            saleDate: new Date(),
            staffId: item.staffId,
            staffName: item.staffName,
            commissionAmount: commissionAmount
          };

          // Update stock
          const updatedStock = stock.map(stockItem =>
            stockItem.productId === product.productId
              ? { ...stockItem, quantity: stockItem.quantity - (item.quantity || 0), lastUpdated: new Date() }
              : stockItem
          );

          await setStock(updatedStock);
          await setSales([...sales, newSale]);
          queryClient.setQueryData(['stock'], updatedStock);
          queryClient.setQueryData(['sales'], [...sales, newSale]);

          // Add to customer records with detailed information
          const newRecord = {
            id: Date.now() + Math.random(),
            customerId: Number(formData.customerId),
            customerName: customer.name,
            type: 'product' as const,
            itemId: product.productId,
            itemName: product.productName,
            amount: totalPrice,
            date: new Date(),
            isPaid: false,
            description: `Ürün satışı: ${product.productName} (${item.quantity} adet)`,
            recordType: 'debt' as const,
            discount: item.discount,
            quantity: item.quantity,
            staffId: item.staffId,
            staffName: item.staffName,
            commissionAmount: commissionAmount
          };

          newRecords.push(newRecord);

        } else {
          const services = await getServices();
          const service = services.find(s => s.id.toString() === item.itemId);
          if (!service) throw new Error("Hizmet bulunamadı");

          const totalPrice = service.price - item.discount;
          const commissionRate = item.commissionRate || (service.commissionRate || 0);
          const commissionAmount = commissionRate > 0 ? (commissionRate / 100) * totalPrice : 0;

          // Create service sale record
          const newServiceSale = {
            id: Date.now() + Math.random(),
            serviceId: service.id,
            serviceName: service.name,
            price: totalPrice,
            customerName: customer.name,
            customerPhone: customer.phone,
            saleDate: new Date(),
            staffId: item.staffId,
            staffName: item.staffName,
            commissionAmount: commissionAmount,
            totalPrice: totalPrice
          };

          await setServiceSales([...serviceSales, newServiceSale]);
          queryClient.setQueryData(['serviceSales'], [...serviceSales, newServiceSale]);

          // Add to customer records with detailed information
          const newRecord = {
            id: Date.now() + Math.random(),
            customerId: Number(formData.customerId),
            customerName: customer.name,
            type: 'service' as const,
            itemId: service.id,
            itemName: service.name,
            amount: totalPrice,
            date: new Date(),
            isPaid: false,
            description: `Hizmet satışı: ${service.name}`,
            recordType: 'debt' as const,
            discount: item.discount,
            staffId: item.staffId,
            staffName: item.staffName,
            commissionAmount: commissionAmount
          };

          newRecords.push(newRecord);
        }
      }

      // Add all records at once
      await setCustomerRecords([...existingRecords, ...newRecords]);
      queryClient.invalidateQueries({ queryKey: ['customerRecords'] });

      console.log('New records added:', newRecords);

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

// Helper function to get services (defined here to avoid circular dependency)
const getServices = async () => {
  try {
    return await import('@/utils/storage').then(m => m.getServices());
  } catch (error) {
    console.error('Error getting services', error);
    return [];
  }
};
