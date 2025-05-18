
import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getCustomers, getCustomerRecords, getAppointments } from '@/utils/storage';
import SearchInput from '@/components/common/SearchInput';
import CustomerDetailView from '@/components/customers/CustomerDetailView';
import { Edit, Plus, User } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import AddCustomerForm from '@/components/customers/AddCustomerForm';
import EditCustomerForm from '@/components/customers/EditCustomerForm';
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
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const queryClient = useQueryClient();

  const { data: customers = [], isLoading: isLoadingCustomers } = useQuery({
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

  const filteredCustomers = customers.filter(customer => 
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone.includes(searchTerm) ||
    customer.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['customers'] });
    setShowAddDialog(false);
  };

  const handleEditSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['customers'] });
    setShowEditDialog(false);
  };

  return (
    <div className="p-8 pl-72 animate-fadeIn">
      <div className="mb-8 sticky top-0 z-10 bg-background pt-4 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-4xl font-serif">Müşteri İşlemleri</h1>
        <div className="flex gap-2">
          <Button onClick={() => setShowAddDialog(true)}>
            <Plus className="mr-2 h-4 w-4" /> Yeni Müşteri
          </Button>
        </div>
      </div>

      {selectedCustomer ? (
        <div className="space-y-6 mb-6">
          <div className="flex items-center justify-between">
            <Button 
              variant="outline" 
              onClick={() => setSelectedCustomerId(null)}
              className="mb-4"
            >
              ← Müşteri Listesine Dön
            </Button>
          </div>
          <CustomerDetailView 
            customer={selectedCustomer}
            onEdit={() => setShowEditDialog(true)}
          />
        </div>
      ) : (
        <div className="space-y-4">
          <Card className="p-6">
            <div className="mb-4">
              <SearchInput
                value={searchTerm}
                onChange={setSearchTerm}
                placeholder="Müşteri ara..."
              />
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Müşteri Adı</TableHead>
                    <TableHead>Telefon</TableHead>
                    <TableHead>E-posta</TableHead>
                    <TableHead>Son İşlem</TableHead>
                    <TableHead>İşlemler</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoadingCustomers ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center h-32">Müşteriler yükleniyor...</TableCell>
                    </TableRow>
                  ) : filteredCustomers.length > 0 ? (
                    filteredCustomers.map((customer) => {
                      // Son işlem tarihini bul
                      const customerRecords = records.filter(record => record.customerId === customer.id);
                      const lastRecord = customerRecords.length > 0 
                        ? customerRecords.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]
                        : null;
                      
                      return (
                        <TableRow 
                          key={customer.id}
                          className="cursor-pointer hover:bg-accent/50"
                          onClick={() => setSelectedCustomerId(customer.id)}
                        >
                          <TableCell className="font-medium">{customer.name}</TableCell>
                          <TableCell>{customer.phone}</TableCell>
                          <TableCell>{customer.email || "-"}</TableCell>
                          <TableCell>
                            {lastRecord 
                              ? new Date(lastRecord.date).toLocaleDateString('tr-TR') 
                              : "İşlem yok"}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedCustomerId(customer.id);
                                }}
                              >
                                Detay
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedCustomerId(customer.id);
                                  setShowEditDialog(true);
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center h-32">Müşteri bulunamadı</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>
        </div>
      )}

      {/* Add Customer Modal Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Yeni Müşteri Ekle</DialogTitle>
          </DialogHeader>
          <AddCustomerForm onSuccess={handleAddSuccess} />
        </DialogContent>
      </Dialog>

      {/* Edit Customer Modal Dialog */}
      {selectedCustomer && (
        <EditCustomerForm
          customer={selectedCustomer}
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
          onSuccess={handleEditSuccess}
        />
      )}
    </div>
  );
};

export default Customers;
