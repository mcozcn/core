
import React, { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { updateCustomer, type Customer } from '@/utils/storage/customers';

interface EditCustomerFormProps {
  customer: Customer;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const EditCustomerForm = ({ customer, onSuccess, onCancel }: EditCustomerFormProps) => {
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
      const success = await updateCustomer(customer.id, {
        name,
        phone,
        email,
      });

      if (success) {
        toast({
          title: "Müşteri güncellendi",
          description: "Müşteri bilgileri başarıyla güncellendi.",
        });

        if (onSuccess) {
          onSuccess();
        }
      } else {
        toast({
          variant: "destructive",
          title: "Hata",
          description: "Müşteri güncellenirken bir hata oluştu.",
        });
      }
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
    <>
      <DialogHeader>
        <DialogTitle>Müşteri Düzenle</DialogTitle>
        <DialogDescription>
          Müşteri bilgilerini düzenlemek için aşağıdaki alanları kullanın.
        </DialogDescription>
      </DialogHeader>
      
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

        <DialogFooter className="pt-4">
          {onCancel && (
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel}
              disabled={isSubmitting}
            >
              İptal
            </Button>
          )}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Güncelleniyor...' : 'Güncelle'}
          </Button>
        </DialogFooter>
      </form>
    </>
  );
};

export default EditCustomerForm;
