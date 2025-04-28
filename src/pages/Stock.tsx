import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { getStock, getSales } from "@/utils/localStorage";
import StockTable from "@/components/stock/StockTable";
import StockEntryForm from "@/components/stock/StockEntryForm";
import SaleForm from "@/components/stock/SaleForm";
import SalesTable from "@/components/stock/SalesTable";
import StockMovementsTable from "@/components/stock/StockMovementsTable";
import AddProductForm from "@/components/stock/AddProductForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import EditProductForm from "@/components/stock/EditProductForm";

const Stock = () => {
  const [showStockEntryForm, setShowStockEntryForm] = useState(false);
  const [showSaleForm, setShowSaleForm] = useState(false);
  const [showAddProductForm, setShowAddProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<StockItem | null>(null);

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

  return (
    <div className="p-8 pl-72 space-y-8 animate-fadeIn">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-serif">Stok Yönetimi</h1>
        <div className="space-x-4">
          <Button onClick={() => setShowStockEntryForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Stok Girişi
          </Button>
          <Button onClick={() => setShowSaleForm(true)} variant="secondary">
            <Plus className="w-4 h-4 mr-2" />
            Satış
          </Button>
          <Button onClick={() => setShowAddProductForm(true)} variant="outline">
            <Plus className="w-4 h-4 mr-2" />
            Yeni Ürün
          </Button>
        </div>
      </div>

      <Tabs defaultValue="stock">
        <TabsList>
          <TabsTrigger value="stock">Stok Durumu</TabsTrigger>
          <TabsTrigger value="movements">Stok Hareketleri</TabsTrigger>
          <TabsTrigger value="sales">Satışlar</TabsTrigger>
          <TabsTrigger value="products">Yeni Ürün Girişi</TabsTrigger>
        </TabsList>

        <TabsContent value="stock">
          <StockTable searchTerm="" onEditProduct={setEditingProduct} />
        </TabsContent>

        <TabsContent value="movements">
          <StockMovementsTable />
        </TabsContent>

        <TabsContent value="sales">
          <SalesTable sales={sales} />
        </TabsContent>

        <TabsContent value="products">
          <AddProductForm
            showForm={true}
            setShowForm={setShowAddProductForm}
            stock={stock}
          />
        </TabsContent>
      </Tabs>

      {showStockEntryForm && (
        <StockEntryForm
          showForm={showStockEntryForm}
          setShowForm={setShowStockEntryForm}
          stock={stock}
        />
      )}

      {showSaleForm && (
        <SaleForm
          showForm={showSaleForm}
          setShowForm={setShowSaleForm}
          stock={stock}
          sales={sales}
        />
      )}

      {showAddProductForm && (
        <AddProductForm
          showForm={showAddProductForm}
          setShowForm={setShowAddProductForm}
          stock={stock}
        />
      )}

      {editingProduct && (
        <EditProductForm
          product={editingProduct}
          showForm={!!editingProduct}
          setShowForm={(show) => !show && setEditingProduct(null)}
        />
      )}
    </div>
  );
};

export default Stock;
