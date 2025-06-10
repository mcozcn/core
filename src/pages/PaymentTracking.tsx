
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getCustomerRecords, getCustomers, setCustomerRecords } from '@/utils/storage';
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { addDays, startOfDay, endOfDay } from "date-fns";
import { RotateCcw, Clock, AlertCircle, CheckCircle, Calendar } from "lucide-react";
import { DateRange } from "react-day-picker";
import { tr } from 'date-fns/locale';
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const PaymentTracking = () => {
  const [dateRange, setDateRange] = useState<DateRange>({
    from: new Date(),
    to: addDays(new Date(), 30)
  });
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentNote, setPaymentNote] = useState('');
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: customers = [] } = useQuery({
    queryKey: ['customers'],
    queryFn: getCustomers,
  });

  const { data: records = [] } = useQuery({
    queryKey: ['customerRecords'],
    queryFn: getCustomerRecords,
  });

  const resetDateFilter = () => {
    setDateRange({
      from: new Date(),
      to: addDays(new Date(), 30)
    });
  };

  // Vadeli ödemeleri filtrele
  const installmentRecords = records.filter(record => 
    record.recordType === 'installment' && 
    record.dueDate &&
    !record.isPaid
  ).filter(record => {
    if (!dateRange.from || !dateRange.to) return true;
    const dueDate = new Date(record.dueDate!);
    const fromDate = startOfDay(dateRange.from);
    const toDate = endOfDay(dateRange.to);
    return dueDate >= fromDate && dueDate <= toDate;
  });

  // Müşteri bilgilerini ekle
  const enrichedRecords = installmentRecords.map(record => {
    const customer = customers.find(c => c.id === record.customerId);
    return {
      ...record,
      customerName: customer?.name || 'Bilinmiyor',
      customerPhone: customer?.phone || ''
    };
  });

  // Vade durumuna göre sırala
  const sortedRecords = enrichedRecords.sort((a, b) => {
    const dateA = new Date(a.dueDate!);
    const dateB = new Date(b.dueDate!);
    const today = new Date();
    
    // Geciken ödemeler önce
    const isOverdueA = dateA < today;
    const isOverdueB = dateB < today;
    
    if (isOverdueA && !isOverdueB) return -1;
    if (!isOverdueA && isOverdueB) return 1;
    
    return dateA.getTime() - dateB.getTime();
  });

  const handlePayment = async () => {
    if (!selectedRecord || !paymentAmount) return;

    const paymentRecord = {
      id: Date.now(),
      customerId: selectedRecord.customerId,
      type: 'payment' as const,
      itemId: selectedRecord.id,
      itemName: `Vadeli Ödeme - ${selectedRecord.itemName}`,
      amount: Number(paymentAmount),
      date: new Date(),
      description: paymentNote,
      recordType: 'payment' as const
    };

    // Vadeli ödeme kaydını güncelleyerek ödendi olarak işaretle
    const updatedRecords = records.map(record => 
      record.id === selectedRecord.id 
        ? { ...record, isPaid: true }
        : record
    );

    await setCustomerRecords([...updatedRecords, paymentRecord]);
    queryClient.invalidateQueries({ queryKey: ['customerRecords'] });

    toast({
      title: "Ödeme alındı",
      description: `${paymentAmount} ₺ tutarında ödeme alındı.`,
    });

    setSelectedRecord(null);
    setPaymentAmount('');
    setPaymentNote('');
  };

  const getStatusBadge = (dueDate: Date) => {
    const today = new Date();
    const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return <Badge variant="destructive" className="gap-1"><AlertCircle className="h-3 w-3" />Gecikmiş</Badge>;
    } else if (diffDays <= 3) {
      return <Badge variant="secondary" className="gap-1"><Clock className="h-3 w-3" />Yaklaşan</Badge>;
    } else {
      return <Badge variant="default" className="gap-1"><CheckCircle className="h-3 w-3" />Normal</Badge>;
    }
  };

  // İstatistikler
  const totalAmount = enrichedRecords.reduce((sum, record) => sum + Math.abs(record.amount), 0);
  const overdueRecords = enrichedRecords.filter(record => new Date(record.dueDate!) < new Date());
  const upcomingRecords = enrichedRecords.filter(record => {
    const dueDate = new Date(record.dueDate!);
    const today = new Date();
    const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 7;
  });

  return (
    <div className="p-6 pl-72 animate-fadeIn space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif">Ödeme Takip</h1>
          <p className="text-muted-foreground mt-1">Vadeli ödemeleri takip edin ve hatırlatmalar yapın</p>
        </div>
      </div>

      {/* Date Filter */}
      <div className="flex items-center gap-4">
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500 rounded-lg">
                <Clock className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Toplam Vadeli</p>
                <p className="text-2xl font-bold text-blue-600">{enrichedRecords.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border-red-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-500 rounded-lg">
                <AlertCircle className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Gecikmiş</p>
                <p className="text-2xl font-bold text-red-600">{overdueRecords.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-500 rounded-lg">
                <Calendar className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Bu Hafta</p>
                <p className="text-2xl font-bold text-orange-600">{upcomingRecords.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500 rounded-lg">
                <CheckCircle className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Toplam Tutar</p>
                <p className="text-2xl font-bold text-green-600">₺{totalAmount.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Vadeli Ödemeler
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Müşteri</TableHead>
                  <TableHead>Tutar</TableHead>
                  <TableHead>Vade Tarihi</TableHead>
                  <TableHead>Durum</TableHead>
                  <TableHead>Açıklama</TableHead>
                  <TableHead>İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedRecords.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center h-32">
                      Seçilen tarih aralığında vadeli ödeme bulunmamaktadır.
                    </TableCell>
                  </TableRow>
                ) : (
                  sortedRecords.map((record) => (
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
                        {new Date(record.dueDate!).toLocaleDateString('tr-TR')}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(new Date(record.dueDate!))}
                      </TableCell>
                      <TableCell>{record.description || '-'}</TableCell>
                      <TableCell>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              size="sm" 
                              onClick={() => {
                                setSelectedRecord(record);
                                setPaymentAmount(Math.abs(record.amount).toString());
                              }}
                            >
                              Ödeme Al
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Ödeme Al - {record.customerName}</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label>Ödeme Tutarı (₺)</Label>
                                <Input
                                  type="number"
                                  value={paymentAmount}
                                  onChange={(e) => setPaymentAmount(e.target.value)}
                                />
                              </div>
                              <div>
                                <Label>Not</Label>
                                <Textarea
                                  value={paymentNote}
                                  onChange={(e) => setPaymentNote(e.target.value)}
                                  placeholder="Ödeme notu..."
                                />
                              </div>
                              <Button onClick={handlePayment} className="w-full">
                                Ödemeyi Onayla
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentTracking;
