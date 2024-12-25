import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Users } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";

const Customers = () => {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // TODO: Backend entegrasyonu burada yapılacak
      // Şimdilik sadece simüle ediyoruz
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('Customer submitted:', { customerName, customerPhone, customerEmail });
      
      toast({
        title: "Müşteri başarıyla kaydedildi",
        description: `${customerName} müşteri listenize eklendi.`,
      });

      // Form'u temizle
      setCustomerName('');
      setCustomerPhone('');
      setCustomerEmail('');
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Hata!",
        description: "Müşteri kaydedilirken bir hata oluştu. Lütfen tekrar deneyin.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-8 pl-72 animate-fadeIn">
      <div className="mb-8 flex items-center space-x-4">
        <Users className="text-primary" size={32} />
        <h1 className="text-4xl font-serif">Müşteri Yönetimi</h1>
      </div>

      <Card className="p-6 max-w-xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Müşteri Adı</Label>
            <Input 
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Müşteri adını girin"
              required
            />
          </div>

          <div>
            <Label>Telefon Numarası</Label>
            <Input 
              type="tel"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              placeholder="Telefon numarasını girin"
              required
            />
          </div>

          <div>
            <Label>E-posta Adresi</Label>
            <Input 
              type="email"
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
              placeholder="E-posta adresini girin"
              required
            />
          </div>

          <Button 
            type="submit" 
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Kaydediliyor..." : "Müşteriyi Kaydet"}
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default Customers;