import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { getStock, getServices, type StockItem, type Service } from "@/utils/localStorage";
import StockTable from "@/components/stock/StockTable";
import StockEntryForm from "@/components/stock/StockEntryForm";
import StockMovementsTable from "@/components/stock/StockMovementsTable";
import AddProductForm from "@/components/stock/AddProductForm";
import EditProductForm from "@/components/stock/EditProductForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import EditServiceForm from "@/components/services/EditServiceForm";
import AddServiceForm from "@/components/services/AddServiceForm";
import ServiceList from "@/components/services/ServiceList";
import ServiceHistoryTable from "@/components/services/ServiceHistoryTable";

const Stock = () => {
  const [showStockEntryForm, setShowStockEntryForm] = useState(false);
  const [showAddProductForm, setShowAddProductForm] = useState(false);
  const [showAddServiceForm, setShowAddServiceForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<StockItem | null>(null);
  const [editingService, setEditingService] = useState<Service | null>(null);

  const { data: stock = [] } = useQuery({
    queryKey: ['stock'],
    queryFn: () => {
      console.log('Fetching stock from localStorage');
      return getStock();
    },
  });

  const { data: services = [] } = useQuery({
    queryKey: ['services'],
    queryFn: () => {
      console.log('Fetching services from localStorage');
      return getServices();
    },
  });

  return (
    <div className="p-8 pl-72 space-y-8 animate-fadeIn">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-serif">Stok ve Hizmet Yönetimi</h1>
        <div className="space-x-4">
          <Button onClick={() => setShowStockEntryForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Stok Girişi
          </Button>
          <Button onClick={() => setShowAddProductForm(true)} variant="outline">
            <Plus className="w-4 h-4 mr-2" />
            Yeni Ürün
          </Button>
          <Button onClick={() => setShowAddServiceForm(true)} variant="outline">
            <Plus className="w-4 h-4 mr-2" />
            Yeni Hizmet
          </Button>
        </div>
      </div>

      <Tabs defaultValue="stock">
        <TabsList>
          <TabsTrigger value="stock">Stok Durumu</TabsTrigger>
          <TabsTrigger value="services">Hizmetler</TabsTrigger>
          <TabsTrigger value="movements">Stok Hareketleri</TabsTrigger>
        </TabsList>

        <TabsContent value="stock">
          <StockTable searchTerm="" onEditProduct={setEditingProduct} />
        </TabsContent>

        <TabsContent value="services" className="space-y-8">
          <ServiceList services={services} onEditService={setEditingService} />
          <ServiceHistoryTable />
        </TabsContent>

        <TabsContent value="movements">
          <StockMovementsTable />
        </TabsContent>
      </Tabs>

      {showStockEntryForm && (
        <StockEntryForm
          showForm={showStockEntryForm}
          setShowForm={setShowStockEntryForm}
          stock={stock}
        />
      )}

      {showAddProductForm && (
        <AddProductForm
          showForm={showAddProductForm}
          setShowForm={setShowAddProductForm}
          stock={stock}
        />
      )}

      {showAddServiceForm && (
        <AddServiceForm
          showForm={showAddServiceForm}
          setShowForm={setShowAddServiceForm}
          services={services}
        />
      )}

      {editingProduct && (
        <EditProductForm
          product={editingProduct}
          showForm={!!editingProduct}
          setShowForm={(show) => !show && setEditingProduct(null)}
        />
      )}

      {editingService && (
        <EditServiceForm
          service={editingService}
          showForm={!!editingService}
          setShowForm={(show) => !show && setEditingService(null)}
        />
      )}
    </div>
  );
};

export default Stock;
