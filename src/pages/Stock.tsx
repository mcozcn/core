
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
    <div className="p-4 md:p-6 md:pl-72 space-y-4 md:space-y-6 animate-fadeIn bg-gradient-to-br from-background via-background to-accent/5 min-h-screen">
      {/* Header Section */}
      <div className="mb-4 md:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 md:mb-6">
          <div>
            <h1 className="text-2xl md:text-4xl font-serif bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Stok ve Hizmet Yönetimi
            </h1>
            <p className="text-sm md:text-base text-muted-foreground mt-1 md:mt-2">Ürün stoku ve hizmetlerinizi tek yerden yönetin</p>
          </div>
          
          <div className="flex flex-wrap gap-2 sm:gap-3">
            <Button 
              onClick={() => setShowStockEntryForm(true)}
              size="sm"
              className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all duration-300 text-xs md:text-sm"
            >
              <Package className="h-4 w-4" />
              <span className="hidden sm:inline">Stok Girişi</span>
              <span className="sm:hidden">Stok</span>
            </Button>
            <Button 
              onClick={() => setShowAddProductForm(true)} 
              variant="outline"
              size="sm"
              className="flex items-center gap-2 border-primary text-primary hover:bg-primary hover:text-white shadow-md hover:shadow-lg transition-all duration-300 text-xs md:text-sm"
            >
              <Tag className="h-4 w-4" />
              <span className="hidden sm:inline">Yeni Ürün</span>
              <span className="sm:hidden">Ürün</span>
            </Button>
            <Button 
              onClick={() => setShowAddServiceForm(true)} 
              variant="outline"
              size="sm"
              className="flex items-center gap-2 border-purple-500 text-purple-500 hover:bg-purple-500 hover:text-white shadow-md hover:shadow-lg transition-all duration-300 text-xs md:text-sm"
            >
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Yeni Hizmet</span>
              <span className="sm:hidden">Hizmet</span>
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-4 md:mb-6">
          <Card className="p-3 md:p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="p-1.5 md:p-2 bg-green-500 rounded-lg">
                <Package className="h-4 w-4 md:h-5 md:w-5 text-white" />
              </div>
              <div>
                <p className="text-xs md:text-sm text-green-600 font-medium">Toplam Ürün</p>
                <p className="text-lg md:text-2xl font-bold text-green-700">{totalProducts}</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-3 md:p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="p-1.5 md:p-2 bg-purple-500 rounded-lg">
                <FileText className="h-4 w-4 md:h-5 md:w-5 text-white" />
              </div>
              <div>
                <p className="text-xs md:text-sm text-purple-600 font-medium">Toplam Hizmet</p>
                <p className="text-lg md:text-2xl font-bold text-purple-700">{totalServices}</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-3 md:p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="p-1.5 md:p-2 bg-blue-500 rounded-lg">
                <Warehouse className="h-4 w-4 md:h-5 md:w-5 text-white" />
              </div>
              <div>
                <p className="text-xs md:text-sm text-blue-600 font-medium">Stok Değeri</p>
                <p className="text-lg md:text-2xl font-bold text-blue-700">₺{totalStockValue.toLocaleString()}</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-3 md:p-4 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border-red-200 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="p-1.5 md:p-2 bg-red-500 rounded-lg">
                <TrendingUp className="h-4 w-4 md:h-5 md:w-5 text-white" />
              </div>
              <div>
                <p className="text-xs md:text-sm text-red-600 font-medium">Kritik Stok</p>
                <p className="text-lg md:text-2xl font-bold text-red-700">{lowStockItems}</p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <Tabs defaultValue="stock" className="space-y-4 md:space-y-6">
        <TabsList className="w-full grid grid-cols-3 bg-muted/50 p-1 rounded-lg h-auto">
          <TabsTrigger 
            value="stock"
            className="text-xs md:text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all py-2 px-1 md:px-3"
          >
            <Package className="h-4 w-4 md:mr-2" />
            <span className="hidden md:inline">Stok Durumu</span>
          </TabsTrigger>
          <TabsTrigger 
            value="services"
            className="text-xs md:text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all py-2 px-1 md:px-3"
          >
            <FileText className="h-4 w-4 md:mr-2" />
            <span className="hidden md:inline">Hizmetler</span>
          </TabsTrigger>
          <TabsTrigger 
            value="movements"
            className="text-xs md:text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all py-2 px-1 md:px-3"
          >
            <BarChart3 className="h-4 w-4 md:mr-2" />
            <span className="hidden md:inline">Stok Hareketleri</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="stock" className="space-y-4">
          <Card className="p-3 md:p-6 shadow-lg border-0 bg-white/70 dark:bg-card/70 backdrop-blur-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 md:mb-6">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                <h2 className="text-base md:text-xl font-semibold">Ürün Stok Durumu</h2>
                <span className="text-xs md:text-sm text-muted-foreground">({totalProducts})</span>
              </div>
              <div className="w-full sm:max-w-md">
                <SearchInput 
                  value={stockSearchTerm} 
                  onChange={setStockSearchTerm} 
                  placeholder="Ürün ara..."
                />
              </div>
            </div>
            <div className="overflow-x-auto -mx-3 md:mx-0">
              <div className="min-w-[600px] md:min-w-0 px-3 md:px-0">
                <StockTable searchTerm={stockSearchTerm} onEditProduct={setEditingProduct} />
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="services" className="space-y-4">
          <Card className="p-3 md:p-6 shadow-lg border-0 bg-white/70 dark:bg-card/70 backdrop-blur-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 md:mb-6">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                <h2 className="text-base md:text-xl font-semibold">Hizmet Listesi</h2>
                <span className="text-xs md:text-sm text-muted-foreground">({totalServices})</span>
              </div>
              <div className="w-full sm:max-w-md">
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
          
          <Card className="p-3 md:p-6 shadow-lg border-0 bg-white/70 dark:bg-card/70 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-3 md:mb-4">
              <BarChart3 className="h-4 w-4 md:h-5 md:w-5 text-primary" />
              <h2 className="text-base md:text-xl font-semibold">Hizmet Geçmişi</h2>
            </div>
            <div className="overflow-x-auto -mx-3 md:mx-0">
              <div className="min-w-[600px] md:min-w-0 px-3 md:px-0">
                <ServiceHistoryTable searchTerm={serviceSearchTerm} />
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="movements" className="space-y-4">
          <Card className="p-3 md:p-6 shadow-lg border-0 bg-white/70 dark:bg-card/70 backdrop-blur-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 md:mb-6">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                <h2 className="text-base md:text-xl font-semibold">Stok Hareketleri</h2>
              </div>
              <div className="w-full sm:max-w-md">
                <SearchInput 
                  value={movementSearchTerm} 
                  onChange={setMovementSearchTerm} 
                  placeholder="Stok hareketi ara..."
                />
              </div>
            </div>
            <div className="overflow-x-auto -mx-3 md:mx-0">
              <div className="min-w-[600px] md:min-w-0 px-3 md:px-0">
                <StockMovementsTable searchTerm={movementSearchTerm} />
              </div>
            </div>
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
