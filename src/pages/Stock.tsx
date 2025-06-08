
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Plus, Package, Tag, FileText, BarChart3, Warehouse, TrendingUp } from "lucide-react";
import { getStock, getServices, type StockItem, type Service } from "@/utils/localStorage";
import StockTable from "@/components/stock/StockTable";
import StockMovementsTable from "@/components/stock/StockMovementsTable";
import EditProductForm from "@/components/stock/EditProductForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import EditServiceForm from "@/components/services/EditServiceForm";
import ServiceList from "@/components/services/ServiceList";
import ServiceHistoryTable from "@/components/services/ServiceHistoryTable";
import SearchInput from "@/components/common/SearchInput";
import StockEntryFormModal from "@/components/stock/StockEntryFormModal";
import AddProductFormModal from "@/components/stock/AddProductFormModal";
import AddServiceFormModal from "@/components/services/AddServiceFormModal";
import { Card } from "@/components/ui/card";

const Stock = () => {
  const [showStockEntryForm, setShowStockEntryForm] = useState(false);
  const [showAddProductForm, setShowAddProductForm] = useState(false);
  const [showAddServiceForm, setShowAddServiceForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<StockItem | null>(null);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [stockSearchTerm, setStockSearchTerm] = useState("");
  const [serviceSearchTerm, setServiceSearchTerm] = useState("");
  const [movementSearchTerm, setMovementSearchTerm] = useState("");

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

  const filteredServices = services.filter(service => 
    service.name.toLowerCase().includes(serviceSearchTerm.toLowerCase())
  );

  // Calculate stats
  const totalProducts = stock.length;
  const totalServices = services.length;
  const totalStockValue = stock.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const lowStockItems = stock.filter(item => item.quantity <= 5).length;

  return (
    <div className="p-6 pl-72 space-y-6 animate-fadeIn bg-gradient-to-br from-background via-background to-accent/5 min-h-screen">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-4xl font-serif bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Stok ve Hizmet Yönetimi
            </h1>
            <p className="text-muted-foreground mt-2">Ürün stoku ve hizmetlerinizi tek yerden yönetin</p>
          </div>
          
          <div className="flex space-x-3">
            <Button 
              onClick={() => setShowStockEntryForm(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Package className="h-4 w-4" />
              Stok Girişi
            </Button>
            <Button 
              onClick={() => setShowAddProductForm(true)} 
              variant="outline"
              className="flex items-center gap-2 border-primary text-primary hover:bg-primary hover:text-white shadow-md hover:shadow-lg transition-all duration-300"
            >
              <Tag className="h-4 w-4" />
              Yeni Ürün
            </Button>
            <Button 
              onClick={() => setShowAddServiceForm(true)} 
              variant="outline"
              className="flex items-center gap-2 border-purple-500 text-purple-500 hover:bg-purple-500 hover:text-white shadow-md hover:shadow-lg transition-all duration-300"
            >
              <FileText className="h-4 w-4" />
              Yeni Hizmet
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4 bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500 rounded-lg">
                <Package className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-green-600 font-medium">Toplam Ürün</p>
                <p className="text-2xl font-bold text-green-700">{totalProducts}</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500 rounded-lg">
                <FileText className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-purple-600 font-medium">Toplam Hizmet</p>
                <p className="text-2xl font-bold text-purple-700">{totalServices}</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500 rounded-lg">
                <Warehouse className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-blue-600 font-medium">Stok Değeri</p>
                <p className="text-2xl font-bold text-blue-700">₺{totalStockValue.toLocaleString()}</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4 bg-gradient-to-br from-red-50 to-red-100 border-red-200 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-500 rounded-lg">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-red-600 font-medium">Kritik Stok</p>
                <p className="text-2xl font-bold text-red-700">{lowStockItems}</p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <Tabs defaultValue="stock" className="space-y-6">
        <TabsList className="w-full sm:w-auto grid grid-cols-3 sm:inline-flex bg-muted/50 p-1 rounded-lg">
          <TabsTrigger 
            value="stock"
            className="text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all"
          >
            <Package className="h-4 w-4 mr-2" />
            Stok Durumu
          </TabsTrigger>
          <TabsTrigger 
            value="services"
            className="text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all"
          >
            <FileText className="h-4 w-4 mr-2" />
            Hizmetler
          </TabsTrigger>
          <TabsTrigger 
            value="movements"
            className="text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all"
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            Stok Hareketleri
          </TabsTrigger>
        </TabsList>

        <TabsContent value="stock" className="space-y-4">
          <Card className="p-6 shadow-lg border-0 bg-white/70 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-semibold">Ürün Stok Durumu</h2>
                <span className="text-sm text-muted-foreground">({totalProducts} ürün)</span>
              </div>
              <div className="max-w-md">
                <SearchInput 
                  value={stockSearchTerm} 
                  onChange={setStockSearchTerm} 
                  placeholder="Ürün ara..."
                />
              </div>
            </div>
            <StockTable searchTerm={stockSearchTerm} onEditProduct={setEditingProduct} />
          </Card>
        </TabsContent>

        <TabsContent value="services" className="space-y-4">
          <Card className="p-6 shadow-lg border-0 bg-white/70 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-semibold">Hizmet Listesi</h2>
                <span className="text-sm text-muted-foreground">({totalServices} hizmet)</span>
              </div>
              <div className="max-w-md">
                <SearchInput 
                  value={serviceSearchTerm} 
                  onChange={setServiceSearchTerm} 
                  placeholder="Hizmet ara..."
                />
              </div>
            </div>
            <ServiceList 
              services={filteredServices} 
              onEditService={setEditingService} 
            />
          </Card>
          
          <Card className="p-6 shadow-lg border-0 bg-white/70 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">Hizmet Geçmişi</h2>
            </div>
            <ServiceHistoryTable searchTerm={serviceSearchTerm} />
          </Card>
        </TabsContent>

        <TabsContent value="movements" className="space-y-4">
          <Card className="p-6 shadow-lg border-0 bg-white/70 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-semibold">Stok Hareketleri</h2>
              </div>
              <div className="max-w-md">
                <SearchInput 
                  value={movementSearchTerm} 
                  onChange={setMovementSearchTerm} 
                  placeholder="Stok hareketi ara..."
                />
              </div>
            </div>
            <StockMovementsTable searchTerm={movementSearchTerm} />
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modal Forms */}
      <StockEntryFormModal
        showForm={showStockEntryForm}
        setShowForm={setShowStockEntryForm}
        stock={stock}
      />

      <AddProductFormModal
        showForm={showAddProductForm}
        setShowForm={setShowAddProductForm}
        stock={stock}
      />

      <AddServiceFormModal
        showForm={showAddServiceForm}
        setShowForm={setShowAddServiceForm}
        services={services}
      />

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
