
import React, { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DialogFooter } from "@/components/ui/dialog";
import { addCustomerRecord, type CustomerRecord } from '@/utils/storage';
import { useQueryClient } from "@tanstack/react-query";

interface ServiceSaleFormProps {
  customerId: number;
  serviceName: string;
  servicePrice: number;
  onSuccess?: () => void;
}

const ServiceSaleForm = ({ customerId, serviceName, servicePrice, onSuccess }: ServiceSaleFormProps) => {
  const [price, setPrice] = useState(servicePrice.toString());
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const record: Omit<CustomerRecord, 'id' | 'createdAt'> = {
        customerId,
        type: 'service',
        itemId: Date.now(),
        itemName: serviceName,
        amount: parseFloat(price),
        date: new Date(),
        description: description || `${serviceName} hizmeti`,
        recordType: 'service',
      };

      await addCustomerRecord(record);
      
      queryClient.invalidateQueries({ queryKey: ['customerRecords'] });
      
      toast({
        title: "Hizmet satışı eklendi",
        description: "Hizmet satışı başarıyla kaydedildi.",
      });

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Hizmet satışı eklenirken hata:", error);
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Hizmet satışı eklenirken bir hata oluştu.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="serviceName">Hizmet Adı</Label>
        <Input
          id="serviceName"
          type="text"
          value={serviceName}
          disabled
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="price">Fiyat</Label>
        <Input
          id="price"
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="Fiyat girin"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Açıklama</Label>
        <Input
          id="description"
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Açıklama (opsiyonel)"
        />
      </div>

      <DialogFooter className="pt-4">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Kaydediliyor...' : 'Hizmet Satışı Kaydet'}
        </Button>
      </DialogFooter>
    </form>
  );
};

export default ServiceSaleForm;
