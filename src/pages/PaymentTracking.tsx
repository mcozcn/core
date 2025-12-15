
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getPayments, updatePayment, addPayment } from '@/utils/storage/payments';
import { addCustomerRecord } from '@/utils/storage/customers';
import { getCustomers } from '@/utils/storage/customers';
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { addDays, startOfDay, endOfDay, differenceInDays } from "date-fns";
import { RotateCcw, Clock, AlertCircle, CheckCircle, Calendar, Users, CreditCard } from "lucide-react";
import { DateRange } from "react-day-picker";
import { tr } from 'date-fns/locale';
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: customers = [] } = useQuery({
    queryKey: ['customers'],
    queryFn: getCustomers,
  });

  const { data: payments = [] } = useQuery({
    queryKey: ['payments'],
    queryFn: getPayments,
  });

  const resetDateFilter = () => {
    setDateRange({
      from: new Date(),
      to: addDays(new Date(), 30)
    });
  };

  // Unpaid payments within date range
  const unpaidPayments = payments.filter(payment => {
    if (payment.isPaid) return false;
    const dueDate = payment.dueDate ? new Date(payment.dueDate) : new Date(payment.paymentDate || payment.date!);
    
    if (!dateRange.from || !dateRange.to) return true;
    const fromDate = startOfDay(dateRange.from);
    const toDate = endOfDay(dateRange.to);
    return dueDate >= fromDate && dueDate <= toDate;
  });

  // Enrich with customer info
  const enrichedPayments = unpaidPayments.map(payment => {
    const customer = customers.find(c => String(c.id) === String(payment.customerId));
    return {
      ...payment,
      customerName: customer?.name || 'Bilinmiyor',
      customerPhone: customer?.phone || ''
    };
  });

  // Sort by due date
  const sortedPayments = enrichedPayments.sort((a, b) => {
    const dateA = new Date(a.dueDate || a.paymentDate || a.date!);
    const dateB = new Date(b.dueDate || b.paymentDate || b.date!);
    const today = new Date();
    
    // Overdue payments first
    const isOverdueA = dateA < today;
    const isOverdueB = dateB < today;
    
    if (isOverdueA && !isOverdueB) return -1;
    if (!isOverdueA && isOverdueB) return 1;
    
    return dateA.getTime() - dateB.getTime();
  });

  const handlePayment = async () => {
    if (!selectedPayment || !paymentAmount) return;

    const paymentAmountNum = Number(paymentAmount);

    // Prevent overpayment
    if (paymentAmountNum > Math.abs(selectedPayment.amount)) {
      toast({ variant: 'destructive', title: 'Hata', description: 'Ödeme tutarı borçtan fazla olamaz.' });
      return;
    }

    let success = false;

    // Partial payment: reduce amount on the scheduled payment
    if (paymentAmountNum < Math.abs(selectedPayment.amount)) {
      const remaining = Math.abs(selectedPayment.amount) - paymentAmountNum;
      success = await updatePayment(selectedPayment.id, {
        amount: remaining * (selectedPayment.amount < 0 ? -1 : 1),
        notes: paymentNote ? `${selectedPayment.notes || ''} - Tahsilat: ${paymentNote}` : selectedPayment.notes
      });
    } else {
      // Full payment
      success = await updatePayment(selectedPayment.id, {
        isPaid: true,
        notes: paymentNote ? `${selectedPayment.notes || ''} - Tahsilat: ${paymentNote}` : selectedPayment.notes
      });
    }

    if (success) {
      // Record payment in customer ledger so cari list updates
      try {
        await addCustomerRecord({
          customerId: selectedPayment.customerId,
          customerName: selectedPayment.customerName,
          type: 'payment',
          itemId: selectedPayment.id,
          itemName: `Ödeme - ${selectedPayment.customerName}`,
          amount: -paymentAmountNum,
          date: new Date(),
          isPaid: true,
          description: paymentNote || `Tahsilat: ${paymentAmountNum} ₺`,
          recordType: 'payment',
        });
      } catch (err) {
        console.warn('Failed to add customer record for payment:', err);
      }

      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['customerRecords'] });
      queryClient.invalidateQueries({ queryKey: ['customers'] });

      toast({
        title: "Ödeme tahsil edildi",
        description: `${paymentAmountNum} ₺ tutarında ödeme tahsil edildi.`,
      });
    } else {
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Ödeme kaydedilemedi.",
      });
    }

    setSelectedPayment(null);
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

  // Memberships expiring in next 7 days
  const expiringMemberships = customers.filter(c => {
    if (!c.membershipEndDate || !c.isActive) return false;
    const endDate = new Date(c.membershipEndDate);
    const today = new Date();
    const daysUntilExpiry = differenceInDays(endDate, today);
    return daysUntilExpiry >= 0 && daysUntilExpiry <= 7;
  }).sort((a, b) => {
    const dateA = new Date(a.membershipEndDate!);
    const dateB = new Date(b.membershipEndDate!);
    return dateA.getTime() - dateB.getTime();
  });

  // Expired memberships
  const expiredMemberships = customers.filter(c => {
    if (!c.membershipEndDate) return false;
    const endDate = new Date(c.membershipEndDate);
    return endDate < new Date() && c.isActive;
  });

  // Stats
  const totalUnpaid = enrichedPayments.reduce((sum, p) => sum + Math.abs(p.amount), 0);
  const overduePayments = enrichedPayments.filter(p => {
    const dueDate = new Date(p.dueDate || p.paymentDate || p.date!);
    return dueDate < new Date();
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
          <p className="text-sm md:text-base text-muted-foreground mt-1">Ödemeleri ve üyelik sürelerini takip edin</p>
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
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500 rounded-lg">
                <Clock className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Bekleyen Ödeme</p>
                <p className="text-2xl font-bold text-blue-600">{enrichedPayments.length}</p>
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
                <p className="text-sm text-muted-foreground">Geciken</p>
                <p className="text-2xl font-bold text-red-600">{overduePayments.length}</p>
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
                <p className="text-sm text-muted-foreground">Bitecek Üyelik</p>
                <p className="text-2xl font-bold text-orange-600">{expiringMemberships.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500 rounded-lg">
                <CreditCard className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Toplam Borç</p>
                <p className="text-2xl font-bold text-green-600">₺{totalUnpaid.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="payments" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="payments">Bekleyen Ödemeler</TabsTrigger>
          <TabsTrigger value="memberships">Üyelikler</TabsTrigger>
        </TabsList>

        {/* Payments Tab */}
        <TabsContent value="payments">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Bekleyen Ödemeler
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
                      <TableHead>Durum</TableHead>
                      <TableHead>Açıklama</TableHead>
                      <TableHead>İşlemler</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedPayments.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center h-32">
                          Seçilen tarih aralığında bekleyen ödeme bulunmamaktadır.
                        </TableCell>
                      </TableRow>
                    ) : (
                      sortedPayments.map((payment) => {
                        const dueDate = new Date(payment.dueDate || payment.paymentDate || payment.date!);
                        return (
                          <TableRow key={payment.id}>
                            <TableCell>
                              <div>
                                <p className="font-medium">{payment.customerName}</p>
                                <p className="text-sm text-muted-foreground">{payment.customerPhone}</p>
                              </div>
                            </TableCell>
                            <TableCell className="font-medium">
                              ₺{Math.abs(payment.amount).toLocaleString()}
                            </TableCell>
                            <TableCell>
                              {dueDate.toLocaleDateString('tr-TR')}
                            </TableCell>
                            <TableCell>
                              {getStatusBadge(dueDate)}
                            </TableCell>
                            <TableCell>{payment.notes || payment.paymentType || '-'}</TableCell>
                            <TableCell>
                              <Button 
                                size="sm" 
                                onClick={() => {
                                  setSelectedPayment(payment);
                                  setPaymentAmount(Math.abs(payment.amount).toString());
                                  setShowPaymentDialog(true);
                                }}
                              >
                                Tahsil Et
                              </Button>
                            </TableCell>
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

        {/* Memberships Tab */}
        <TabsContent value="memberships">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Üyelik Takibi
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Üye</TableHead>
                      <TableHead>Telefon</TableHead>
                      <TableHead>Başlangıç</TableHead>
                      <TableHead>Bitiş</TableHead>
                      <TableHead>Durum</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {expiringMemberships.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center h-32">
                          1 hafta içinde bitecek üyelik bulunmamaktadır.
                        </TableCell>
                      </TableRow>
                    ) : (
                      expiringMemberships.map((customer) => (
                        <TableRow key={customer.id}>
                          <TableCell>
                            <p className="font-medium">{customer.name}</p>
                          </TableCell>
                          <TableCell>{customer.phone}</TableCell>
                          <TableCell>
                            {customer.membershipStartDate 
                              ? new Date(customer.membershipStartDate).toLocaleDateString('tr-TR')
                              : '-'}
                          </TableCell>
                          <TableCell className="font-medium">
                            {customer.membershipEndDate 
                              ? new Date(customer.membershipEndDate).toLocaleDateString('tr-TR')
                              : '-'}
                          </TableCell>
                          <TableCell>
                            {customer.membershipEndDate && getMembershipStatusBadge(new Date(customer.membershipEndDate))}
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
            <DialogTitle>Ödeme Tahsilatı - {selectedPayment?.customerName}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Tahsilat Tutarı (₺)</Label>
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