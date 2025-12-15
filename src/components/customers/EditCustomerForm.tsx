import React, { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getCustomers, setCustomers, type Customer } from '@/utils/storage';

interface EditCustomerFormProps {
  customer: Customer;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const EditCustomerForm = ({ customer, open, onOpenChange, onSuccess }: EditCustomerFormProps) => {
  const [name, setName] = useState(customer.name);
  const [phone, setPhone] = useState(customer.phone);
  const [email, setEmail] = useState(customer.email || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Update form state when customer prop changes
  useEffect(() => {
    if (customer) {
      setName(customer.name);
      setPhone(customer.phone);
      setEmail(customer.email || '');
    }
  }, [customer]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { updateCustomer } = await import('@/utils/storage/customers');

      const updatedCustomer: Partial<Customer> = {
        name,
        phone,
        email,
      };

      const ok = await updateCustomer(customer.id, updatedCustomer as any);
      if (!ok) throw new Error('Update failed');

      toast({
        title: "Müşteri güncellendi",
        description: "Müşteri bilgileri başarıyla güncellendi.",
      });

      if (onSuccess) {
        onSuccess();
      }
      
      onOpenChange(false);
    } catch (error) {
      console.error("Müşteri güncellenirken hata:", error);
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Müşteri güncellenirken bir hata oluştu.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden p-0">
        <DialogHeader className="p-6 pb-4">
          <DialogTitle className="text-2xl">Müşteri Düzenle</DialogTitle>
          <DialogDescription>
            Müşteri bilgilerini düzenlemek için aşağıdaki alanları kullanın.
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="max-h-[calc(90vh-140px)] px-6 pb-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Müşteri Adı</Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Müşteri adını girin"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Telefon</Label>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Telefon numarasını girin"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">E-posta</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="E-posta adresini girin"
              />
            </div>

            <Button type="submit" className="w-full h-11" disabled={isSubmitting}>
              {isSubmitting ? 'Güncelleniyor...' : 'Güncelle'}
            </Button>
          </form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default EditCustomerForm;
