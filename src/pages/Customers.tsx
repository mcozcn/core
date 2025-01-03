import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getCustomers, getCustomerRecords } from "@/utils/localStorage";
import SearchInput from '@/components/common/SearchInput';
import AddCustomerForm from '@/components/customers/AddCustomerForm';
import CustomerDetails from '@/components/customers/CustomerDetails';
import CustomerDebtForm from '@/components/customers/forms/CustomerDebtForm';
import CustomerPaymentForm from '@/components/customers/forms/CustomerPaymentForm';
import CustomerRecordsList from '@/components/customers/CustomerRecordsList';
import { cn } from "@/lib/utils";

const Customers = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);
  const queryClient = useQueryClient();

  const { data: customers = [] } = useQuery({
    queryKey: ['customers'],
    queryFn: getCustomers,
  });

  const { data: records = [] } = useQuery({
    queryKey: ['customerRecords'],
    queryFn: getCustomerRecords,
  });

  const selectedCustomer = customers.find(c => c.id === selectedCustomerId);

  return (
    <div className="p-8 pl-72 animate-fadeIn">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-4xl font-serif">Müşteri İşlemleri</h1>
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
                    onClick={() => setSelectedCustomerId(customer.id)}
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
          {selectedCustomer ? (
            <div className="space-y-6">
              <CustomerDetails 
                customerId={selectedCustomer.id}
                customerName={selectedCustomer.name}
              />

              <Tabs defaultValue="records" className="w-full">
                <TabsList>
                  <TabsTrigger value="records">Kayıtlar</TabsTrigger>
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
            <Card className="p-6">
              <AddCustomerForm onSuccess={() => queryClient.invalidateQueries({ queryKey: ['customers'] })} />
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Customers;