import React, { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/components/ui/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";
import CustomerSelectionDialog from '../common/CustomerSelectionDialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  getStock,
  getServices,
  getCustomers,
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

const UnifiedSaleForm = ({ showForm, setShowForm }: { showForm: boolean; setShowForm: (show: boolean) => void }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [customerSearch, setCustomerSearch] = useState('');
  const [saleType, setSaleType] = useState<'product' | 'service'>('product');
  const [saleData, setSaleData] = useState({
    itemId: '',
    quantity: '1',
    customerId: '',
    discount: '0'
  });

  const { data: stock = [] } = useQuery({
    queryKey: ['stock'],
    queryFn: getStock,
  });

  const { data: services = [] } = useQuery({
    queryKey: ['services'],
    queryFn: getServices,
  });

  const { data: customers = [] } = useQuery({
    queryKey: ['customers'],
    queryFn: () => {
      console.log('Fetching customers for unified sale form');
      return getCustomers();
    },
  });

  const { data: sales = [] } = useQuery({
    queryKey: ['sales'],
    queryFn: getSales,
  });

  const { data: serviceSales = [] } = useQuery({
    queryKey: ['serviceSales'],
    queryFn: getServiceSales,
  });

  const selectedCustomer = customers.find(c => c.id.toString() === saleData.customerId);

  const handleSale = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (saleType === 'product') {
        const product = stock.find(item => item.productId.toString() === saleData.itemId);
        if (!product) throw new Error("Ürün bulunamadı");
        if (product.quantity < Number(saleData.quantity)) throw new Error("Yetersiz stok");

        const totalPrice = (product.price * Number(saleData.quantity)) - Number(saleData.discount);

        const newSale: Sale = {
          id: Date.now(),
          productId: product.productId,
          productName: product.productName,
          quantity: Number(saleData.quantity),
          totalPrice,
          discount: Number(saleData.discount),
          customerName: selectedCustomer?.name || '',
          customerPhone: selectedCustomer?.phone || '',
          saleDate: new Date(),
        };

        // Update stock
        const updatedStock = stock.map(item =>
          item.productId === product.productId
            ? { ...item, quantity: item.quantity - Number(saleData.quantity), lastUpdated: new Date() }
            : item
        );

        setStock(updatedStock);
        setSales([...sales, newSale]);
        queryClient.setQueryData(['stock'], updatedStock);
        queryClient.setQueryData(['sales'], [...sales, newSale]);

        // Add to customer records
        const newRecord: CustomerRecord = {
          id: Date.now(),
          customerId: Number(saleData.customerId),
          type: 'product',
          itemId: product.productId,
          itemName: product.productName,
          amount: totalPrice,
          date: new Date(),
          isPaid: false,
          description: `Ürün satışı: ${product.productName} (${saleData.quantity} adet)`,
          recordType: 'debt'
        };

        const existingRecords = getCustomerRecords();
        setCustomerRecords([...existingRecords, newRecord]);
        queryClient.invalidateQueries({ queryKey: ['customerRecords'] });

        toast({
          title: "Satış başarılı",
          description: `${product.productName} satışı gerçekleştirildi.`,
        });
      } else {
        const service = services.find(item => item.id.toString() === saleData.itemId);
        if (!service) throw new Error("Hizmet bulunamadı");

        const newSale: ServiceSale = {
          id: Date.now(),
          serviceId: service.id,
          serviceName: service.name,
          price: service.price - Number(saleData.discount),
          customerName: selectedCustomer?.name || '',
          customerPhone: selectedCustomer?.phone || '',
          saleDate: new Date(),
        };

        setServiceSales([...serviceSales, newSale]);
        queryClient.setQueryData(['serviceSales'], [...serviceSales, newSale]);

        // Add to customer records
        const newRecord: CustomerRecord = {
          id: Date.now(),
          customerId: Number(saleData.customerId),
          type: 'service',
          itemId: service.id,
          itemName: service.name,
          amount: service.price - Number(saleData.discount),
          date: new Date(),
          isPaid: false,
          description: `Hizmet satışı: ${service.name}`,
          recordType: 'debt'
        };

        const existingRecords = getCustomerRecords();
        setCustomerRecords([...existingRecords, newRecord]);
        queryClient.invalidateQueries({ queryKey: ['customerRecords'] });

        toast({
          title: "Satış başarılı",
          description: `${service.name} satışı gerçekleştirildi.`,
        });
      }

      setSaleData({
        itemId: '',
        quantity: '1',
        customerId: '',
        discount: '0'
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

  const items = saleType === 'product' ? stock : services;

  return (
    <Card className="p-6 mb-8">
      <form onSubmit={handleSale} className="space-y-4">
        <div>
          <Label>Satış Türü</Label>
          <RadioGroup
            value={saleType}
            onValueChange={(value) => {
              setSaleType(value as 'product' | 'service');
              setSaleData(prev => ({ ...prev, itemId: '', quantity: '1' }));
            }}
            className="flex space-x-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="product" id="product" />
              <Label htmlFor="product">Ürün</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="service" id="service" />
              <Label htmlFor="service">Hizmet</Label>
            </div>
          </RadioGroup>
        </div>

        <div>
          <Label>Müşteri</Label>
          <CustomerSelectionDialog
            customers={customers}
            selectedCustomer={selectedCustomer}
            customerSearch={customerSearch}
            setCustomerSearch={setCustomerSearch}
            onCustomerSelect={(customerId) => setSaleData(prev => ({ ...prev, customerId }))}
          />
        </div>

        <div>
          <Label>{saleType === 'product' ? 'Ürün' : 'Hizmet'}</Label>
          <Select
            value={saleData.itemId}
            onValueChange={(value) => setSaleData({ ...saleData, itemId: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder={saleType === 'product' ? 'Ürün seçin' : 'Hizmet seçin'} />
            </SelectTrigger>
            <SelectContent>
              {saleType === 'product' ? (
                stock.map((item) => (
                  <SelectItem key={item.productId} value={item.productId.toString()}>
                    {item.productName} - Stok: {item.quantity} - {item.price} ₺
                  </SelectItem>
                ))
              ) : (
                services.map((service) => (
                  <SelectItem key={service.id} value={service.id.toString()}>
                    {service.name} - {service.price} ₺
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>

        {saleType === 'product' && (
          <div>
            <Label>Miktar</Label>
            <Input
              type="number"
              value={saleData.quantity}
              onChange={(e) => setSaleData({ ...saleData, quantity: e.target.value })}
              placeholder="Satış miktarını girin"
              min="1"
              required
            />
          </div>
        )}

        <div>
          <Label>İndirim Tutarı (₺)</Label>
          <Input
            type="number"
            value={saleData.discount}
            onChange={(e) => setSaleData({ ...saleData, discount: e.target.value })}
            placeholder="İndirim tutarını girin"
            min="0"
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

export default UnifiedSaleForm;