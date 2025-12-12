
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getCustomerRecords, getCustomers, setCustomerRecords, getMemberSubscriptions } from '@/utils/storage';
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { addDays, startOfDay, endOfDay, differenceInDays } from "date-fns";
import { RotateCcw, Clock, AlertCircle, CheckCircle, Calendar, Users, CreditCard } from "lucide-react";
import { DateRange } from "react-day-picker";
import { tr } from 'date-fns/locale';
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
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

  const { data: subscriptions = [] } = useQuery({
    queryKey: ['memberSubscriptions'],
    queryFn: getMemberSubscriptions,
  });

  const resetDateFilter = () => {
    setDateRange({
      from: new Date(),
      to: addDays(new Date(), 30)
    });
  };

  // Vadeli ödemeleri filtrele - sadece ödenmemiş olanlar
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

    const paymentAmountNum = Number(paymentAmount);
    const installmentAmount = selectedRecord.amount;

    // Ödeme kaydı oluştur
    const paymentRecord = {
      id: Date.now(),
      customerId: selectedRecord.customerId,
      customerName: selectedRecord.customerName,
      type: 'payment' as const,
      itemId: selectedRecord.id,
      itemName: `Vadeli Ödeme Tahsilatı - ${selectedRecord.itemName}`,
      amount: -paymentAmountNum, // Negatif değer çünkü ödeme
      date: new Date(),
      description: paymentNote || 'Vadeli ödeme tahsilatı',
      recordType: 'installment_payment' as const
    };

    // Vadeli ödeme kaydını güncelle
    const updatedRecords = records.map(record => {
      if (record.id === selectedRecord.id) {
        return {
          ...record,
          isPaid: paymentAmountNum >= installmentAmount,
          // Kısmi ödeme durumunda tutarı güncelle
          amount: paymentAmountNum >= installmentAmount ? installmentAmount : installmentAmount - paymentAmountNum
        };
      }
      return record;
    });

    await setCustomerRecords([...updatedRecords, paymentRecord]);
    queryClient.invalidateQueries({ queryKey: ['customerRecords'] });

    toast({
      title: "Vadeli ödeme tahsilatı yapıldı",
      description: `${paymentAmountNum} ₺ tutarında vadeli ödeme tahsilatı alındı.`,
    });

    setSelectedRecord(null);
    setPaymentAmount('');
    setPaymentNote('');
    setShowPaymentDialog(false);
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

  // Borç kayıtlarını filtrele - anlık borcu olan müşteriler
  const debtRecords = records.filter(record => 
    record.recordType === 'debt' && !record.isPaid
  );

  // Üyelik kayıtlarını analiz et
  const activeSubscriptions = subscriptions.filter(sub => sub.isActive);
  
  // 1 hafta içinde bitecek üyelikler
  const expiringSubscriptions = activeSubscriptions.filter(sub => {
    const endDate = new Date(sub.endDate);
    const today = new Date();
    const daysUntilExpiry = differenceInDays(endDate, today);
    return daysUntilExpiry >= 0 && daysUntilExpiry <= 7;
  });

  // Süresi dolmuş üyelikler
  const expiredSubscriptions = activeSubscriptions.filter(sub => {
    const endDate = new Date(sub.endDate);
    return endDate < new Date();
  });

  // Tarih aralığına göre filtreleme için üyelikler
  const filteredSubscriptions = expiringSubscriptions.filter(sub => {
    if (!dateRange.from || !dateRange.to) return true;
    const endDate = new Date(sub.endDate);
    const fromDate = startOfDay(dateRange.from);
    const toDate = endOfDay(dateRange.to);
    return endDate >= fromDate && endDate <= toDate;
  });

  // İstatistikler
  const totalAmount = enrichedRecords.reduce((sum, record) => sum + Math.abs(record.amount), 0);
  const totalDebt = debtRecords.reduce((sum, record) => sum + Math.abs(record.amount), 0);
  const overdueRecords = enrichedRecords.filter(record => new Date(record.dueDate!) < new Date());
  const upcomingRecords = enrichedRecords.filter(record => {
    const dueDate = new Date(record.dueDate!);
    const today = new Date();
    const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 7;
  });

  const getMembershipStatusBadge = (endDate: Date) => {
    const today = new Date();
    const daysUntilExpiry = differenceInDays(endDate, today);

    if (daysUntilExpiry < 0) {
      return <Badge variant="destructive" className="gap-1"><AlertCircle className="h-3 w-3" />Süresi Dolmuş</Badge>;
    } else if (daysUntilExpiry <= 3) {
      return <Badge variant="secondary" className="gap-1"><Clock className="h-3 w-3" />{daysUntilExpiry} Gün Kaldı</Badge>;
    } else if (daysUntilExpiry <= 7) {
      return <Badge variant="default" className="gap-1"><Calendar className="h-3 w-3" />{daysUntilExpiry} Gün Kaldı</Badge>;
    } else {
      return <Badge variant="outline" className="gap-1"><CheckCircle className="h-3 w-3" />Aktif</Badge>;
    }
  };

  return (
    <div className="p-4 md:p-6 md:pl-72 animate-fadeIn space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-serif">Ödeme ve Üyelik Takip</h1>
          <p className="text-sm md:text-base text-muted-foreground mt-1">Vadeli ödemeleri, borçları ve üyelik sürelerini takip edin</p>
        </div>
      </div>

      {/* Date Filter */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 md:gap-4">
        <DatePickerWithRange date={dateRange} setDate={setDateRange} locale={tr} />
        <Button 
          variant="outline" 
          size="icon" 
          onClick={resetDateFilter} 
          title="Filtreyi Sıfırla"
          className="self-start"
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500 rounded-lg">
                <Clock className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Vadeli Ödemeler</p>
                <p className="text-2xl font-bold text-blue-600">{enrichedRecords.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500 rounded-lg">
                <CreditCard className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Anlık Borçlar</p>
                <p className="text-2xl font-bold text-purple-600">₺{totalDebt.toLocaleString()}</p>
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
                <p className="text-sm text-muted-foreground">Bitecek Üyelikler</p>
                <p className="text-2xl font-bold text-red-600">{expiringSubscriptions.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-500 rounded-lg">
                <Users className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Süresi Dolmuş</p>
                <p className="text-2xl font-bold text-orange-600">{expiredSubscriptions.length}</p>
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
                <p className="text-sm text-muted-foreground">Toplam Vadeli</p>
                <p className="text-2xl font-bold text-green-600">₺{totalAmount.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="installments" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="installments">Vadeli Ödemeler</TabsTrigger>
          <TabsTrigger value="debts">Anlık Borçlar</TabsTrigger>
          <TabsTrigger value="memberships">Üyelikler</TabsTrigger>
        </TabsList>

        {/* Vadeli Ödemeler Tab */}
        <TabsContent value="installments">
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
                            <Button 
                              size="sm" 
                              onClick={() => {
                                setSelectedRecord(record);
                                setPaymentAmount(Math.abs(record.amount).toString());
                                setShowPaymentDialog(true);
                              }}
                            >
                              Tahsilat Yap
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Anlık Borçlar Tab */}
        <TabsContent value="debts">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Anlık Borçlar
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Müşteri</TableHead>
                      <TableHead>Tutar</TableHead>
                      <TableHead>Tarih</TableHead>
                      <TableHead>Açıklama</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {debtRecords.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center h-32">
                          Anlık borç kaydı bulunmamaktadır.
                        </TableCell>
                      </TableRow>
                    ) : (
                      debtRecords.map((record) => {
                        const customer = customers.find(c => c.id === record.customerId);
                        return (
                          <TableRow key={record.id}>
                            <TableCell>
                              <div>
                                <p className="font-medium">{customer?.name || 'Bilinmiyor'}</p>
                                <p className="text-sm text-muted-foreground">{customer?.phone || ''}</p>
                              </div>
                            </TableCell>
                            <TableCell className="font-medium text-red-600">
                              ₺{Math.abs(record.amount).toLocaleString()}
                            </TableCell>
                            <TableCell>
                              {new Date(record.date).toLocaleDateString('tr-TR')}
                            </TableCell>
                            <TableCell>{record.description || '-'}</TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Üyelikler Tab */}
        <TabsContent value="memberships">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Üyelik Takibi - 1 Hafta İçinde Bitecek
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Üye</TableHead>
                      <TableHead>Paket</TableHead>
                      <TableHead>Başlangıç</TableHead>
                      <TableHead>Bitiş</TableHead>
                      <TableHead>Ücret</TableHead>
                      <TableHead>Durum</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSubscriptions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center h-32">
                          {dateRange.from && dateRange.to 
                            ? 'Seçilen tarih aralığında bitecek üyelik bulunmamaktadır.'
                            : '1 hafta içinde bitecek üyelik bulunmamaktadır.'}
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredSubscriptions.map((subscription) => (
                        <TableRow key={subscription.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{subscription.memberName}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{subscription.packageName}</p>
                              <Badge variant="outline" className="text-xs mt-1">
                                {subscription.packageType}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell>
                            {new Date(subscription.startDate).toLocaleDateString('tr-TR')}
                          </TableCell>
                          <TableCell className="font-medium">
                            {new Date(subscription.endDate).toLocaleDateString('tr-TR')}
                          </TableCell>
                          <TableCell>
                            ₺{subscription.price.toLocaleString()}
                          </TableCell>
                          <TableCell>
                            {getMembershipStatusBadge(new Date(subscription.endDate))}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Payment Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Vadeli Ödeme Tahsilatı - {selectedRecord?.customerName}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Tahsilat Tutarı (₺)</Label>
              <Input
                type="number"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                max={selectedRecord?.amount || 0}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Maksimum: ₺{selectedRecord?.amount?.toLocaleString() || 0}
              </p>
            </div>
            <div>
              <Label>Not</Label>
              <Textarea
                value={paymentNote}
                onChange={(e) => setPaymentNote(e.target.value)}
                placeholder="Tahsilat notu..."
              />
            </div>
            <Button onClick={handlePayment} className="w-full">
              Tahsilatı Onayla
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PaymentTracking;
