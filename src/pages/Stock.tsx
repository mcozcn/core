import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getStock, setStock, getSales, setSales, type StockItem, type Sale } from "@/utils/localStorage";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Stock = () => {
  const [showForm, setShowForm] = useState(false);
  const [showSaleForm, setShowSaleForm] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    productName: '',
    quantity: '',
    price: '',
    category: '',
  });

  const [saleData, setSaleData] = useState({
    productId: '',
    quantity: '',
  });

  const { data: stock = [] } = useQuery({
    queryKey: ['stock'],
    queryFn: () => {
      console.log('Fetching stock from localStorage');
      return getStock();
    },
  });

  const { data: sales = [] } = useQuery({
    queryKey: ['sales'],
    queryFn: () => {
      console.log('Fetching sales from localStorage');
      return getSales();
    },
  });

  const categories = [...new Set(stock.map(item => item.category))];

  const filteredStock = selectedCategory === "all" 
    ? stock 
    : stock.filter(item => item.category === selectedCategory);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const newStockItem: StockItem = {
        id: Date.now(),
        productId: Date.now(),
        productName: formData.productName,
        quantity: Number(formData.quantity),
        price: Number(formData.price),
        category: formData.category,
        createdAt: new Date(),
        lastUpdated: new Date(),
      };

      const updatedStock = [...stock, newStockItem];
      setStock(updatedStock);
      queryClient.setQueryData(['stock'], updatedStock);

      console.log('Stock item saved to localStorage:', newStockItem);

      toast({
        title: "Başarıyla kaydedildi",
        description: `${newStockItem.productName} stok listenize eklendi.`,
      });

      setFormData({
        productName: '',
        quantity: '',
        price: '',
        category: '',
      });
      setShowForm(false);
    } catch (error) {
      console.error('Error saving stock item:', error);
      toast({
        variant: "destructive",
        title: "Hata!",
        description: "Kayıt sırasında bir hata oluştu. Lütfen tekrar deneyin.",
      });
    }
  };

  const handleSale = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const product = stock.find(item => item.productId === Number(saleData.productId));
      
      if (!product) {
        throw new Error("Ürün bulunamadı");
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
      });
      setShowSaleForm(false);
    } catch (error) {
      console.error('Error processing sale:', error);
      toast({
        variant: "destructive",
        title: "Hata!",
        description: error instanceof Error ? error.message : "Satış işlemi sırasında bir hata oluştu.",
      });
    }
  };

  return (
    <div className="p-8 pl-72 animate-fadeIn">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-4xl font-serif">Stok Yönetimi</h1>
        <div className="space-x-2">
          <Button onClick={() => setShowSaleForm(true)} variant="outline">
            Satış Yap
          </Button>
          <Button onClick={() => setShowForm(true)}>
            Yeni Ürün Ekle
          </Button>
        </div>
      </div>

      {showForm && (
        <Card className="p-6 mb-8">
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
              <Label>Fiyat (₺)</Label>
              <Input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="Ürün fiyatını girin"
                required
              />
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

            <div className="flex gap-2">
              <Button type="submit" className="flex-1">
                Kaydet
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
      )}

      {showSaleForm && (
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
              <Input
                type="number"
                value={saleData.quantity}
                onChange={(e) => setSaleData({ ...saleData, quantity: e.target.value })}
                placeholder="Satış miktarını girin"
                required
              />
            </div>

            <div className="flex gap-2">
              <Button type="submit" className="flex-1">
                Satışı Tamamla
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowSaleForm(false)}
              >
                İptal
              </Button>
            </div>
          </form>
        </Card>
      )}

      <Tabs defaultValue="stock" className="space-y-4">
        <TabsList>
          <TabsTrigger value="stock">Stok</TabsTrigger>
          <TabsTrigger value="sales">Satışlar</TabsTrigger>
        </TabsList>

        <TabsContent value="stock">
          <Card>
            <div className="p-4 border-b">
              <Label>Kategori Filtresi</Label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="flex h-10 rounded-md border border-input bg-background px-3 py-2 mt-2"
              >
                <option value="all">Tümü</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ürün Adı</TableHead>
                  <TableHead>Kategori</TableHead>
                  <TableHead>Stok</TableHead>
                  <TableHead>Fiyat</TableHead>
                  <TableHead>Son Güncelleme</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStock.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                      Stokta ürün bulunmamaktadır.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredStock.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.productName}</TableCell>
                      <TableCell>{item.category}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>{item.price} ₺</TableCell>
                      <TableCell>{new Date(item.lastUpdated).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="sales">
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ürün</TableHead>
                  <TableHead>Miktar</TableHead>
                  <TableHead>Toplam Fiyat</TableHead>
                  <TableHead>Tarih</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sales.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">
                      Henüz satış kaydı bulunmamaktadır.
                    </TableCell>
                  </TableRow>
                ) : (
                  sales.map((sale) => (
                    <TableRow key={sale.id}>
                      <TableCell>{sale.productName}</TableCell>
                      <TableCell>{sale.quantity}</TableCell>
                      <TableCell>{sale.totalPrice} ₺</TableCell>
                      <TableCell>{new Date(sale.saleDate).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Stock;