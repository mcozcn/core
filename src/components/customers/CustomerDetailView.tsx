
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { getCurrentUser, type User } from '@/utils/storage/userManager';
import { type Customer } from '@/utils/storage/customers';
import { useQuery } from '@tanstack/react-query';
import { getAppointments, getCustomerRecords } from '@/utils/storage';
import { Phone, Mail, Calendar, MapPin, Edit, Trash2, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import EditCustomerForm from './EditCustomerForm';
import CustomerAppointmentsList from './CustomerAppointmentsList';
import CustomerRecordsList from './CustomerRecordsList';
import AddCustomerRecordForm from './AddCustomerRecordForm';
import CustomerPaymentForm from './forms/CustomerPaymentForm';
import CustomerDebtForm from './forms/CustomerDebtForm';
import CustomerInstallmentForm from './forms/CustomerInstallmentForm';

interface CustomerDetailViewProps {
  customer: Customer;
  onCustomerUpdated: () => void;
  onCustomerDeleted?: () => void;
}

const CustomerDetailView = ({ customer, onCustomerUpdated, onCustomerDeleted }: CustomerDetailViewProps) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showAddRecordDialog, setShowAddRecordDialog] = useState(false);

  // Fetch appointments and records for this customer
  const { data: allAppointments = [] } = useQuery({
    queryKey: ['appointments'],
    queryFn: getAppointments,
  });

  const { data: allRecords = [] } = useQuery({
    queryKey: ['customerRecords'],
    queryFn: getCustomerRecords,
  });

  const customerAppointments = allAppointments.filter(apt => apt.customerId === customer.id);
  const customerRecords = allRecords.filter(record => record.customerId === customer.id);

  React.useEffect(() => {
    loadCurrentUser();
  }, []);

  const loadCurrentUser = async () => {
    const user = await getCurrentUser();
    setCurrentUser(user);
  };

  const isAdmin = currentUser?.role === 'admin';

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(amount);
  };

  const handleEditSuccess = () => {
    setShowEditDialog(false);
    onCustomerUpdated();
  };

  const handleDeleteCustomer = async () => {
    try {
      const { deleteCustomer } = await import('@/utils/storage/customers');
      const success = await deleteCustomer(customer.id);
      if (success) {
        const { toast } = await import('@/hooks/use-toast');
        toast({
          title: 'Başarılı',
          description: 'Müşteri başarıyla silindi.'
        });
        onCustomerDeleted?.();
      }
    } catch (error) {
      console.error('Error deleting customer:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      active: 'default',
      inactive: 'secondary',
      blocked: 'destructive'
    } as const;
    
    const labels = {
      active: 'Aktif',
      inactive: 'Pasif',
      blocked: 'Engelli'
    };
    
    return (
      <Badge variant={variants[status as keyof typeof variants] || 'outline'}>
        {labels[status as keyof typeof labels] || status}
      </Badge>
    );
  };

  const handleDialogSuccess = () => {
    setShowAddRecordDialog(false);
    onCustomerUpdated();
  };

  // Calculate financial summary with improved installment handling
  const totalSpent = customerRecords
    .filter(record => record.type !== 'payment')
    .reduce((sum, record) => sum + record.amount, 0);

  const totalPayments = customerRecords
    .filter(record => record.type === 'payment')
    .reduce((sum, record) => sum + Math.abs(record.amount), 0);

  // Calculate installment amounts using recordType field
  const installmentRecords = customerRecords.filter(record => record.recordType === 'installment');
  const totalInstallmentAmount = installmentRecords.reduce((sum, record) => sum + record.amount, 0);

  // Calculate installment payments using recordType field
  const installmentPayments = customerRecords
    .filter(record => record.recordType === 'installment_payment')
    .reduce((sum, record) => sum + Math.abs(record.amount), 0);

  const remainingInstallmentAmount = Math.max(0, totalInstallmentAmount - installmentPayments);
  const remainingDebt = Math.max(0, totalSpent - totalPayments);

  return (
    <div className="space-y-6">
      {/* Header with Customer Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Customer Info */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl font-bold">{customer.name}</CardTitle>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm text-muted-foreground">Kişisel ve İletişim Bilgileri</span>
                    {getStatusBadge(customer.status || 'active')}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4 mr-2" />
                        Düzenle
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                      <EditCustomerForm 
                        customer={customer}
                        onSuccess={handleEditSuccess}
                      />
                    </DialogContent>
                  </Dialog>

                  {isAdmin && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Sil
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Müşteriyi Sil</AlertDialogTitle>
                          <AlertDialogDescription>
                            <strong>{customer.name}</strong> müşterisini silmek istediğinizden emin misiniz? 
                            Bu işlem geri alınamaz ve müşteriye ait tüm kayıtlar silinecektir.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>İptal</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={handleDeleteCustomer}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Sil
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                  <span className="text-xl font-bold text-gray-600">
                    {customer.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </span>
                </div>
                <div className="space-y-1">
                  <h3 className="font-medium">{customer.name}</h3>
                  <p className="text-sm text-muted-foreground">Müşteri</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                {customer.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{customer.phone}</span>
                  </div>
                )}
                {customer.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{customer.email}</span>
                  </div>
                )}
                {customer.address && (
                  <div className="flex items-start gap-2 col-span-2">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                    <span className="text-sm">{customer.address}</span>
                  </div>
                )}
              </div>

              {customer.notes && (
                <div className="pt-4 border-t">
                  <h4 className="font-medium mb-2">Notlar</h4>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {customer.notes}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Financial Summary */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Genel Bakış</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Toplam Harcama</span>
                  <span className="font-semibold text-orange-600">
                    {formatCurrency(totalSpent)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Vadeli Tutar</span>
                  <span className="font-semibold text-blue-600">
                    {formatCurrency(remainingInstallmentAmount)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Toplam Ödeme</span>
                  <span className="font-semibold text-green-600">
                    {formatCurrency(totalPayments)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Kalan Borç</span>
                  <span className="font-semibold text-red-600">
                    {formatCurrency(remainingDebt)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="p-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Son İşlem</span>
              </div>
              <div className="space-y-1">
                {customer.lastVisit ? (
                  <>
                    <div className="text-lg font-semibold">
                      {format(new Date(customer.lastVisit), 'dd.MM.yyyy', { locale: tr })}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Son ziyaret tarihi
                    </div>
                  </>
                ) : (
                  <div className="text-sm text-muted-foreground">Henüz işlem bulunmamaktadır</div>
                )}
              </div>
              <div className="text-sm text-muted-foreground">
                Toplam İşlem: {customerRecords.length}
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Tabs Section */}
      <Tabs defaultValue="records" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="records">İşlem Geçmişi</TabsTrigger>
          <TabsTrigger value="appointments">Randevu Geçmişi</TabsTrigger>
          <TabsTrigger value="installment">Vadeli Ödeme</TabsTrigger>
          <TabsTrigger value="payment">Ödeme Al</TabsTrigger>
          <TabsTrigger value="debt">Borç Ver</TabsTrigger>
        </TabsList>

        <TabsContent value="records">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>İşlem Geçmişi</CardTitle>
                <Dialog open={showAddRecordDialog} onOpenChange={setShowAddRecordDialog}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Yeni Kayıt
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                      <DialogTitle>Yeni Kayıt Ekle</DialogTitle>
                    </DialogHeader>
                    <AddCustomerRecordForm 
                      customerId={customer.id}
                      onSuccess={handleDialogSuccess}
                    />
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <CustomerRecordsList records={customerRecords} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appointments">
          <Card>
            <CardHeader>
              <CardTitle>Randevu Geçmişi</CardTitle>
            </CardHeader>
            <CardContent>
              <CustomerAppointmentsList 
                appointments={customerAppointments} 
                customerPhone={customer.phone}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="installment">
          <Card>
            <CardHeader>
              <CardTitle>Vadeli Ödeme</CardTitle>
            </CardHeader>
            <CardContent>
              <CustomerInstallmentForm 
                customerId={customer.id}
                onSuccess={handleDialogSuccess}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payment">
          <Card>
            <CardHeader>
              <CardTitle>Ödeme Al</CardTitle>
            </CardHeader>
            <CardContent>
              <CustomerPaymentForm 
                customerId={customer.id}
                onSuccess={handleDialogSuccess}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="debt">
          <Card>
            <CardHeader>
              <CardTitle>Borç Ver</CardTitle>
            </CardHeader>
            <CardContent>
              <CustomerDebtForm 
                customerId={customer.id}
                onSuccess={handleDialogSuccess}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CustomerDetailView;
