import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getCustomerRecords, getPayments, getCosts } from "@/utils/localStorage";
import CustomerRecordsList from "@/components/customers/CustomerRecordsList";
import MonthlyFinancialSummary from "@/components/dashboard/MonthlyFinancialSummary";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { addDays } from "date-fns";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";
import { DateRange } from "react-day-picker";
import { tr } from 'date-fns/locale';
import { useToast } from "@/hooks/use-toast";

const Financial = () => {
  const [dateRange, setDateRange] = useState<DateRange>({
    from: new Date(),
    to: addDays(new Date(), 7)
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Verileri çekmek için useQuery kullanımı
  const { data: customerRecords = [], isLoading: isLoadingRecords } = useQuery({
    queryKey: ['customerRecords'],
    queryFn: getCustomerRecords,
    meta: {
      onError: () => {
        toast({
          variant: "destructive",
          title: "Hata",
          description: "Müşteri kayıtları yüklenirken bir hata oluştu.",
        });
      }
    }
  });

  const { data: payments = [], isLoading: isLoadingPayments } = useQuery({
    queryKey: ['payments'],
    queryFn: getPayments,
    meta: {
      onError: () => {
        toast({
          variant: "destructive",
          title: "Hata",
          description: "Ödeme kayıtları yüklenirken bir hata oluştu.",
        });
      }
    }
  });

  const { data: costs = [], isLoading: isLoadingCosts } = useQuery({
    queryKey: ['costs'],
    queryFn: getCosts,
    meta: {
      onError: () => {
        toast({
          variant: "destructive",
          title: "Hata",
          description: "Masraf kayıtları yüklenirken bir hata oluştu.",
        });
      }
    }
  });

  const resetDateFilter = () => {
    setDateRange({
      from: new Date(),
      to: addDays(new Date(), 7)
    });
  };

  // Tarih aralığına göre kayıtları filtreleme
  const filteredRecords = customerRecords.filter(record => {
    if (!dateRange.from || !dateRange.to) return true;
    const recordDate = new Date(record.date);
    return recordDate >= dateRange.from && recordDate <= dateRange.to;
  });

  const filteredPayments = payments.filter(payment => {
    if (!dateRange.from || !dateRange.to) return true;
    const paymentDate = new Date(payment.date);
    return paymentDate >= dateRange.from && paymentDate <= dateRange.to;
  });

  const filteredCosts = costs.filter(cost => {
    if (!dateRange.from || !dateRange.to) return true;
    const costDate = new Date(cost.date);
    return costDate >= dateRange.from && costDate <= dateRange.to;
  });

  console.log('Financial page data:', { 
    filteredRecords, 
    filteredPayments, 
    filteredCosts, 
    dateRange,
    totalRecords: customerRecords.length,
    totalPayments: payments.length,
    totalCosts: costs.length
  });

  if (isLoadingRecords || isLoadingPayments || isLoadingCosts) {
    return (
      <div className="p-8 pl-72 animate-fadeIn">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-muted-foreground">Yükleniyor...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 pl-72 animate-fadeIn">
      <div className="mb-8">
        <h1 className="text-4xl font-serif">Finansal Takip</h1>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <DatePickerWithRange date={dateRange} setDate={setDateRange} locale={tr} />
        <Button 
          variant="outline" 
          size="icon" 
          onClick={resetDateFilter} 
          title="Filtreyi Sıfırla"
        >
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
            <TabsList className="w-full justify-start">
              <TabsTrigger value="all">Tüm Kayıtlar</TabsTrigger>
              <TabsTrigger value="unpaid">Ödenmemiş</TabsTrigger>
              <TabsTrigger value="paid">Ödenmiş</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="p-4">
              <CustomerRecordsList records={filteredRecords} />
            </TabsContent>

            <TabsContent value="unpaid" className="p-4">
              <CustomerRecordsList 
                records={filteredRecords.filter(record => !record.isPaid)} 
              />
            </TabsContent>

            <TabsContent value="paid" className="p-4">
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