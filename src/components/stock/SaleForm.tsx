import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { getStock, setStock, getSales, setSales, getCustomers, type StockItem, type Sale, setCustomerRecords, getCustomerRecords, type CustomerRecord } from "@/utils/localStorage";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Search } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQuery } from "@tanstack/react-query";

interface SaleFormProps {
  showForm: boolean;
  setShowForm: (show: boolean) => void;
  stock: StockItem[];
  sales: Sale[];
}

const SaleForm = ({ showForm, setShowForm, stock, sales }: SaleFormProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [customerSearch, setCustomerSearch] = useState('');
  const [saleData, setSaleData] = useState({
    productId: '',
    quantity: '',
    customerId: '',
    discount: '0'
  });

  const { data: customers = [] } = useQuery({
    queryKey: ['customers'],
    queryFn: () => {
      console.log('Fetching customers for sale form');
      return getCustomers();
    },
  });

  const filteredCustomers = customers.filter(customer => 
    customer.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
    customer.phone.includes(customerSearch)
  );

  const selectedCustomer = customers.find(c => c.id.toString() === saleData.customerId);

  const handleSale = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const product = stock.find(item => item.productId === Number(saleData.productId));
      const customer = customers.find(c => c.id === Number(saleData.customerId));
      
      if (!product) {
        throw new Error("Ürün bulunamadı");
      }

      if (!customer) {
        throw new Error("Müşteri bulunamadı");
      }

      const quantity = Number(saleData.quantity);
      const discount = Number(saleData.discount);

      if (product.quantity < quantity) {
        throw new Error("Yetersiz stok");
      }

      const totalPrice = (product.price * quantity) - discount;

      const newSale: Sale = {
        id: Date.now(),
        productId: product.productId,
        productName: product.productName,
        quantity,
        totalPrice,
        discount,
        customerName: customer.name,
        customerPhone: customer.phone,
        saleDate: new Date(),
      };

      // Update stock
      const updatedStock = stock.map(item => 
        item.productId === product.productId 
          ? { ...item, quantity: item.quantity - quantity, lastUpdated: new Date() }
          : item
      );

      // Update sales
      const updatedSales = [...sales, newSale];

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
        description: `Ürün satışı: ${product.productName} (${quantity} adet)`,
        recordType: 'debt'
      };

      const existingRecords = getCustomerRecords();

      setStock(updatedStock);
      setSales(updatedSales);
      setCustomerRecords([...existingRecords, newRecord]);

      queryClient.setQueryData(['stock'], updatedStock);
      queryClient.setQueryData(['sales'], updatedSales);
      queryClient.invalidateQueries({ queryKey: ['customerRecords'] });

      console.log('Sale completed:', newSale);
      console.log('Customer record added:', newRecord);

      toast({
        title: "Satış başarılı",
        description: `${product.productName} satışı gerçekleştirildi.`,
      });

      setSaleData({
        productId: '',
        quantity: '',
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

        <div>
          <Label>Müşteri</Label>
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-between"
                type="button"
              >
                {selectedCustomer ? (
                  <span>{selectedCustomer.name} - {selectedCustomer.phone}</span>
                ) : (
                  <span>Müşteri seçin...</span>
                )}
                <Search className="ml-2 h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Müşteri Seç</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <Input
                  placeholder="Müşteri ara..."
                  value={customerSearch}
                  onChange={(e) => setCustomerSearch(e.target.value)}
                />
                <ScrollArea className="h-[300px]">
                  <div className="space-y-2">
                    {filteredCustomers.map((customer) => (
                      <Button
                        key={customer.id}
                        variant="ghost"
                        className="w-full justify-start"
                        onClick={() => {
                          setSaleData(prev => ({ ...prev, customerId: customer.id.toString() }));
                          setCustomerSearch('');
                        }}
                      >
                        <div className="text-left">
                          <div>{customer.name}</div>
                          <div className="text-sm text-muted-foreground">{customer.phone}</div>
                        </div>
                      </Button>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </DialogContent>
          </Dialog>
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