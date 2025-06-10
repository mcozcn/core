import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getCustomerRecords, getAppointments, type Customer, type Appointment } from '@/utils/storage';
import CustomerRecordsList from './CustomerRecordsList';
import CustomerAppointmentsList from './CustomerAppointmentsList';
import CustomerInstallmentForm from './forms/CustomerInstallmentForm';
import CustomerPaymentForm from './forms/CustomerPaymentForm';
import EditCustomerForm from './EditCustomerForm';
import { Phone, Mail, MapPin, Calendar, Edit } from 'lucide-react';

interface CustomerDetailViewProps {
  customer: Customer;
  onEdit: () => void;
}

const CustomerDetailView = ({ customer, onEdit }: CustomerDetailViewProps) => {
  const [showEditDialog, setShowEditDialog] = useState(false);
  const queryClient = useQueryClient();
  
  const { data: records = [] } = useQuery({
    queryKey: ['customerRecords', customer.id],
    queryFn: async () => {
      const allRecords = await getCustomerRecords();
      return allRecords.filter(record => record.customerId === customer.id);
    }
  });

  const { data: appointments = [] } = useQuery({
    queryKey: ['customerAppointments', customer.id],
    queryFn: async () => {
      const allAppointments = await getAppointments();
      return allAppointments.filter(apt => apt.customerId === customer.id);
    }
  });

  const handleEditSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['customers'] });
    setShowEditDialog(false);
  };

  // Son işlem tarihi
  const lastTransaction = records.length > 0 
    ? records.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]
    : null;

  // Hesaplamalar
  const totalDebt = records.reduce((acc, record) => record.type !== 'payment' ? acc + record.amount : acc, 0);
  const totalPayments = records.reduce((acc, record) => record.type === 'payment' ? acc + Math.abs(record.amount) : acc, 0);
  const installmentTotal = records.reduce((acc, record) => record.recordType === 'installment' ? acc + record.amount : acc, 0);
  const remainingDebt = Math.max(0, totalDebt - totalPayments);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="text-2xl font-serif">Müşteri Bilgisi</CardTitle>
            <Button size="sm" variant="outline" onClick={() => setShowEditDialog(true)}>
              <Edit className="h-4 w-4 mr-2" />
              Düzenle
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">Kişisel ve iletişim bilgileri</p>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex flex-col items-center">
              <Avatar className="h-24 w-24 mb-2">
                <AvatarFallback className="text-lg">{getInitials(customer.name)}</AvatarFallback>
              </Avatar>
              <h3 className="font-medium text-lg">{customer.name}</h3>
              <p className="text-sm text-muted-foreground">Müşteri</p>
            </div>

            <div className="flex-1 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">İletişim Bilgileri</h4>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>{customer.phone}</span>
                    </div>
                    {customer.email && (
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>{customer.email}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">Son İşlem</h4>
                  <div className="space-y-2">
                    {lastTransaction ? (
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>{new Date(lastTransaction.date).toLocaleDateString('tr-TR')}</span>
                        <span className="ml-2 text-sm text-muted-foreground">
                          ({lastTransaction.itemName})
                        </span>
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">İşlem bulunamadı</span>
                    )}
                    <div className="text-sm text-muted-foreground">
                      Toplam İşlem: {records.length}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">Notlar</h4>
                <p className="text-sm">
                  {customer.notes || "Not bulunmamaktadır."}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="genel" className="w-full">
        <TabsList className="mb-4 w-full md:w-auto">
          <TabsTrigger value="genel">Genel Bakış</TabsTrigger>
          <TabsTrigger value="islemler">İşlem Geçmişi</TabsTrigger>
          <TabsTrigger value="randevular">Randevu Geçmişi</TabsTrigger>
          <TabsTrigger value="vadeli">Vadeli Ödeme</TabsTrigger>
          <TabsTrigger value="odeme">Ödeme Al</TabsTrigger>
        </TabsList>

        <TabsContent value="genel">
          <Card>
            <CardHeader>
              <CardTitle>Genel Bakış</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-orange-50 dark:bg-orange-900/20 border-none">
                  <CardHeader className="p-4 pb-2">
                    <h3 className="text-sm font-medium text-muted-foreground">Toplam Harcama</h3>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <p className="text-2xl font-semibold text-orange-600 dark:text-orange-400">
                      {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(totalDebt)}
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-purple-50 dark:bg-purple-900/20 border-none">
                  <CardHeader className="p-4 pb-2">
                    <h3 className="text-sm font-medium text-muted-foreground">Vadelenen Tutar</h3>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <p className="text-2xl font-semibold text-purple-600 dark:text-purple-400">
                      {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(installmentTotal)}
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-green-50 dark:bg-green-900/20 border-none">
                  <CardHeader className="p-4 pb-2">
                    <h3 className="text-sm font-medium text-muted-foreground">Toplam Ödeme</h3>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <p className="text-2xl font-semibold text-green-600 dark:text-green-400">
                      {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(totalPayments)}
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-red-50 dark:bg-red-900/20 border-none">
                  <CardHeader className="p-4 pb-2">
                    <h3 className="text-sm font-medium text-muted-foreground">Kalan Borç</h3>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <p className="text-2xl font-semibold text-red-600 dark:text-red-400">
                      {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(remainingDebt)}
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="mt-6">
                <h3 className="text-lg font-medium mb-4">Son 5 İşlem</h3>
                <CustomerRecordsList 
                  records={records.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5)}
                />
              </div>

              <div className="mt-6">
                <h3 className="text-lg font-medium mb-4">Yaklaşan Randevular</h3>
                {appointments.filter(apt => new Date(apt.date) >= new Date()).length > 0 ? (
                  <CustomerAppointmentsList 
                    appointments={appointments
                      .filter(apt => new Date(apt.date) >= new Date())
                      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                      .slice(0, 3)
                      .map((apt): Appointment => ({
                        ...apt,
                        service: apt.service || ''
                      }))}
                    customerPhone={customer.phone}
                  />
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    Yaklaşan randevu bulunmamaktadır
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="islemler">
          <Card>
            <CardHeader>
              <CardTitle>İşlem Geçmişi</CardTitle>
            </CardHeader>
            <CardContent>
              <CustomerRecordsList 
                records={records}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="randevular">
          <Card>
            <CardHeader>
              <CardTitle>Randevu Geçmişi</CardTitle>
            </CardHeader>
            <CardContent>
              <CustomerAppointmentsList 
                appointments={appointments.map((apt): Appointment => ({
                  ...apt,
                  service: apt.service || ''
                }))}
                customerPhone={customer.phone}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vadeli">
          <Card>
            <CardHeader>
              <CardTitle>Vadeli Ödeme</CardTitle>
            </CardHeader>
            <CardContent>
              <CustomerInstallmentForm 
                customerId={customer.id}
                onSuccess={() => queryClient.invalidateQueries({ queryKey: ['customerRecords'] })}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="odeme">
          <Card>
            <CardHeader>
              <CardTitle>Ödeme Al</CardTitle>
            </CardHeader>
            <CardContent>
              <CustomerPaymentForm 
                customerId={customer.id}
                onSuccess={() => queryClient.invalidateQueries({ queryKey: ['customerRecords'] })}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Customer Dialog */}
      {customer && (
        <EditCustomerForm
          customer={customer}
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
          onSuccess={handleEditSuccess}
        />
      )}
    </div>
  );
};

export default CustomerDetailView;
