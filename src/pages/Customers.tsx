import React, { useState } from 'react';
import AddCustomerRecordForm from '@/components/customers/AddCustomerRecordForm';
import CustomerRecordsList from '@/components/customers/CustomerRecordsList';
import AddCustomerForm from '@/components/customers/AddCustomerForm';
import SearchInput from '@/components/common/SearchInput';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";

const Customers = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState<number>(1); // Default to 1 for now

  return (
    <div className="p-8 pl-72 animate-fadeIn">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-4xl font-serif">Müşteri İşlemleri</h1>
      </div>

      <Tabs defaultValue="add-customer" className="space-y-6">
        <TabsList>
          <TabsTrigger value="add-customer">Müşteri Ekle</TabsTrigger>
          <TabsTrigger value="customer-records">Müşteri Kayıtları</TabsTrigger>
        </TabsList>

        <TabsContent value="add-customer">
          <AddCustomerForm />
        </TabsContent>

        <TabsContent value="customer-records">
          <div className="space-y-6">
            <SearchInput
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Kayıtlarda ara..."
            />
            <AddCustomerRecordForm customerId={selectedCustomerId} />
            <CustomerRecordsList searchTerm={searchTerm} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Customers;