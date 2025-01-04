import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { getStock, getServices, getSales, getServiceSales } from "@/utils/localStorage";
import SaleForm from "@/components/stock/SaleForm";
import ServiceSaleForm from "@/components/services/ServiceSaleForm";
import SalesTable from "@/components/stock/SalesTable";
import ServiceSalesTable from "@/components/services/ServiceSalesTable";

const Sales = () => {
  const [showProductSaleForm, setShowProductSaleForm] = useState(false);
  const [showServiceSaleForm, setShowServiceSaleForm] = useState(false);

  const { data: stock = [] } = useQuery({
    queryKey: ['stock'],
    queryFn: () => {
      console.log('Fetching stock for sales');
      return getStock();
    },
  });

  const { data: services = [] } = useQuery({
    queryKey: ['services'],
    queryFn: () => {
      console.log('Fetching services for sales');
      return getServices();
    },
  });

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

      <Tabs defaultValue="product-sales" className="space-y-4">
        <TabsList>
          <TabsTrigger value="product-sales">Ürün Satışları</TabsTrigger>
          <TabsTrigger value="service-sales">Hizmet Satışları</TabsTrigger>
        </TabsList>

        <TabsContent value="product-sales">
          <Card className="p-6">
            <button 
              onClick={() => setShowProductSaleForm(true)}
              className="mb-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
            >
              Yeni Ürün Satışı
            </button>

            {showProductSaleForm && (
              <SaleForm
                showForm={showProductSaleForm}
                setShowForm={setShowProductSaleForm}
                stock={stock}
                sales={sales}
              />
            )}

            <SalesTable sales={sales} />
          </Card>
        </TabsContent>

        <TabsContent value="service-sales">
          <Card className="p-6">
            <button 
              onClick={() => setShowServiceSaleForm(true)}
              className="mb-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
            >
              Yeni Hizmet Satışı
            </button>

            {showServiceSaleForm && (
              <ServiceSaleForm
                showForm={showServiceSaleForm}
                setShowForm={setShowServiceSaleForm}
                services={services}
                sales={serviceSales}
              />
            )}

            <ServiceSalesTable sales={serviceSales} />
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Sales;