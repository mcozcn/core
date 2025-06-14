
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
import { Phone, Mail, Calendar, MapPin, CreditCard, DollarSign, Clock, Edit, Trash2, Plus } from 'lucide-react';
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
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [showDebtDialog, setShowDebtDialog] = useState(false);
  const [showInstallmentDialog, setShowInstallmentDialog] = useState(false);

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
    setShowPaymentDialog(false);
    setShowDebtDialog(false);
    setShowInstallmentDialog(false);
    onCustomerUpdated();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">{customer.name}</h2>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-muted-foreground">Müşteri Detayları</p>
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

      {/* Customer Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Contact Information Card */}
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-medium text-blue-700 dark:text-blue-300 flex items-center gap-2">
              <Phone className="h-5 w-5" />
              İletişim Bilgileri
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {customer.phone && (
              <div className="flex items-center gap-3 p-2 bg-white/50 dark:bg-gray-800/50 rounded-md">
                <Phone className="h-4 w-4 text-blue-600" />
                <div>
                  <p className="text-xs text-muted-foreground">Telefon</p>
                  <p className="font-medium">{customer.phone}</p>
                </div>
              </div>
            )}
            {customer.email && (
              <div className="flex items-center gap-3 p-2 bg-white/50 dark:bg-gray-800/50 rounded-md">
                <Mail className="h-4 w-4 text-blue-600" />
                <div>
                  <p className="text-xs text-muted-foreground">E-posta</p>
                  <p className="font-medium text-sm">{customer.email}</p>
                </div>
              </div>
            )}
            {customer.address && (
              <div className="flex items-start gap-3 p-2 bg-white/50 dark:bg-gray-800/50 rounded-md">
                <MapPin className="h-4 w-4 text-blue-600 mt-1" />
                <div>
                  <p className="text-xs text-muted-foreground">Adres</p>
                  <p className="font-medium text-sm leading-tight">{customer.address}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Financial Information Card */}
        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-orange-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-medium text-orange-700 dark:text-orange-300 flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Finansal Durum
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-3 bg-white/50 dark:bg-gray-800/50 rounded-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-red-600" />
                  <span className="text-sm text-muted-foreground">Borç</span>
                </div>
                <span className="font-bold text-red-600">{formatCurrency(customer.debt || 0)}</span>
              </div>
            </div>
            <div className="p-3 bg-white/50 dark:bg-gray-800/50 rounded-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-muted-foreground">Toplam Harcama</span>
                </div>
                <span className="font-bold text-green-600">{formatCurrency(customer.totalSpent || 0)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statistics and Dates Card */}
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-medium text-purple-700 dark:text-purple-300 flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              İstatistikler
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-3 bg-white/50 dark:bg-gray-800/50 rounded-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-purple-600" />
                  <span className="text-sm text-muted-foreground">Randevu Sayısı</span>
                </div>
                <span className="font-bold text-purple-600">{customerAppointments.length}</span>
              </div>
            </div>
            <div className="p-3 bg-white/50 dark:bg-gray-800/50 rounded-md">
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="h-4 w-4 text-purple-600" />
                <span className="text-sm text-muted-foreground">Kayıt Tarihi</span>
              </div>
              <span className="font-medium text-sm">
                {format(new Date(customer.createdAt), 'dd MMMM yyyy', { locale: tr })}
              </span>
            </div>
            {customer.birthDate && (
              <div className="p-3 bg-white/50 dark:bg-gray-800/50 rounded-md">
                <div className="flex items-center gap-2 mb-1">
                  <Calendar className="h-4 w-4 text-purple-600" />
                  <span className="text-sm text-muted-foreground">Doğum Tarihi</span>
                </div>
                <span className="font-medium text-sm">
                  {format(new Date(customer.birthDate), 'dd MMMM yyyy', { locale: tr })}
                </span>
              </div>
            )}
            {customer.lastVisit && (
              <div className="p-3 bg-white/50 dark:bg-gray-800/50 rounded-md">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="h-4 w-4 text-purple-600" />
                  <span className="text-sm text-muted-foreground">Son Ziyaret</span>
                </div>
                <span className="font-medium text-sm">
                  {format(new Date(customer.lastVisit), 'dd MMMM yyyy', { locale: tr })}
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Notes Section */}
      {customer.notes && (
        <Card>
          <CardHeader>
            <CardTitle>Notlar</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {customer.notes}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Tabs Section */}
      <Tabs defaultValue="appointments" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="appointments">Randevular</TabsTrigger>
          <TabsTrigger value="records">Kayıtlar</TabsTrigger>
          <TabsTrigger value="payments">Ödeme Al</TabsTrigger>
          <TabsTrigger value="debt">Borç Ver</TabsTrigger>
          <TabsTrigger value="installment">Vadeli Ödeme</TabsTrigger>
        </TabsList>

        <TabsContent value="appointments">
          <Card>
            <CardHeader>
              <CardTitle>Randevular</CardTitle>
            </CardHeader>
            <CardContent>
              <CustomerAppointmentsList 
                appointments={customerAppointments} 
                customerPhone={customer.phone}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="records">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Kayıtlar</CardTitle>
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

        <TabsContent value="payments">
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
      </Tabs>

      {/* Payment Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Ödeme Al</DialogTitle>
          </DialogHeader>
          <CustomerPaymentForm 
            customerId={customer.id}
            onSuccess={handleDialogSuccess}
          />
        </DialogContent>
      </Dialog>

      {/* Debt Dialog */}
      <Dialog open={showDebtDialog} onOpenChange={setShowDebtDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Borç Ver</DialogTitle>
          </DialogHeader>
          <CustomerDebtForm 
            customerId={customer.id}
            onSuccess={handleDialogSuccess}
          />
        </DialogContent>
      </Dialog>

      {/* Installment Dialog */}
      <Dialog open={showInstallmentDialog} onOpenChange={setShowInstallmentDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Vadeli Ödeme</DialogTitle>
          </DialogHeader>
          <CustomerInstallmentForm 
            customerId={customer.id}
            onSuccess={handleDialogSuccess}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CustomerDetailView;
