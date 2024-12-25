import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Users } from 'lucide-react';

const Customers = () => {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement customer save logic
    console.log('Customer submitted:', { customerName, customerPhone, customerEmail });
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

          <Button type="submit" className="w-full">
            Müşteriyi Kaydet
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default Customers;