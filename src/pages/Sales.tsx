
import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { getSales, getServiceSales } from "@/utils/localStorage";
import SalesTable from "@/components/stock/SalesTable";
import ServiceSalesTable from "@/components/services/ServiceSalesTable";
import UnifiedSaleForm from "@/components/sales/UnifiedSaleForm";
import { Plus, ShoppingCart, Scissors, TrendingUp, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";

const Sales = () => {
  const [showSaleForm, setShowSaleForm] = useState(false);

  const { data: sales = [] } = useQuery({
    queryKey: ['sales'],
    queryFn: () => {
      console.log('Fetching product sales');
      return getSales();
    },
  });

  const { data: serviceSales = [] } = useQuery({
    queryKey: ['serviceSales'],
    queryFn: () => {
      console.log('Fetching service sales');
      return getServiceSales();
    },
  });

  // Calculate stats
  const totalProductSales = sales.reduce((sum, sale) => sum + (sale.totalPrice || sale.total), 0);
  const totalServiceSales = serviceSales.reduce((sum, sale) => sum + sale.price, 0);
  const totalSales = totalProductSales + totalServiceSales;
  const totalTransactions = sales.length + serviceSales.length;

  return (
    <div className="p-4 md:p-6 md:pl-72 animate-fadeIn bg-gradient-to-br from-background via-background to-accent/5 min-h-screen">
      {/* Header Section */}
      <div className="mb-6 md:mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 md:mb-6">
          <div>
            <h1 className="text-2xl md:text-4xl font-serif bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Satış Yönetimi
            </h1>
            <p className="text-sm md:text-base text-muted-foreground mt-1 md:mt-2">Ürün ve hizmet satışlarınızı yönetin</p>
          </div>
          
          <Button 
            onClick={() => setShowSaleForm(true)}
            className="flex items-center gap-2 px-4 md:px-6 py-2 md:py-3 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-xl transition-all duration-300 w-full sm:w-auto"
            size="default"
          >
            <Plus className="h-4 w-4 md:h-5 md:w-5" /> 
            <span>Yeni Satış</span>
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-4 md:mb-6">
          <Card className="p-3 md:p-4 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="p-1.5 md:p-2 bg-blue-500 rounded-lg">
                <DollarSign className="h-4 w-4 md:h-5 md:w-5 text-white" />
              </div>
              <div className="min-w-0">
                <p className="text-xs md:text-sm text-blue-600 font-medium truncate">Toplam Satış</p>
                <p className="text-lg md:text-2xl font-bold text-blue-700">₺{totalSales.toLocaleString()}</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-3 md:p-4 bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="p-1.5 md:p-2 bg-green-500 rounded-lg">
                <ShoppingCart className="h-4 w-4 md:h-5 md:w-5 text-white" />
              </div>
              <div className="min-w-0">
                <p className="text-xs md:text-sm text-green-600 font-medium truncate">Ürün Satışları</p>
                <p className="text-lg md:text-2xl font-bold text-green-700">₺{totalProductSales.toLocaleString()}</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-3 md:p-4 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="p-1.5 md:p-2 bg-purple-500 rounded-lg">
                <Scissors className="h-4 w-4 md:h-5 md:w-5 text-white" />
              </div>
              <div className="min-w-0">
                <p className="text-xs md:text-sm text-purple-600 font-medium truncate">Hizmet Satışları</p>
                <p className="text-lg md:text-2xl font-bold text-purple-700">₺{totalServiceSales.toLocaleString()}</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-3 md:p-4 bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="p-1.5 md:p-2 bg-orange-500 rounded-lg">
                <TrendingUp className="h-4 w-4 md:h-5 md:w-5 text-white" />
              </div>
              <div className="min-w-0">
                <p className="text-xs md:text-sm text-orange-600 font-medium truncate">Toplam İşlem</p>
                <p className="text-lg md:text-2xl font-bold text-orange-700">{totalTransactions}</p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <UnifiedSaleForm
        showForm={showSaleForm}
        setShowForm={setShowSaleForm}
      />

      <Tabs defaultValue="product-sales" className="space-y-4 md:space-y-6">
        <TabsList className="w-full grid grid-cols-2 bg-muted/50 p-1 rounded-lg">
          <TabsTrigger 
            value="product-sales" 
            className="text-xs md:text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all"
          >
            <ShoppingCart className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
            <span className="hidden sm:inline">Ürün Satışları</span>
            <span className="sm:hidden">Ürünler</span>
          </TabsTrigger>
          <TabsTrigger 
            value="service-sales" 
            className="text-xs md:text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all"
          >
            <Scissors className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
            <span className="hidden sm:inline">Hizmet Satışları</span>
            <span className="sm:hidden">Hizmetler</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="product-sales">
          <Card className="p-3 md:p-6 shadow-lg border-0 bg-white/70 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-3 md:mb-4">
              <ShoppingCart className="h-4 w-4 md:h-5 md:w-5 text-primary" />
              <h2 className="text-base md:text-xl font-semibold">Ürün Satışları</h2>
              <span className="text-xs md:text-sm text-muted-foreground">({sales.length})</span>
            </div>
            <div className="overflow-x-auto -mx-3 md:mx-0">
              <div className="min-w-[600px] md:min-w-0 px-3 md:px-0">
                <SalesTable sales={sales} />
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="service-sales">
          <Card className="p-3 md:p-6 shadow-lg border-0 bg-white/70 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-3 md:mb-4">
              <Scissors className="h-4 w-4 md:h-5 md:w-5 text-primary" />
              <h2 className="text-base md:text-xl font-semibold">Hizmet Satışları</h2>
              <span className="text-xs md:text-sm text-muted-foreground">({serviceSales.length})</span>
            </div>
            <div className="overflow-x-auto -mx-3 md:mx-0">
              <div className="min-w-[600px] md:min-w-0 px-3 md:px-0">
                <ServiceSalesTable sales={serviceSales} />
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Sales;
