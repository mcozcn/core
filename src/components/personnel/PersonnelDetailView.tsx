
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft,
  DollarSign,
  Package,
  User,
  Phone,
  Mail,
  Percent,
  TrendingUp,
  Calendar
} from 'lucide-react';
import { formatCurrency } from '@/utils/format';
import { Personnel, PersonnelRecord, getPersonnelRecords, addPersonnelRecord } from '@/utils/storage/personnel';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { format } from 'date-fns';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

interface PersonnelDetailViewProps {
  personnel: Personnel;
  onBack: () => void;
}

const PersonnelDetailView = ({ personnel, onBack }: PersonnelDetailViewProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentDescription, setPaymentDescription] = useState('');

  const { data: records = [] } = useQuery({
    queryKey: ['personnelRecords', personnel.id],
    queryFn: () => getPersonnelRecords(personnel.id),
  });

  // Calculate metrics
  const totalEarnings = records
    .filter(record => record.type === 'commission')
    .reduce((sum, record) => sum + record.amount, 0);

  const totalPayments = records
    .filter(record => record.type === 'deduction' && record.description.includes('Ödeme'))
    .reduce((sum, record) => sum + Math.abs(record.amount), 0);

  const remainingBalance = totalEarnings - totalPayments;
  const totalTransactions = records.filter(r => r.type === 'service' || r.type === 'product').length;

  const commissionRecords = records.filter(record => record.type === 'commission');
  const paymentRecords = records.filter(record => record.type === 'deduction' && record.description.includes('Ödeme'));

  const handlePayment = async () => {
    if (!paymentAmount || parseFloat(paymentAmount) <= 0) {
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Geçerli bir ödeme tutarı girin",
      });
      return;
    }

    const amount = parseFloat(paymentAmount);
    if (amount > remainingBalance) {
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Ödeme tutarı kalan bakiyeden fazla olamaz",
      });
      return;
    }

    try {
      await addPersonnelRecord({
        personnelId: personnel.id,
        type: 'deduction',
        amount: amount,
        description: `Ödeme: ${paymentDescription || 'Hakediş ödemesi'}`,
        date: new Date(),
      });

      setPaymentAmount('');
      setPaymentDescription('');
      queryClient.invalidateQueries({ queryKey: ['personnelRecords'] });

      toast({
        title: "Başarılı",
        description: "Ödeme kaydedildi",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Ödeme kaydedilemedi",
      });
    }
  };

  const getRecordTypeLabel = (type: string) => {
    switch (type) {
      case 'service': return 'Hizmet';
      case 'product': return 'Ürün Satışı';
      case 'commission': return 'Komisyon';
      case 'deduction': return 'Kesinti/Ödeme';
      default: return type;
    }
  };

  const getRecordTypeBadge = (type: string) => {
    switch (type) {
      case 'service': return 'default';
      case 'product': return 'secondary';
      case 'commission': return 'default';
      case 'deduction': return 'destructive';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-3">
          <div 
            className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold"
            style={{ backgroundColor: personnel.color }}
          >
            <User className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{personnel.name}</h1>
            <div className="flex items-center gap-2">
              <Badge variant="outline">{personnel.title}</Badge>
              <Badge variant="secondary">%{personnel.commissionRate} komisyon</Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Info */}
      <Card className="p-4 bg-muted/50">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <span>{personnel.phone}</span>
          </div>
          {personnel.email && (
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span>{personnel.email}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Percent className="h-4 w-4 text-muted-foreground" />
            <span>%{personnel.commissionRate} komisyon oranı</span>
          </div>
        </div>
        {personnel.notes && (
          <div className="mt-3 pt-3 border-t">
            <p className="text-sm text-muted-foreground">{personnel.notes}</p>
          </div>
        )}
      </Card>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid grid-cols-3 w-full">
          <TabsTrigger value="overview">Genel Bakış</TabsTrigger>
          <TabsTrigger value="commission">Hak Ediş</TabsTrigger>
          <TabsTrigger value="payments">Ödeme Yap</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          {/* Summary Cards */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <Card className="p-4 bg-blue-50 dark:bg-blue-950">
              <div className="flex items-center gap-2 mb-2">
                <Package className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-medium">Toplam İşlem</span>
              </div>
              <div className="text-2xl font-bold text-blue-600">{totalTransactions}</div>
            </Card>

            <Card className="p-4 bg-green-50 dark:bg-green-950">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium">Toplam Hakediş</span>
              </div>
              <div className="text-2xl font-bold text-green-600">{formatCurrency(totalEarnings)}</div>
            </Card>

            <Card className="p-4 bg-purple-50 dark:bg-purple-950">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="h-4 w-4 text-purple-500" />
                <span className="text-sm font-medium">Kalan Bakiye</span>
              </div>
              <div className="text-2xl font-bold text-purple-600">{formatCurrency(remainingBalance)}</div>
            </Card>
          </div>

          {/* All Records */}
          <Card>
            <CardHeader>
              <CardTitle>Tüm İşlemler</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tarih</TableHead>
                    <TableHead>Tip</TableHead>
                    <TableHead>Açıklama</TableHead>
                    <TableHead>Müşteri</TableHead>
                    <TableHead className="text-right">Tutar</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {records.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>{format(new Date(record.date), 'dd/MM/yyyy')}</TableCell>
                      <TableCell>
                        <Badge variant={getRecordTypeBadge(record.type) as any}>
                          {getRecordTypeLabel(record.type)}
                        </Badge>
                      </TableCell>
                      <TableCell>{record.description}</TableCell>
                      <TableCell>{record.customerName || '-'}</TableCell>
                      <TableCell className="text-right">
                        <span className={record.type === 'deduction' ? 'text-red-600' : 'text-green-600'}>
                          {record.type === 'deduction' ? '-' : '+'}{formatCurrency(Math.abs(record.amount))}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="commission">
          {/* Commission Summary Cards */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <Card className="p-4 bg-yellow-50 dark:bg-yellow-950">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="h-4 w-4 text-yellow-500" />
                <span className="text-sm font-medium">Toplam İşlem Tutarı</span>
              </div>
              <div className="text-2xl font-bold text-yellow-600">
                {formatCurrency(records.filter(r => r.type === 'service' || r.type === 'product').reduce((sum, r) => sum + (r.amount || 0), 0))}
              </div>
            </Card>

            <Card className="p-4 bg-blue-50 dark:bg-blue-950">
              <div className="flex items-center gap-2 mb-2">
                <Package className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-medium">Toplam İşlem Miktarı</span>
              </div>
              <div className="text-2xl font-bold text-blue-600">{totalTransactions}</div>
            </Card>

            <Card className="p-4 bg-green-50 dark:bg-green-950">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium">Hakediş Tutarı</span>
              </div>
              <div className="text-2xl font-bold text-green-600">{formatCurrency(totalEarnings)}</div>
            </Card>
          </div>

          {/* Commission Records */}
          <Card>
            <CardHeader>
              <CardTitle>Hakediş Detayları</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tarih</TableHead>
                    <TableHead>Açıklama</TableHead>
                    <TableHead>Müşteri</TableHead>
                    <TableHead className="text-right">Komisyon</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {commissionRecords.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>{format(new Date(record.date), 'dd/MM/yyyy')}</TableCell>
                      <TableCell>{record.description}</TableCell>
                      <TableCell>{record.customerName || '-'}</TableCell>
                      <TableCell className="text-right text-green-600">
                        +{formatCurrency(record.amount)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments">
          <div className="space-y-6">
            {/* Payment Form */}
            <Card>
              <CardHeader>
                <CardTitle>Ödeme Yap</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Kalan Bakiye: {formatCurrency(remainingBalance)}
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Ödeme Tutarı</label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Açıklama</label>
                  <Textarea
                    placeholder="Ödeme açıklaması..."
                    value={paymentDescription}
                    onChange={(e) => setPaymentDescription(e.target.value)}
                  />
                </div>
                <Button onClick={handlePayment} className="w-full">
                  Ödeme Yap
                </Button>
              </CardContent>
            </Card>

            {/* Payment History */}
            <Card>
              <CardHeader>
                <CardTitle>Ödeme Geçmişi</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tarih</TableHead>
                      <TableHead>Açıklama</TableHead>
                      <TableHead className="text-right">Tutar</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paymentRecords.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell>{format(new Date(record.date), 'dd/MM/yyyy')}</TableCell>
                        <TableCell>{record.description}</TableCell>
                        <TableCell className="text-right text-red-600">
                          -{formatCurrency(Math.abs(record.amount))}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PersonnelDetailView;
