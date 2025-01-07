import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { getSales, getServiceSales } from "@/utils/localStorage";
import SalesTable from "@/components/stock/SalesTable";
import ServiceSalesTable from "@/components/services/ServiceSalesTable";
import UnifiedSaleForm from "@/components/sales/UnifiedSaleForm";

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
    <div className="p-8 pl-72 animate-fadeIn">
      <div className="mb-8">
        <h1 className="text-4xl font-serif">Satış Yönetimi</h1>
      </div>

      <button 
        onClick={() => setShowSaleForm(true)}
        className="mb-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
      >
        Yeni Satış
      </button>

      <UnifiedSaleForm
        showForm={showSaleForm}
        setShowForm={setShowSaleForm}
      />

      <Tabs defaultValue="product-sales" className="space-y-4">
        <TabsList>
          <TabsTrigger value="product-sales">Ürün Satışları</TabsTrigger>
          <TabsTrigger value="service-sales">Hizmet Satışları</TabsTrigger>
        </TabsList>

        <TabsContent value="product-sales">
          <Card className="p-6">
            <SalesTable sales={sales} />
          </Card>
        </TabsContent>

        <TabsContent value="service-sales">
          <Card className="p-6">
            <ServiceSalesTable sales={serviceSales} />
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Sales;