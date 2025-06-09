
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Calendar, 
  DollarSign,
  Package,
  User,
  X,
  Phone,
  Mail,
  Percent,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { formatCurrency } from '@/utils/format';
import { Personnel, PersonnelRecord, getPersonnelRecords } from '@/utils/storage/personnel';
import { useQuery } from '@tanstack/react-query';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { format } from 'date-fns';

interface PersonnelAccountCardProps {
  personnel: Personnel;
  onClose: () => void;
}

const PersonnelAccountCard = ({ personnel, onClose }: PersonnelAccountCardProps) => {
  const { data: records = [] } = useQuery({
    queryKey: ['personnelRecords', personnel.id],
    queryFn: () => getPersonnelRecords(personnel.id),
  });

  // Calculate metrics
  const totalEarnings = records
    .filter(record => record.type === 'commission')
    .reduce((sum, record) => sum + record.amount, 0);

  const totalDeductions = records
    .filter(record => record.type === 'deduction')
    .reduce((sum, record) => sum + Math.abs(record.amount), 0);

  const netEarnings = totalEarnings - totalDeductions;

  const serviceCount = records.filter(record => record.type === 'service').length;
  const productSalesCount = records.filter(record => record.type === 'product').length;

  const getRecordTypeLabel = (type: string) => {
    switch (type) {
      case 'service': return 'Hizmet';
      case 'product': return 'Ürün Satışı';
      case 'commission': return 'Komisyon';
      case 'deduction': return 'Kesinti';
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
    <Card className="max-w-4xl mx-auto">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div 
              className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold"
              style={{ backgroundColor: personnel.color }}
            >
              <User className="h-6 w-6" />
            </div>
            <div>
              <CardTitle className="text-xl">{personnel.name}</CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline">{personnel.title}</Badge>
                <Badge variant="secondary">%{personnel.commissionRate} komisyon</Badge>
              </div>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {/* Contact Info */}
        <Card className="p-4 mb-6 bg-muted/50">
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

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4 bg-green-50 dark:bg-green-950">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium">Toplam Hakediş</span>
            </div>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(totalEarnings)}</div>
          </Card>

          <Card className="p-4 bg-red-50 dark:bg-red-950">
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown className="h-4 w-4 text-red-500" />
              <span className="text-sm font-medium">Kesintiler</span>
            </div>
            <div className="text-2xl font-bold text-red-600">{formatCurrency(totalDeductions)}</div>
          </Card>

          <Card className="p-4 bg-blue-50 dark:bg-blue-950">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium">Net Kazanç</span>
            </div>
            <div className="text-2xl font-bold text-blue-600">{formatCurrency(netEarnings)}</div>
          </Card>

          <Card className="p-4 bg-purple-50 dark:bg-purple-950">
            <div className="flex items-center gap-2 mb-2">
              <Package className="h-4 w-4 text-purple-500" />
              <span className="text-sm font-medium">Toplam İşlem</span>
            </div>
            <div className="text-2xl font-bold text-purple-600">{records.length}</div>
          </Card>
        </div>

        <Tabs defaultValue="records" className="space-y-4">
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="records">Tüm İşlemler</TabsTrigger>
            <TabsTrigger value="commissions">Hakediş</TabsTrigger>
            <TabsTrigger value="summary">Özet</TabsTrigger>
          </TabsList>

          <TabsContent value="records">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">İşlem Geçmişi</CardTitle>
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

          <TabsContent value="commissions">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Hakediş Detayları</CardTitle>
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
                    {records.filter(r => r.type === 'commission').map((record) => (
                      <TableRow key={record.id}>
                        <TableCell>{format(new Date(record.date), 'dd/MM/yyyy')}</TableCell>
                        <TableCell>{record.description}</TableCell>
                        <TableCell>{record.customerName || '-'}</TableCell>
                        <TableCell className="text-right text-green-600">
                          +{formatCurrency(record.amount)}
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow className="font-bold bg-muted">
                      <TableCell colSpan={3}>Toplam Hakediş</TableCell>
                      <TableCell className="text-right">{formatCurrency(totalEarnings)}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="summary">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Finansal Özet
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Toplam Hakediş:</span>
                    <Badge variant="secondary" className="text-lg font-bold">
                      {formatCurrency(totalEarnings)}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Toplam Kesinti:</span>
                    <Badge variant="outline" className="text-lg font-bold">
                      {formatCurrency(totalDeductions)}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center border-t pt-4">
                    <span className="font-medium">Net Kazanç:</span>
                    <Badge variant="default" className="text-lg font-bold">
                      {formatCurrency(netEarnings)}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    İş Performansı
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Verilen Hizmet:</span>
                    <span className="font-bold">{serviceCount}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Ürün Satışı:</span>
                    <span className="font-bold">{productSalesCount}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Toplam İşlem:</span>
                    <span className="font-bold">{records.length}</span>
                  </div>
                  <div className="flex justify-between items-center border-t pt-4">
                    <span className="font-medium">Komisyon Oranı:</span>
                    <Badge variant="outline">%{personnel.commissionRate}</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default PersonnelAccountCard;
