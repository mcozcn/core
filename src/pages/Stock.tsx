import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useQuery } from "@tanstack/react-query";
import { getStock, getSales } from "@/utils/localStorage";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AddProductForm from "@/components/stock/AddProductForm";
import SaleForm from "@/components/stock/SaleForm";
import StockTable from "@/components/stock/StockTable";
import SalesTable from "@/components/stock/SalesTable";

const Stock = () => {
  const [showForm, setShowForm] = useState(false);
  const [showSaleForm, setShowSaleForm] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

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

      <AddProductForm 
        showForm={showForm} 
        setShowForm={setShowForm} 
        stock={stock} 
      />

      <SaleForm 
        showForm={showSaleForm} 
        setShowForm={setShowSaleForm} 
        stock={stock}
        sales={sales}
      />

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
            <StockTable filteredStock={filteredStock} />
          </Card>
        </TabsContent>

        <TabsContent value="sales">
          <Card>
            <SalesTable sales={sales} />
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Stock;