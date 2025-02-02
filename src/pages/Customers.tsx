import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getCustomers, getCustomerRecords, getAppointments } from "@/utils/localStorage";
import SearchInput from '@/components/common/SearchInput';
import AddCustomerForm from '@/components/customers/AddCustomerForm';
import CustomerDetails from '@/components/customers/CustomerDetails';
import CustomerDebtForm from '@/components/customers/forms/CustomerDebtForm';
import CustomerPaymentForm from '@/components/customers/forms/CustomerPaymentForm';
import CustomerRecordsList from '@/components/customers/CustomerRecordsList';
import CustomerAppointmentsList from '@/components/customers/CustomerAppointmentsList';
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";

const Customers = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const queryClient = useQueryClient();

  const { data: customers = [] } = useQuery({
    queryKey: ['customers'],
    queryFn: getCustomers,
  });

  const { data: records = [] } = useQuery({
    queryKey: ['customerRecords'],
    queryFn: getCustomerRecords,
  });

  const { data: appointments = [] } = useQuery({
    queryKey: ['appointments'],
    queryFn: getAppointments,
  });

  const selectedCustomer = customers.find(c => c.id === selectedCustomerId);

  return (
    <div className="p-8 pl-72 animate-fadeIn">
      <div className="mb-8 sticky top-0 z-10 bg-background pt-4 pb-4 flex items-center justify-between">
        <h1 className="text-4xl font-serif">Müşteri İşlemleri</h1>
        <Button onClick={() => setShowAddForm(true)}>
          <Plus className="mr-2 h-4 w-4" /> Yeni Müşteri
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card className="p-6">
            <div className="mb-4">
              <SearchInput
                value={searchTerm}
                onChange={setSearchTerm}
                placeholder="Müşteri ara..."
              />
            </div>
            <div className="space-y-2">
              {customers
                .filter(customer => 
                  customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  customer.phone.includes(searchTerm) ||
                  customer.email?.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .map((customer) => (
                  <div
                    key={customer.id}
                    onClick={() => {
                      setSelectedCustomerId(customer.id);
                      setShowAddForm(false);
                    }}
                    className={cn(
                      "p-3 rounded-lg cursor-pointer transition-colors",
                      selectedCustomerId === customer.id
                        ? "bg-primary text-primary-foreground"
                        : "bg-accent hover:bg-accent/80"
                    )}
                  >
                    <div className="font-medium">{customer.name}</div>
                    <div className="text-sm opacity-90">{customer.phone}</div>
                  </div>
                ))}
            </div>
          </Card>
        </div>

        <div className="lg:col-span-2">
          {showAddForm ? (
            <Card className="p-6">
              <AddCustomerForm onSuccess={() => {
                queryClient.invalidateQueries({ queryKey: ['customers'] });
                setShowAddForm(false);
              }} />
            </Card>
          ) : selectedCustomer ? (
            <div className="space-y-6">
              <CustomerDetails 
                customerId={selectedCustomer.id}
                customerName={selectedCustomer.name}
              />

              <Tabs defaultValue="records" className="w-full">
                <TabsList>
                  <TabsTrigger value="records">Kayıtlar</TabsTrigger>
                  <TabsTrigger value="appointments">Randevular</TabsTrigger>
                  <TabsTrigger value="debt">Borç Ekle</TabsTrigger>
                  <TabsTrigger value="payment">Ödeme Al</TabsTrigger>
                </TabsList>

                <TabsContent value="records">
                  <Card className="p-6">
                    <CustomerRecordsList 
                      records={records.filter(record => record.customerId === selectedCustomer.id)}
                    />
                  </Card>
                </TabsContent>

                <TabsContent value="appointments">
                  <Card className="p-6">
                    <CustomerAppointmentsList 
                      appointments={appointments.filter(apt => apt.customerId === selectedCustomer.id)}
                    />
                  </Card>
                </TabsContent>

                <TabsContent value="debt">
                  <Card className="p-6">
                    <CustomerDebtForm 
                      customerId={selectedCustomer.id}
                      onSuccess={() => queryClient.invalidateQueries({ queryKey: ['customerRecords'] })}
                    />
                  </Card>
                </TabsContent>

                <TabsContent value="payment">
                  <Card className="p-6">
                    <CustomerPaymentForm 
                      customerId={selectedCustomer.id}
                      onSuccess={() => queryClient.invalidateQueries({ queryKey: ['customerRecords'] })}
                    />
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-8">
              Lütfen bir müşteri seçin veya yeni müşteri ekleyin
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Customers;