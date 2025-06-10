
import { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
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
import { addPersonnelRecord } from '@/utils/storage/personnel';

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
          const product = stock.find(p => p.id.toString() === item.itemId || p.productId?.toString() === item.itemId);
          if (!product) throw new Error("Ürün bulunamadı");
          if (product.quantity < (item.quantity || 0)) throw new Error(`${product.name || product.productName} için yetersiz stok`);

          const totalPrice = (product.price * (item.quantity || 0)) - (item.discount || 0);
          const commissionRate = item.commissionRate || 0;
          const commissionAmount = commissionRate > 0 ? (commissionRate / 100) * totalPrice : 0;

          // Create product sale record
          const newSale = {
            id: Date.now() + Math.random(),
            customerId: Number(formData.customerId),
            customerName: customer.name,
            stockItemId: product.id,
            stockItemName: product.name || product.productName || '',
            quantity: item.quantity || 0,
            unitPrice: product.price,
            totalPrice,
            saleDate: new Date(),
            date: new Date().toISOString(),
            total: totalPrice,
            paymentMethod: "Nakit",
            productId: product.productId || product.id,
            productName: product.productName || product.name,
            discount: item.discount || 0,
            customerPhone: customer.phone,
            staffId: item.staffId ? Number(item.staffId) : undefined,
            staffName: item.staffName,
            commissionAmount: commissionAmount
          };

          // Update stock
          const updatedStock = stock.map(stockItem =>
            (stockItem.id === product.id || stockItem.productId === product.productId)
              ? { ...stockItem, quantity: stockItem.quantity - (item.quantity || 0), lastUpdated: new Date() }
              : stockItem
          );

          await setStock(updatedStock);
          await setSales([...sales, newSale]);
          queryClient.setQueryData(['stock'], updatedStock);
          queryClient.setQueryData(['sales'], [...sales, newSale]);

          // Add to customer records
          const newRecord = {
            id: Date.now() + Math.random(),
            customerId: Number(formData.customerId),
            customerName: customer.name,
            type: 'product' as const,
            itemId: product.id,
            itemName: product.name || product.productName || '',
            amount: totalPrice,
            date: new Date(),
            isPaid: false,
            description: `Ürün satışı: ${product.name || product.productName} (${item.quantity} adet)`,
            recordType: 'debt' as const,
            discount: item.discount || 0,
            quantity: item.quantity,
            staffId: item.staffId ? Number(item.staffId) : undefined,
            staffName: item.staffName,
            commissionAmount: commissionAmount
          };

          newRecords.push(newRecord);

          // Add personnel commission record if there's a staff member and commission
          if (item.staffId && commissionAmount > 0) {
            await addPersonnelRecord({
              personnelId: Number(item.staffId),
              type: 'commission',
              amount: commissionAmount,
              description: `Ürün satış primi: ${product.name || product.productName}`,
              date: new Date(),
              customerId: Number(formData.customerId),
              customerName: customer.name,
              productId: product.id,
              productName: product.name || product.productName
            });
            console.log(`Personnel commission added: ₺${commissionAmount} for staff ${item.staffName}`);
          }

        } else {
          const services = await getServices();
          const service = services.find(s => s.id.toString() === item.itemId);
          if (!service) throw new Error("Hizmet bulunamadı");

          const totalPrice = service.price - (item.discount || 0);
          const commissionRate = item.commissionRate || 0;
          const commissionAmount = commissionRate > 0 ? (commissionRate / 100) * totalPrice : 0;

          // Create service sale record
          const newServiceSale = {
            id: Date.now() + Math.random(),
            serviceId: service.id,
            serviceName: service.name,
            price: totalPrice,
            customerId: Number(formData.customerId),
            customerName: customer.name,
            customerPhone: customer.phone,
            saleDate: new Date(),
            staffId: item.staffId ? Number(item.staffId) : undefined,
            staffName: item.staffName,
            commissionAmount: commissionAmount,
            totalPrice: totalPrice
          };

          await setServiceSales([...serviceSales, newServiceSale]);
          queryClient.setQueryData(['serviceSales'], [...serviceSales, newServiceSale]);

          // Add to customer records
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
            discount: item.discount || 0,
            staffId: item.staffId ? Number(item.staffId) : undefined,
            staffName: item.staffName,
            commissionAmount: commissionAmount
          };

          newRecords.push(newRecord);

          // Add personnel commission record if there's a staff member and commission
          if (item.staffId && commissionAmount > 0) {
            await addPersonnelRecord({
              personnelId: Number(item.staffId),
              type: 'commission',
              amount: commissionAmount,
              description: `Hizmet satış primi: ${service.name}`,
              date: new Date(),
              customerId: Number(formData.customerId),
              customerName: customer.name,
              serviceId: service.id,
              serviceName: service.name
            });
            console.log(`Personnel commission added: ₺${commissionAmount} for staff ${item.staffName}`);
          }
        }
      }

      // Add all customer records at once
      await setCustomerRecords([...existingRecords, ...newRecords]);
      queryClient.invalidateQueries({ queryKey: ['customerRecords'] });
      queryClient.invalidateQueries({ queryKey: ['personnel'] });

      console.log('New customer records added:', newRecords);

      toast({
        title: "Satış başarılı",
        description: "Tüm satışlar başarıyla kaydedildi ve personel primleri hesaplandı.",
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

// Helper function to get services
const getServices = async () => {
  try {
    return await import('@/utils/storage').then(m => m.getServices());
  } catch (error) {
    console.error('Error getting services', error);
    return [];
  }
};
