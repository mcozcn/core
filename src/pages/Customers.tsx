import React, { useState } from 'react';
import AddCustomerRecordForm from '@/components/customers/AddCustomerRecordForm';
import CustomerRecordsList from '@/components/customers/CustomerRecordsList';
import AddCustomerForm from '@/components/customers/AddCustomerForm';
import SearchInput from '@/components/common/SearchInput';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { getCustomers } from "@/utils/localStorage";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const Customers = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState<number>(1);

  const { data: customers = [] } = useQuery({
    queryKey: ['customers'],
    queryFn: getCustomers,
  });

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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <AddCustomerForm />
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Müşteri Listesi</h2>
              <div className="mb-4">
                <SearchInput
                  value={searchTerm}
                  onChange={setSearchTerm}
                  placeholder="Müşteri ara..."
                />
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Müşteri Adı</TableHead>
                    <TableHead>Telefon</TableHead>
                    <TableHead>E-posta</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customers
                    .filter(customer => 
                      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      customer.phone.includes(searchTerm) ||
                      customer.email?.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    .map((customer) => (
                      <TableRow key={customer.id}>
                        <TableCell>{customer.name}</TableCell>
                        <TableCell>{customer.phone}</TableCell>
                        <TableCell>{customer.email || '-'}</TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </Card>
          </div>
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