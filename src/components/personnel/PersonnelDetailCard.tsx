
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Calendar, 
  CheckCircle, 
  XCircle, 
  Clock, 
  TrendingUp, 
  DollarSign,
  Package,
  User,
  X
} from 'lucide-react';
import { formatCurrency } from '@/utils/format';
import { User as PersonnelUser } from '@/utils/storage/userManager';
import { useQuery } from '@tanstack/react-query';
import { getAppointments } from '@/utils/storage/appointments';
import { getServiceSales } from '@/utils/storage/services';
import { getSales } from '@/utils/storage/stock';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { format } from 'date-fns';

interface PersonnelDetailCardProps {
  personnel: PersonnelUser;
  onClose: () => void;
}

const PersonnelDetailCard = ({ personnel, onClose }: PersonnelDetailCardProps) => {
  const { data: appointments = [] } = useQuery({
    queryKey: ['appointments', personnel.id],
    queryFn: () => getAppointments(),
  });

  const { data: serviceSales = [] } = useQuery({
    queryKey: ['serviceSales', personnel.id],
    queryFn: () => getServiceSales(),
  });

  const { data: productSales = [] } = useQuery({
    queryKey: ['productSales', personnel.id],
    queryFn: () => getSales(),
  });

  // Filter data for this personnel
  const personnelAppointments = appointments.filter(apt => apt.staffId === personnel.id);
  const personnelServiceSales = serviceSales.filter(sale => sale.staffId === personnel.id);
  const personnelProductSales = productSales.filter(sale => sale.staffId === personnel.id);

  // Calculate metrics
  const totalAppointments = personnelAppointments.length;
  const confirmedAppointments = personnelAppointments.filter(apt => apt.status === 'confirmed').length;
  const cancelledAppointments = personnelAppointments.filter(apt => apt.status === 'cancelled').length;
  const pendingAppointments = personnelAppointments.filter(apt => apt.status === 'pending').length;

  const serviceRevenue = personnelServiceSales.reduce((sum, sale) => sum + (sale.totalPrice || sale.price || 0), 0);
  const productRevenue = personnelProductSales.reduce((sum, sale) => sum + (sale.totalPrice || 0), 0);
  const totalRevenue = serviceRevenue + productRevenue;

  const totalCommission = personnelServiceSales.reduce((sum, sale) => sum + (sale.commissionAmount || 0), 0) +
                         personnelProductSales.reduce((sum, sale) => sum + (sale.commissionAmount || 0), 0);

  const successRate = totalAppointments > 0 ? Math.round((confirmedAppointments / totalAppointments) * 100) : 0;

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
              <CardTitle className="text-xl">{personnel.displayName}</CardTitle>
              <Badge variant="outline" className="mt-1">{personnel.title}</Badge>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4 bg-blue-50 dark:bg-blue-950">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium">Toplam Randevu</span>
            </div>
            <div className="text-2xl font-bold text-blue-600">{totalAppointments}</div>
          </Card>

          <Card className="p-4 bg-green-50 dark:bg-green-950">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium">Başarı Oranı</span>
            </div>
            <div className="text-2xl font-bold text-green-600">{successRate}%</div>
          </Card>

          <Card className="p-4 bg-purple-50 dark:bg-purple-950">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-4 w-4 text-purple-500" />
              <span className="text-sm font-medium">Toplam Gelir</span>
            </div>
            <div className="text-2xl font-bold text-purple-600">{formatCurrency(totalRevenue)}</div>
          </Card>

          <Card className="p-4 bg-orange-50 dark:bg-orange-950">
            <div className="flex items-center gap-2 mb-2">
              <Package className="h-4 w-4 text-orange-500" />
              <span className="text-sm font-medium">Hakediş</span>
            </div>
            <div className="text-2xl font-bold text-orange-600">{formatCurrency(totalCommission)}</div>
          </Card>
        </div>

        <Tabs defaultValue="appointments" className="space-y-4">
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="appointments">Randevular</TabsTrigger>
            <TabsTrigger value="services">Hizmet Satışları</TabsTrigger>
            <TabsTrigger value="products">Ürün Satışları</TabsTrigger>
            <TabsTrigger value="commissions">Hakediş</TabsTrigger>
          </TabsList>

          <TabsContent value="appointments">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Randevu Geçmişi</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tarih</TableHead>
                      <TableHead>Saat</TableHead>
                      <TableHead>Müşteri</TableHead>
                      <TableHead>Hizmet</TableHead>
                      <TableHead>Durum</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {personnelAppointments.map((appointment) => (
                      <TableRow key={appointment.id}>
                        <TableCell>{format(new Date(appointment.date), 'dd/MM/yyyy')}</TableCell>
                        <TableCell>{appointment.time}</TableCell>
                        <TableCell>{appointment.customerName}</TableCell>
                        <TableCell>{appointment.service}</TableCell>
                        <TableCell>
                          <Badge 
                            variant={
                              appointment.status === 'confirmed' ? 'default' :
                              appointment.status === 'cancelled' ? 'destructive' : 'secondary'
                            }
                          >
                            {appointment.status === 'confirmed' ? 'Onaylandı' :
                             appointment.status === 'cancelled' ? 'İptal' : 'Bekleyen'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="services">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Hizmet Satışları</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tarih</TableHead>
                      <TableHead>Hizmet</TableHead>
                      <TableHead>Müşteri</TableHead>
                      <TableHead className="text-right">Fiyat</TableHead>
                      <TableHead className="text-right">Komisyon</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {personnelServiceSales.map((sale) => (
                      <TableRow key={sale.id}>
                        <TableCell>
                          {format(new Date(sale.saleDate || new Date()), 'dd/MM/yyyy')}
                        </TableCell>
                        <TableCell>{sale.serviceName}</TableCell>
                        <TableCell>{sale.customerName}</TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(sale.totalPrice || sale.price || 0)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(sale.commissionAmount || 0)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="products">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Ürün Satışları</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tarih</TableHead>
                      <TableHead>Ürün</TableHead>
                      <TableHead>Müşteri</TableHead>
                      <TableHead className="text-right">Adet</TableHead>
                      <TableHead className="text-right">Toplam</TableHead>
                      <TableHead className="text-right">Komisyon</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {personnelProductSales.map((sale) => (
                      <TableRow key={sale.id}>
                        <TableCell>
                          {format(new Date(sale.saleDate || sale.date || new Date()), 'dd/MM/yyyy')}
                        </TableCell>
                        <TableCell>{sale.productName}</TableCell>
                        <TableCell>{sale.customerName}</TableCell>
                        <TableCell className="text-right">{sale.quantity || 1}</TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(sale.totalPrice || 0)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(sale.commissionAmount || 0)}
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
                      <TableHead>Tip</TableHead>
                      <TableHead>Açıklama</TableHead>
                      <TableHead className="text-right">Tutar</TableHead>
                      <TableHead className="text-right">Komisyon</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[...personnelServiceSales, ...personnelProductSales].map((sale, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          {format(new Date(sale.saleDate || (sale as any).date || new Date()), 'dd/MM/yyyy')}
                        </TableCell>
                        <TableCell>
                          {'serviceName' in sale ? 'Hizmet' : 'Ürün'}
                        </TableCell>
                        <TableCell>
                          {'serviceName' in sale ? sale.serviceName : sale.productName}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(sale.totalPrice || ('price' in sale ? sale.price : 0) || 0)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(sale.commissionAmount || 0)}
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow className="font-bold bg-muted">
                      <TableCell colSpan={4}>Toplam Hakediş</TableCell>
                      <TableCell className="text-right">{formatCurrency(totalCommission)}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default PersonnelDetailCard;
