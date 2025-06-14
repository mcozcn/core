
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { deleteCustomer, type Customer } from '@/utils/storage/customers';
import { getCurrentUser, type User } from '@/utils/storage/userManager';
import { Edit, Phone, Mail, Calendar, MapPin, CreditCard, DollarSign, Clock, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import EditCustomerForm from './EditCustomerForm';
import CustomerAppointmentsList from './CustomerAppointmentsList';
import CustomerRecordsList from './CustomerRecordsList';

interface CustomerDetailViewProps {
  customer: Customer;
  onCustomerUpdated: () => void;
  onCustomerDeleted?: () => void;
}

const CustomerDetailView = ({ customer, onCustomerUpdated, onCustomerDeleted }: CustomerDetailViewProps) => {
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const { toast } = useToast();

  React.useEffect(() => {
    loadCurrentUser();
  }, []);

  const loadCurrentUser = async () => {
    const user = await getCurrentUser();
    setCurrentUser(user);
  };

  const handleEditSuccess = () => {
    setShowEditDialog(false);
    onCustomerUpdated();
  };

  const handleDeleteCustomer = async () => {
    try {
      const success = await deleteCustomer(customer.id);
      if (success) {
        toast({
          title: 'Başarılı',
          description: 'Müşteri başarıyla silindi.'
        });
        onCustomerDeleted?.();
      } else {
        toast({
          variant: 'destructive',
          title: 'Hata',
          description: 'Müşteri silinemedi.'
        });
      }
    } catch (error) {
      console.error('Error deleting customer:', error);
      toast({
        variant: 'destructive',
        title: 'Hata',
        description: 'Bir hata oluştu.'
      });
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(amount);
  };

  const isAdmin = currentUser?.role === 'admin';

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">{customer.name}</h2>
          <p className="text-muted-foreground">Müşteri Detayları</p>
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
                onCancel={() => setShowEditDialog(false)}
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">İletişim</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {customer.phone && (
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{customer.phone}</span>
              </div>
            )}
            {customer.email && (
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{customer.email}</span>
              </div>
            )}
            {customer.address && (
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="line-clamp-2">{customer.address}</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Durum</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-2">
              {getStatusBadge(customer.status)}
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>
                Kayıt: {format(new Date(customer.createdAt), 'dd MMM yyyy', { locale: tr })}
              </span>
            </div>
            {customer.birthDate && (
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>
                  Doğum: {format(new Date(customer.birthDate), 'dd MMM yyyy', { locale: tr })}
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Finansal</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <CreditCard className="h-4 w-4 text-muted-foreground" />
              <span>Borç: {formatCurrency(customer.debt || 0)}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <span>Harcama: {formatCurrency(customer.totalSpent || 0)}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">İstatistikler</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>Randevu: {customer.appointmentCount || 0}</span>
            </div>
            {customer.lastVisit && (
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>
                  Son: {format(new Date(customer.lastVisit), 'dd MMM yyyy', { locale: tr })}
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Notes */}
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

      {/* Appointments and Records */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CustomerAppointmentsList customerId={customer.id} />
        <CustomerRecordsList customerId={customer.id} />
      </div>
    </div>
  );
};

export default CustomerDetailView;
