
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
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CreditCard, Banknote, Landmark, FileText, Clock, DollarSign } from "lucide-react";

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

  const paymentMethodIcons = {
    'Nakit': Banknote,
    'Kredi Kartı': CreditCard,
    'Banka Havalesi': Landmark,
    'Çek': FileText
  };

  return (
    <div className="space-y-6">
      {/* Payment Type Selection */}
      <Card className="border-2">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <DollarSign className="h-5 w-5" />
            Ödeme Türü Seçimi
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Button
              type="button"
              variant={paymentType === 'regular' ? 'default' : 'outline'}
              className="h-auto p-4 flex flex-col gap-2"
              onClick={() => setPaymentType('regular')}
            >
              <DollarSign className="h-6 w-6" />
              <span className="font-medium">Normal Ödeme</span>
              <span className="text-xs opacity-70">Mevcut borçtan düşülür</span>
            </Button>
            
            <Button
              type="button"
              variant={paymentType === 'installment' ? 'default' : 'outline'}
              className="h-auto p-4 flex flex-col gap-2"
              onClick={() => setPaymentType('installment')}
              disabled={unpaidInstallments.length === 0}
            >
              <Clock className="h-6 w-6" />
              <span className="font-medium">Vadeli Ödeme Tahsilatı</span>
              <span className="text-xs opacity-70">
                {unpaidInstallments.length > 0 ? `${unpaidInstallments.length} adet mevcut` : 'Vadeli ödeme yok'}
              </span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Current Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {paymentType === 'regular' && (
          <Card className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border-red-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-500 rounded-lg">
                  <DollarSign className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Mevcut Borç</p>
                  <p className="text-xl font-bold text-red-600">₺{currentDebt.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        
        {paymentType === 'installment' && unpaidInstallments.length > 0 && (
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500 rounded-lg">
                  <Clock className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Vadeli Ödemeler</p>
                  <p className="text-xl font-bold text-purple-600">{unpaidInstallments.length} adet</p>
                  <p className="text-sm text-purple-500">
                    Toplam: ₺{unpaidInstallments.reduce((sum, inst) => sum + inst.amount, 0).toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Installment Selection */}
        {paymentType === 'installment' && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Vadeli Ödeme Seçimi</CardTitle>
            </CardHeader>
            <CardContent>
              {unpaidInstallments.length > 0 ? (
                <div className="space-y-3">
                  {unpaidInstallments.map((installment) => (
                    <div
                      key={installment.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedInstallment === installment.id.toString()
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                      onClick={() => setSelectedInstallment(installment.id.toString())}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">{installment.itemName}</p>
                          <p className="text-sm text-muted-foreground">
                            Vade: {installment.dueDate ? new Date(installment.dueDate).toLocaleDateString('tr-TR') : 'Tarih yok'}
                          </p>
                        </div>
                        <Badge variant="secondary" className="font-medium">
                          ₺{installment.amount.toLocaleString()}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Clock className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Bu müşterinin ödenmemiş vadeli ödemesi bulunmamaktadır.</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Payment Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Ödeme Detayları</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Amount Input */}
            <div>
              <Label className="text-sm font-medium">Ödeme Tutarı (₺)</Label>
              {paymentType === 'regular' && (
                <p className="text-xs text-muted-foreground mb-2">
                  Maksimum: ₺{currentDebt.toLocaleString()}
                </p>
              )}
              {paymentType === 'installment' && selectedInstallment && (
                <p className="text-xs text-muted-foreground mb-2">
                  Maksimum: ₺{unpaidInstallments.find(r => r.id.toString() === selectedInstallment)?.amount.toLocaleString() || 0}
                </p>
              )}
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0,00"
                className="text-lg"
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

            <Separator />

            {/* Payment Method */}
            <div>
              <Label className="text-sm font-medium mb-3 block">Ödeme Yöntemi</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {Object.entries(paymentMethodIcons).map(([method, Icon]) => (
                  <Button
                    key={method}
                    type="button"
                    variant={paymentMethod === method ? 'default' : 'outline'}
                    className="h-auto p-3 flex flex-col gap-1"
                    onClick={() => setPaymentMethod(method)}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="text-xs">{method}</span>
                  </Button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <Label className="text-sm font-medium">Açıklama (Opsiyonel)</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ödeme ile ilgili not ekleyin..."
                className="mt-1 resize-none"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <Button 
          type="submit" 
          className="w-full h-12 text-lg font-medium"
          disabled={
            (paymentType === 'regular' && currentDebt <= 0) ||
            (paymentType === 'installment' && unpaidInstallments.length === 0)
          }
        >
          {paymentType === 'regular' ? 'Ödeme Al' : 'Vadeli Ödeme Tahsilatı Yap'}
        </Button>
      </form>
    </div>
  );
};

export default CustomerPaymentForm;
