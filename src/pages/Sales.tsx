
import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { getSales, getServiceSales } from "@/utils/localStorage";
import SalesTable from "@/components/stock/SalesTable";
import ServiceSalesTable from "@/components/services/ServiceSalesTable";
import UnifiedSaleForm from "@/components/sales/UnifiedSaleForm";
import { Plus } from "lucide-react";
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

  return (
    <div className="p-6 pl-72 animate-fadeIn">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-serif">Satış Yönetimi</h1>
        
        <Button 
          onClick={() => setShowSaleForm(true)}
          className="flex items-center gap-1"
          size="sm"
        >
          <Plus className="h-4 w-4" /> Yeni Satış
        </Button>
      </div>

      <UnifiedSaleForm
        showForm={showSaleForm}
        setShowForm={setShowSaleForm}
      />

      <Tabs defaultValue="product-sales" className="space-y-4">
        <TabsList className="w-full sm:w-auto grid grid-cols-2 sm:inline-flex">
          <TabsTrigger value="product-sales" className="text-sm">Ürün Satışları</TabsTrigger>
          <TabsTrigger value="service-sales" className="text-sm">Hizmet Satışları</TabsTrigger>
        </TabsList>

        <TabsContent value="product-sales">
          <Card className="p-4">
            <SalesTable sales={sales} />
          </Card>
        </TabsContent>

        <TabsContent value="service-sales">
          <Card className="p-4">
            <ServiceSalesTable sales={serviceSales} />
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Sales;
