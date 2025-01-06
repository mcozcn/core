import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { getCustomerRecords, getPayments, getCosts } from "@/utils/localStorage";
import CustomerRecordsList from "@/components/customers/CustomerRecordsList";
import MonthlyFinancialSummary from "@/components/dashboard/MonthlyFinancialSummary";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { addDays } from "date-fns";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";

const Financial = () => {
  const [dateRange, setDateRange] = useState<{
    from: Date;
    to: Date;
  }>({
    from: new Date(),
    to: addDays(new Date(), 7)
  });

  const { data: customerRecords = [] } = useQuery({
    queryKey: ['customerRecords'],
    queryFn: getCustomerRecords,
  });

  const { data: payments = [] } = useQuery({
    queryKey: ['payments'],
    queryFn: getPayments,
  });

  const { data: costs = [] } = useQuery({
    queryKey: ['costs'],
    queryFn: getCosts,
  });

  const resetDateFilter = () => {
    setDateRange({
      from: new Date(),
      to: addDays(new Date(), 7)
    });
  };

  // Filter records based on date range
  const filteredRecords = customerRecords.filter(record => {
    const recordDate = new Date(record.date);
    return recordDate >= dateRange.from && recordDate <= dateRange.to;
  });

  const filteredPayments = payments.filter(payment => {
    const paymentDate = new Date(payment.date);
    return paymentDate >= dateRange.from && paymentDate <= dateRange.to;
  });

  const filteredCosts = costs.filter(cost => {
    const costDate = new Date(cost.date);
    return costDate >= dateRange.from && costDate <= dateRange.to;
  });

  console.log('Financial page data:', { filteredRecords, filteredPayments, filteredCosts, dateRange });

  return (
    <div className="p-8 pl-72 animate-fadeIn">
      <div className="mb-8">
        <h1 className="text-4xl font-serif">Finansal Takip</h1>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <DatePickerWithRange date={dateRange} setDate={setDateRange} />
        <Button variant="outline" size="icon" onClick={resetDateFilter} title="Filtreyi Sıfırla">
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-8">
        <MonthlyFinancialSummary 
          payments={filteredPayments} 
          customerRecords={filteredRecords}
          costs={filteredCosts}
        />
        
        <Card>
          <Tabs defaultValue="all" className="w-full">
            <TabsList>
              <TabsTrigger value="all">Tüm Kayıtlar</TabsTrigger>
              <TabsTrigger value="unpaid">Ödenmemiş</TabsTrigger>
              <TabsTrigger value="paid">Ödenmiş</TabsTrigger>
            </TabsList>

            <TabsContent value="all">
              <CustomerRecordsList records={filteredRecords} />
            </TabsContent>

            <TabsContent value="unpaid">
              <CustomerRecordsList 
                records={filteredRecords.filter(record => !record.isPaid)} 
              />
            </TabsContent>

            <TabsContent value="paid">
              <CustomerRecordsList 
                records={filteredRecords.filter(record => record.isPaid)} 
              />
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
};

export default Financial;