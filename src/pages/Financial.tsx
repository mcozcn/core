
import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { getCustomerRecords, getPayments, getCosts, getCustomers } from "@/utils/localStorage";
import CustomerRecordsList from "@/components/customers/CustomerRecordsList";
import MonthlyFinancialSummary from "@/components/dashboard/MonthlyFinancialSummary";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { addDays, startOfDay, endOfDay } from "date-fns";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";
import { DateRange } from "react-day-picker";
import { tr } from 'date-fns/locale';
import { useToast } from "@/hooks/use-toast";
import CostsTable from "@/components/costs/CostsTable";
import FinancialDashboard from "@/components/financial/FinancialDashboard";
import RevenueExpenseChart from "@/components/financial/RevenueExpenseChart";
import RevenueSourceChart from "@/components/financial/RevenueSourceChart";
import MonthlyPaymentsExpensesChart from "@/components/financial/MonthlyPaymentsExpensesChart";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const Financial = () => {
  const [dateRange, setDateRange] = useState<DateRange>({
    from: startOfDay(new Date()),
    to: endOfDay(addDays(new Date(), 7))
  });
  const { toast } = useToast();

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

  const { data: customers = [] } = useQuery({
    queryKey: ['customers'],
    queryFn: getCustomers,
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
      from: startOfDay(new Date()),
      to: endOfDay(addDays(new Date(), 7))
    });
  };

  // Tarih aralığına göre kayıtları filtreleme - bugünü dahil et
  const filteredRecords = customerRecords.filter(record => {
    if (!dateRange.from || !dateRange.to) return true;
    const recordDate = startOfDay(new Date(record.date));
    const fromDate = startOfDay(dateRange.from);
    const toDate = endOfDay(dateRange.to);
    return recordDate >= fromDate && recordDate <= toDate;
  });

  const filteredCosts = costs.filter(cost => {
    if (!dateRange.from || !dateRange.to) return true;
    const costDate = startOfDay(new Date(cost.date));
    const fromDate = startOfDay(dateRange.from);
    const toDate = endOfDay(dateRange.to);
    return costDate >= fromDate && costDate <= toDate;
  });

  // Vadeli ödemeler raporu için veriler
  const installmentRecords = customerRecords
    .filter(record => record.recordType === 'installment')
    .map(record => {
      const customer = customers.find(c => c.id === record.customerId);
      return {
        ...record,
        customerName: customer?.name || 'Bilinmiyor',
        customerPhone: customer?.phone || ''
      };
    });

  const totalInstallmentAmount = installmentRecords.reduce((sum, record) => sum + Math.abs(record.amount), 0);
  const paidInstallments = installmentRecords.filter(record => record.isPaid);
  const unpaidInstallments = installmentRecords.filter(record => !record.isPaid);
  const overdueInstallments = unpaidInstallments.filter(record => 
    record.dueDate && new Date(record.dueDate) < new Date()
  );

  console.log('Financial page data:', { 
    filteredRecords, 
    filteredCosts,
    dateRange,
    totalRecords: customerRecords.length,
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

      <div className="space-y-8">
        {/* Dashboard Cards */}
        <FinancialDashboard dateRange={dateRange} />
        
        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <RevenueExpenseChart />
          <MonthlyPaymentsExpensesChart />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <RevenueSourceChart />
          <MonthlyFinancialSummary 
            customerRecords={filteredRecords}
            costs={filteredCosts}
          />
        </div>
        
        {/* Detailed Tables */}
        <Card className="p-4">
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="w-full justify-start">
              <TabsTrigger value="all">Tüm Kayıtlar</TabsTrigger>
              <TabsTrigger value="payments">Tahsilatlar</TabsTrigger>
              <TabsTrigger value="costs">Masraflar</TabsTrigger>
              <TabsTrigger value="installments">Vadeli Ödemeler</TabsTrigger>
            </TabsList>

            <TabsContent value="all">
              <CustomerRecordsList records={filteredRecords} />
            </TabsContent>

            <TabsContent value="payments">
              <CustomerRecordsList 
                records={filteredRecords.filter(record => record.type === 'payment')} 
              />
            </TabsContent>

            <TabsContent value="costs">
              <CostsTable costs={filteredCosts} />
            </TabsContent>

            <TabsContent value="installments">
              <div className="space-y-6">
                {/* Vadeli Ödemeler İstatistikleri */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card className="p-4">
                    <div className="text-sm text-muted-foreground">Toplam Vadeli</div>
                    <div className="text-2xl font-bold">{installmentRecords.length}</div>
                  </Card>
                  <Card className="p-4">
                    <div className="text-sm text-muted-foreground">Ödenen</div>
                    <div className="text-2xl font-bold text-green-600">{paidInstallments.length}</div>
                  </Card>
                  <Card className="p-4">
                    <div className="text-sm text-muted-foreground">Bekleyen</div>
                    <div className="text-2xl font-bold text-orange-600">{unpaidInstallments.length}</div>
                  </Card>
                  <Card className="p-4">
                    <div className="text-sm text-muted-foreground">Gecikmiş</div>
                    <div className="text-2xl font-bold text-red-600">{overdueInstallments.length}</div>
                  </Card>
                </div>

                {/* Vadeli Ödemeler Tablosu */}
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Müşteri</TableHead>
                        <TableHead>Tutar</TableHead>
                        <TableHead>Vade Tarihi</TableHead>
                        <TableHead>Durum</TableHead>
                        <TableHead>Açıklama</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {installmentRecords.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center h-32">
                            Vadeli ödeme bulunmamaktadır.
                          </TableCell>
                        </TableRow>
                      ) : (
                        installmentRecords
                          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                          .map((record) => {
                            const isOverdue = record.dueDate && new Date(record.dueDate) < new Date() && !record.isPaid;
                            return (
                              <TableRow key={record.id}>
                                <TableCell>
                                  <div>
                                    <p className="font-medium">{record.customerName}</p>
                                    <p className="text-sm text-muted-foreground">{record.customerPhone}</p>
                                  </div>
                                </TableCell>
                                <TableCell className="font-medium">
                                  ₺{Math.abs(record.amount).toLocaleString()}
                                </TableCell>
                                <TableCell>
                                  {record.dueDate 
                                    ? new Date(record.dueDate).toLocaleDateString('tr-TR')
                                    : '-'
                                  }
                                </TableCell>
                                <TableCell>
                                  {record.isPaid ? (
                                    <Badge variant="default" className="bg-green-500">Ödendi</Badge>
                                  ) : isOverdue ? (
                                    <Badge variant="destructive">Gecikmiş</Badge>
                                  ) : (
                                    <Badge variant="secondary">Bekliyor</Badge>
                                  )}
                                </TableCell>
                                <TableCell>{record.description || '-'}</TableCell>
                              </TableRow>
                            );
                          })
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
};

export default Financial;
