import React, { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getCustomers, setCustomers, type Customer } from '@/utils/storage';
import { useIsMobile } from '@/hooks/use-mobile';

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
  const isMobile = useIsMobile();

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
      const customers = await getCustomers();
      
      const updatedCustomer: Customer = {
        ...customer,
        name,
        phone,
        email,
      };

      // Müşteri ID'ye göre karşılaştırma yapılıyor
      const updatedCustomers = customers.map(c => 
        c.id === customer.id ? updatedCustomer : c
      );

      await setCustomers(updatedCustomers);

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
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent 
        side={isMobile ? "bottom" : "right"} 
        className={isMobile ? "h-[90vh]" : "w-full sm:max-w-[540px]"}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <SheetHeader>
          <SheetTitle>Müşteri Düzenle</SheetTitle>
          <SheetDescription>
            Müşteri bilgilerini düzenlemek için aşağıdaki alanları kullanın.
          </SheetDescription>
        </SheetHeader>
        
        <ScrollArea className="h-[calc(100vh-8rem)] mt-4 pr-4">
          <form onSubmit={handleSubmit} className="space-y-4 pb-6">
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

            <div className="pt-4 flex gap-2 sticky bottom-0 bg-background border-t">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
                className="flex-1"
              >
                İptal
              </Button>
              <Button type="submit" disabled={isSubmitting} className="flex-1">
                {isSubmitting ? 'Güncelleniyor...' : 'Güncelle'}
              </Button>
            </div>
          </form>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};

export default EditCustomerForm;
