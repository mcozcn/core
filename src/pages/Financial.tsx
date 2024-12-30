import React from 'react';
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { getCustomerRecords, getPayments } from "@/utils/localStorage";
import CustomerRecordsList from "@/components/customers/CustomerRecordsList";
import MonthlyFinancialSummary from "@/components/dashboard/MonthlyFinancialSummary";

const Financial = () => {
  const { data: customerRecords = [] } = useQuery({
    queryKey: ['customerRecords'],
    queryFn: getCustomerRecords,
  });

  const { data: payments = [] } = useQuery({
    queryKey: ['payments'],
    queryFn: getPayments,
  });

  return (
    <div className="p-8 pl-72 animate-fadeIn">
      <div className="mb-8">
        <h1 className="text-4xl font-serif">Finansal Takip</h1>
      </div>

      <div className="grid grid-cols-1 gap-8">
        <MonthlyFinancialSummary payments={payments} />
        
        <Card>
          <Tabs defaultValue="all" className="w-full">
            <TabsList>
              <TabsTrigger value="all">Tüm Kayıtlar</TabsTrigger>
              <TabsTrigger value="unpaid">Ödenmemiş</TabsTrigger>
              <TabsTrigger value="paid">Ödenmiş</TabsTrigger>
            </TabsList>

            <TabsContent value="all">
              <CustomerRecordsList records={customerRecords} />
            </TabsContent>

            <TabsContent value="unpaid">
              <CustomerRecordsList 
                records={customerRecords.filter(record => !record.isPaid)} 
              />
            </TabsContent>

            <TabsContent value="paid">
              <CustomerRecordsList 
                records={customerRecords.filter(record => record.isPaid)} 
              />
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
};

export default Financial;