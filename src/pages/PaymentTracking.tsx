import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getCustomerRecords, type CustomerRecord, setCustomerRecords, updateCustomerRecord, addCustomerRecord } from '@/utils/storage';
import SearchInput from '@/components/common/SearchInput';
import { Edit, CheckCircle, XCircle, CircleDollarSign, Calendar, User } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

const PaymentTracking = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRecordId, setSelectedRecordId] = useState<number | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: records = [], isLoading: isLoadingRecords } = useQuery({
    queryKey: ['customerRecords'],
    queryFn: getCustomerRecords,
  });

  const filteredRecords = records.filter(record =>
    record.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.itemName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const overdueRecords = filteredRecords.filter(record =>
    !record.isPaid && record.dueDate && new Date(record.dueDate) < new Date()
  );

  const openRecords = filteredRecords.filter(record => !record.isPaid);

  const handleMarkAsPaid = async (record: CustomerRecord) => {
    setSelectedRecordId(record.id);
    setPaymentAmount(String(record.amount));
    setShowEditDialog(true);
  };

  const handlePayInstallment = async (installment: any) => {
    try {
      // Update the installment as paid
      await updateCustomerRecord(installment.id, { isPaid: true });

      // Create payment record
      const paymentRecord: CustomerRecord = {
        id: Date.now(),
        customerId: installment.customerId,
        customerName: installment.customerName,
        type: 'payment' as const,
        itemId: installment.id,
        itemName: installment.itemName,
        amount: installment.amount,
        date: new Date(),
        description: `${installment.description} ödemesi`,
        recordType: 'installment_payment' as const,
        createdAt: new Date(),
      };

      await addCustomerRecord(paymentRecord);
      queryClient.invalidateQueries({ queryKey: ['customerRecords'] });

      toast({
        title: "Ödeme kaydedildi",
        description: "Taksit ödemesi başarıyla kaydedildi.",
      });
    } catch (error) {
      console.error("Ödeme kaydedilirken hata:", error);
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Ödeme kaydedilirken bir hata oluştu.",
      });
    }
  };

  const handlePaymentSubmit = async () => {
    if (!selectedRecordId) return;

    setIsSubmittingPayment(true);

    try {
      const record = records.find(r => r.id === selectedRecordId);

      if (!record) {
        toast({
          variant: "destructive",
          title: "Hata",
          description: "Kayıt bulunamadı.",
        });
        return;
      }

      const amountPaid = parseFloat(paymentAmount);

      if (isNaN(amountPaid) || amountPaid <= 0) {
        toast({
          variant: "destructive",
          title: "Hata",
          description: "Geçersiz ödeme miktarı.",
        });
        return;
      }

      if (amountPaid > record.amount) {
        toast({
          variant: "destructive",
          title: "Hata",
          description: "Ödeme miktarı borçtan fazla olamaz.",
        });
        return;
      }

      // Update the original record to isPaid = true
      const updatedRecords = records.map(r =>
        r.id === selectedRecordId ? { ...r, isPaid: true } : r
      );

      await setCustomerRecords(updatedRecords);
      queryClient.setQueryData(['customerRecords'], updatedRecords);

      // Create a new payment record
      if (record.recordType === 'installment') {
        const paymentRecord = {
          id: Date.now(),
          customerId: record.customerId,
          customerName: record.customerName,
          type: 'payment' as const,
          itemId: record.id,
          itemName: record.itemName,
          amount: record.amount,
          date: new Date(),
          description: `Taksit ödemesi: ${record.itemName}`,
          recordType: 'installment_payment' as const,
          createdAt: new Date(),
        };

        const updatedRecordsWithPayment = [...updatedRecords, paymentRecord];
        await setCustomerRecords(updatedRecordsWithPayment);
        queryClient.setQueryData(['customerRecords'], updatedRecordsWithPayment);
      }

      toast({
        title: "Başarılı",
        description: "Ödeme başarıyla kaydedildi.",
      });

      setShowEditDialog(false);
      setSelectedRecordId(null);
      setPaymentAmount('');
      queryClient.invalidateQueries({ queryKey: ['customerRecords'] });

    } catch (error) {
      console.error("Ödeme kaydedilirken hata:", error);
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Ödeme kaydedilirken bir hata oluştu.",
      });
    } finally {
      setIsSubmittingPayment(false);
    }
  };

  return (
    <div className="p-6 pl-72 animate-fadeIn space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif">Ödeme Takibi</h1>
          <p className="text-muted-foreground mt-1">Müşteri ödemelerinizi takip edin ve yönetin</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        <SearchInput
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Müşteri adı, ürün veya açıklama ile ara..."
        />

        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="cursor-pointer hover:bg-accent">
            Tümü ({filteredRecords.length})
          </Badge>
          <Badge variant="outline" className="cursor-pointer hover:bg-accent text-orange-600">
            Açık ({openRecords.length})
          </Badge>
          <Badge variant="outline" className="cursor-pointer hover:bg-accent text-red-600">
            Gecikmiş ({overdueRecords.length})
          </Badge>
        </div>
      </div>

      {/* Payment Tracking Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CircleDollarSign className="h-5 w-5" />
            Ödeme Kayıtları
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Müşteri</TableHead>
                  <TableHead>Açıklama</TableHead>
                  <TableHead>Tutar</TableHead>
                  <TableHead>Vade Tarihi</TableHead>
                  <TableHead>Durum</TableHead>
                  <TableHead>İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoadingRecords ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center h-32">Ödeme kayıtları yükleniyor...</TableCell>
                  </TableRow>
                ) : filteredRecords.length > 0 ? (
                  filteredRecords.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell className="font-medium">{record.customerName}</TableCell>
                      <TableCell>{record.description}</TableCell>
                      <TableCell>₺{record.amount.toLocaleString()}</TableCell>
                      <TableCell>
                        {record.dueDate ? format(new Date(record.dueDate), 'PPP', { locale: tr }) : '-'}
                      </TableCell>
                      <TableCell>
                        {record.isPaid ? (
                          <Badge variant="default" className="bg-green-500">
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Ödendi
                          </Badge>
                        ) : (
                          <Badge variant="destructive">
                            <XCircle className="h-4 w-4 mr-2" />
                            Açık
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {!record.isPaid && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleMarkAsPaid(record)}
                            disabled={record.isPaid}
                          >
                            Ödeme Al
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center h-32">
                      {searchTerm ? 'Arama sonucu bulunamadı' : 'Henüz ödeme kaydı bulunmamaktadır'}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Payment Modal Dialog */}
      <Dialog open={showEditDialog} onOpenChange={() => setShowEditDialog(false)}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Ödeme Al</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="paymentAmount" className="text-right">
                Ödeme Miktarı
              </Label>
              <Input
                type="number"
                id="paymentAmount"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="secondary" onClick={() => setShowEditDialog(false)}>
              İptal
            </Button>
            <Button onClick={handlePaymentSubmit} disabled={isSubmittingPayment}>
              {isSubmittingPayment ? "Ödeniyor..." : "Öde"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PaymentTracking;
