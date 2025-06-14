
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Edit, Trash2 } from 'lucide-react';
import { type Customer } from '@/utils/storage';
import EditCustomerForm from '../EditCustomerForm';

interface CustomerInfoHeaderProps {
  customer: Customer;
  isAdmin: boolean;
  onCustomerUpdated: () => void;
  onCustomerDeleted?: () => void;
}

const CustomerInfoHeader = ({ customer, isAdmin, onCustomerUpdated, onCustomerDeleted }: CustomerInfoHeaderProps) => {
  const [showEditDialog, setShowEditDialog] = useState(false);

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

  return (
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
  );
};

export default CustomerInfoHeader;
