import React from 'react';
import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { getSales, getServiceSales } from "@/utils/localStorage";
import { DollarSign } from "lucide-react";

const SalesSummary = () => {
  const { data: sales = [] } = useQuery({
    queryKey: ['sales'],
    queryFn: () => {
      console.log('Fetching sales for summary');
      return getSales();
    },
  });

  const { data: serviceSales = [] } = useQuery({
    queryKey: ['serviceSales'],
    queryFn: () => {
      console.log('Fetching service sales for summary');
      return getServiceSales();
    },
  });

  const today = new Date();
  const todaySales = sales.filter(sale => 
    new Date(sale.saleDate).toDateString() === today.toDateString()
  );

  const todayServiceSales = serviceSales.filter(sale => 
    new Date(sale.saleDate).toDateString() === today.toDateString()
  );

  const totalSalesAmount = todaySales.reduce((acc, sale) => acc + sale.totalPrice, 0);
  const totalServiceSalesAmount = todayServiceSales.reduce((acc, sale) => acc + sale.price, 0);
  const totalAmount = totalSalesAmount + totalServiceSalesAmount;

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-serif">Günlük Satış Özeti</h2>
        <DollarSign className="text-primary" size={24} />
      </div>
      
      <div className="space-y-4">
        <div className="flex justify-between items-center p-3 bg-accent rounded-lg">
          <span>Ürün Satışları</span>
          <span className="font-semibold">₺{totalSalesAmount.toLocaleString()}</span>
        </div>
        
        <div className="flex justify-between items-center p-3 bg-accent rounded-lg">
          <span>Hizmet Satışları</span>
          <span className="font-semibold">₺{totalServiceSalesAmount.toLocaleString()}</span>
        </div>
        
        <div className="flex justify-between items-center p-3 bg-primary/10 rounded-lg font-semibold">
          <span>Toplam</span>
          <span>₺{totalAmount.toLocaleString()}</span>
        </div>
      </div>
    </Card>
  );
};

export default SalesSummary;