
import React, { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { getCustomerRecords, setCustomerRecords, type CustomerRecord } from '@/utils/storage';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface CustomerPaymentFormProps {
  customerId: number;
  onSuccess?: () => void;
}

const CustomerPaymentForm = ({ customerId, onSuccess }: CustomerPaymentFormProps) => {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Nakit');
  const [paymentType, setPaymentType] = useState<'regular' | 'installment'>('regular');
  const [selectedInstallment, setSelectedInstallment] = useState<string>('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Use useQuery to get customer records
  const { data: allRecords = [] } = useQuery({
    queryKey: ['customerRecords'],
    queryFn: getCustomerRecords,
  });

  // Müşterinin kayıtları
  const customerRecords = allRecords.filter(record => record.customerId === customerId);
  
  // Ödenmemiş vadeli ödemeler
  const unpaidInstallments = customerRecords.filter(record => 
    record.recordType === 'installment' && !record.isPaid
  );

  // Mevcut borç hesaplama
  const totalDebt = customerRecords.reduce((acc, record) => 
    (record.type === 'debt' || record.type === 'service' || record.type === 'product') && record.recordType !== 'installment'
      ? acc + record.amount : acc, 0
  );
  const totalPayments = customerRecords.reduce((acc, record) => 
    record.type === 'payment' ? acc + Math.abs(record.amount) : acc, 0
  );
  const currentDebt = Math.max(0, totalDebt - totalPayments);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!amount) {
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Ödeme tutarını girin.",
      });
      return;
    }

    if (paymentType === 'installment' && !selectedInstallment) {
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Tahsil edilecek vadeli ödemeyi seçin.",
      });
      return;
    }

    const paymentAmount = Number(amount);

    if (paymentType === 'installment') {
      // Vadeli ödeme tahsilatı
      const installmentRecord = unpaidInstallments.find(r => r.id.toString() === selectedInstallment);
      if (!installmentRecord) {
        toast({
          variant: "destructive",
          title: "Hata",
          description: "Seçilen vadeli ödeme bulunamadı.",
        });
        return;
      }

      if (paymentAmount > installmentRecord.amount) {
        toast({
          variant: "destructive",
          title: "Hata",
          description: "Ödeme tutarı vadeli ödeme tutarından fazla olamaz.",
        });
        return;
      }

      // Vadeli ödeme tahsilat kaydı
      const paymentRecord: CustomerRecord = {
        id: Date.now(),
        customerId,
        type: 'payment',
        itemId: installmentRecord.id,
        itemName: `Vadeli Ödeme Tahsilatı - ${installmentRecord.itemName}`,
        amount: -paymentAmount,
        date: new Date(),
        isPaid: true,
        description: description || 'Vadeli ödeme tahsilatı',
        recordType: 'installment_payment',
        paymentMethod
      };

      // Vadeli ödeme kaydını güncelle
      const updatedRecords = allRecords.map(record => {
        if (record.id === installmentRecord.id) {
          return {
            ...record,
            isPaid: paymentAmount >= installmentRecord.amount,
            amount: paymentAmount >= installmentRecord.amount ? installmentRecord.amount : installmentRecord.amount - paymentAmount
          };
        }
        return record;
      });

      await setCustomerRecords([...updatedRecords, paymentRecord]);

      toast({
        title: "Vadeli ödeme tahsilatı yapıldı",
        description: `${paymentAmount} ₺ tutarında vadeli ödeme tahsilatı alındı.`,
      });

    } else {
      // Normal ödeme
      if (paymentAmount > currentDebt) {
        toast({
          variant: "destructive",
          title: "Hata",
          description: "Ödeme tutarı mevcut borçtan fazla olamaz.",
        });
        return;
      }

      const paymentRecord: CustomerRecord = {
        id: Date.now(),
        customerId,
        type: 'payment',
        itemId: 0,
        itemName: 'Ödeme',
        amount: -paymentAmount,
        date: new Date(),
        isPaid: true,
        description,
        recordType: 'payment',
        paymentMethod
      };

      const existingRecords = await getCustomerRecords();
      await setCustomerRecords([...existingRecords, paymentRecord]);

      toast({
        title: "Ödeme alındı",
        description: `${paymentAmount} ₺ tutarında ödeme alındı.`,
      });
    }

    queryClient.invalidateQueries({ queryKey: ['customerRecords'] });

    setAmount('');
    setDescription('');
    setSelectedInstallment('');
    setPaymentType('regular');

    if (onSuccess) {
      onSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Payment Type Selection */}
      <div>
        <Label className="text-base font-medium">Ödeme Türü</Label>
        <Select value={paymentType} onValueChange={(value: 'regular' | 'installment') => setPaymentType(value)}>
          <SelectTrigger className="mt-2">
            <SelectValue placeholder="Ödeme türünü seçin" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="regular">Normal Ödeme</SelectItem>
            <SelectItem value="installment">Vadeli Ödeme Tahsilatı</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Current Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {paymentType === 'regular' && (
          <Card className="bg-red-50 dark:bg-red-900/20 border-red-200">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm text-red-700 dark:text-red-300">Mevcut Borç</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <p className="text-lg font-semibold text-red-600 dark:text-red-400">
                ₺{currentDebt.toLocaleString()}
              </p>
            </CardContent>
          </Card>
        )}
        
        {paymentType === 'installment' && unpaidInstallments.length > 0 && (
          <Card className="bg-purple-50 dark:bg-purple-900/20 border-purple-200">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm text-purple-700 dark:text-purple-300">Vadeli Ödemeler</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <p className="text-lg font-semibold text-purple-600 dark:text-purple-400">
                {unpaidInstallments.length} adet
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Installment Selection */}
      {paymentType === 'installment' && (
        <div>
          <Label>Vadeli Ödeme Seçin</Label>
          {unpaidInstallments.length > 0 ? (
            <Select value={selectedInstallment} onValueChange={setSelectedInstallment}>
              <SelectTrigger>
                <SelectValue placeholder="Tahsil edilecek vadeli ödemeyi seçin" />
              </SelectTrigger>
              <SelectContent>
                {unpaidInstallments.map((installment) => (
                  <SelectItem key={installment.id} value={installment.id.toString()}>
                    {installment.itemName} - ₺{installment.amount.toLocaleString()} 
                    {installment.dueDate && ` (Vade: ${new Date(installment.dueDate).toLocaleDateString('tr-TR')})`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <p className="text-sm text-muted-foreground p-2 bg-muted rounded">
              Bu müşterinin ödenmemiş vadeli ödemesi bulunmamaktadır.
            </p>
          )}
        </div>
      )}

      {/* Amount Input */}
      <div>
        <Label>Ödeme Tutarı (₺)</Label>
        {paymentType === 'regular' && (
          <p className="text-xs text-muted-foreground mb-1">
            Maksimum: ₺{currentDebt.toLocaleString()}
          </p>
        )}
        {paymentType === 'installment' && selectedInstallment && (
          <p className="text-xs text-muted-foreground mb-1">
            Maksimum: ₺{unpaidInstallments.find(r => r.id.toString() === selectedInstallment)?.amount.toLocaleString() || 0}
          </p>
        )}
        <Input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Ödeme tutarını girin"
          required
          max={
            paymentType === 'regular' 
              ? currentDebt 
              : selectedInstallment 
                ? unpaidInstallments.find(r => r.id.toString() === selectedInstallment)?.amount || 0
                : 0
          }
        />
      </div>

      {/* Payment Method */}
      <div>
        <Label>Ödeme Yöntemi</Label>
        <Select value={paymentMethod} onValueChange={setPaymentMethod}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Nakit">Nakit</SelectItem>
            <SelectItem value="Kredi Kartı">Kredi Kartı</SelectItem>
            <SelectItem value="Banka Havalesi">Banka Havalesi</SelectItem>
            <SelectItem value="Çek">Çek</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Description */}
      <div>
        <Label>Açıklama</Label>
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Ödeme açıklaması"
          className="min-h-[100px]"
        />
      </div>

      <Button 
        type="submit" 
        className="w-full"
        disabled={
          (paymentType === 'regular' && currentDebt <= 0) ||
          (paymentType === 'installment' && unpaidInstallments.length === 0)
        }
      >
        {paymentType === 'regular' ? 'Ödeme Al' : 'Vadeli Ödeme Tahsilatı Yap'}
      </Button>
    </form>
  );
};

export default CustomerPaymentForm;
