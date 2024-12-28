import React, { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Users, UserPlus } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getCustomers, setCustomers, Customer } from '@/utils/localStorage';

const Customers = () => {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customers, setCustomersState] = useState<Customer[]>([]);
  const [showForm, setShowForm] = useState(false);
  const { toast } = useToast();

  // Local storage'dan müşterileri yükle
  useEffect(() => {
    const loadedCustomers = getCustomers();
    console.log('Loaded customers from localStorage:', loadedCustomers);
    setCustomersState(loadedCustomers);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const newCustomer: Customer = {
        id: Date.now(),
        name: customerName,
        phone: customerPhone,
        email: customerEmail,
        createdAt: new Date(),
      };
      
      const updatedCustomers = [...customers, newCustomer];
      setCustomers(updatedCustomers); // Local storage'a kaydet
      setCustomersState(updatedCustomers); // State'i güncelle
      
      console.log('Customer saved to localStorage:', newCustomer);
      
      toast({
        title: "Müşteri başarıyla kaydedildi",
        description: `${customerName} müşteri listenize eklendi.`,
      });

      // Form'u temizle
      setCustomerName('');
      setCustomerPhone('');
      setCustomerEmail('');
      setShowForm(false);
    } catch (error) {
      console.error('Error saving customer:', error);
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
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Users className="text-primary" size={32} />
          <h1 className="text-4xl font-serif">Müşteri Yönetimi</h1>
        </div>
        <Button onClick={() => setShowForm(true)} className="flex items-center gap-2">
          <UserPlus size={20} />
          Yeni Müşteri Ekle
        </Button>
      </div>

      {showForm && (
        <Card className="p-6 mb-8">
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

            <div className="flex gap-2">
              <Button 
                type="submit" 
                className="flex-1"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Kaydediliyor..." : "Müşteriyi Kaydet"}
              </Button>
              <Button 
                type="button" 
                variant="outline"
                onClick={() => setShowForm(false)}
              >
                İptal
              </Button>
            </div>
          </form>
        </Card>
      )}

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Müşteri Adı</TableHead>
              <TableHead>Telefon</TableHead>
              <TableHead>E-posta</TableHead>
              <TableHead>Kayıt Tarihi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
                  Henüz müşteri kaydı bulunmamaktadır.
                </TableCell>
              </TableRow>
            ) : (
              customers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell>{customer.name}</TableCell>
                  <TableCell>{customer.phone}</TableCell>
                  <TableCell>{customer.email}</TableCell>
                  <TableCell>
                    {new Date(customer.createdAt).toLocaleDateString('tr-TR')}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default Customers;