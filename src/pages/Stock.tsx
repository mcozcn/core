import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { getStock } from "@/utils/localStorage";
import StockTable from "@/components/stock/StockTable";
import StockEntryForm from "@/components/stock/StockEntryForm";
import SaleForm from "@/components/stock/SaleForm";
import SalesTable from "@/components/stock/SalesTable";
import StockMovementsTable from "@/components/stock/StockMovementsTable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Stock = () => {
  const [showStockEntryForm, setShowStockEntryForm] = useState(false);
  const [showSaleForm, setShowSaleForm] = useState(false);

  const { data: stock = [] } = useQuery({
    queryKey: ['stock'],
    queryFn: () => {
      console.log('Fetching stock from localStorage');
      return getStock();
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
        </div>
      </div>

      <Tabs defaultValue="stock">
        <TabsList>
          <TabsTrigger value="stock">Stok Durumu</TabsTrigger>
          <TabsTrigger value="movements">Stok Hareketleri</TabsTrigger>
          <TabsTrigger value="sales">Satışlar</TabsTrigger>
        </TabsList>

        <TabsContent value="stock">
          <StockTable stock={stock} />
        </TabsContent>

        <TabsContent value="movements">
          <StockMovementsTable />
        </TabsContent>

        <TabsContent value="sales">
          <SalesTable />
        </TabsContent>
      </Tabs>

      {showStockEntryForm && (
        <StockEntryForm
          showForm={showStockEntryForm}
          onClose={() => setShowStockEntryForm(false)}
        />
      )}

      {showSaleForm && (
        <SaleForm
          showForm={showSaleForm}
          onClose={() => setShowSaleForm(false)}
        />
      )}
    </div>
  );
};

export default Stock;