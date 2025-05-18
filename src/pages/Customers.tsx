
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getCustomers, getCustomerRecords, getAppointments, type Appointment } from "@/utils/storage";
import SearchInput from '@/components/common/SearchInput';
import CustomerDetails from '@/components/customers/CustomerDetails';
import CustomerDebtForm from '@/components/customers/forms/CustomerDebtForm';
import CustomerPaymentForm from '@/components/customers/forms/CustomerPaymentForm';
import CustomerRecordsList from '@/components/customers/CustomerRecordsList';
import CustomerAppointmentsList from '@/components/customers/CustomerAppointmentsList';
import { cn } from "@/lib/utils";
import { Plus, Edit, User, Download, FileText } from "lucide-react";
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
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
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
          <div className="flex gap-2 border rounded-md">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              className="rounded-r-none"
              onClick={() => setViewMode('grid')}
            >
              Grid Görünümü
            </Button>
            <Button
              variant={viewMode === 'table' ? 'default' : 'ghost'}
              size="sm"
              className="rounded-l-none"
              onClick={() => setViewMode('table')}
            >
              Tablo Görünümü
            </Button>
          </div>
          <Button onClick={() => setShowAddDialog(true)}>
            <Plus className="mr-2 h-4 w-4" /> Yeni Müşteri
          </Button>
        </div>
      </div>

      {viewMode === 'grid' ? (
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
              <div className="space-y-2 max-h-[70vh] overflow-y-auto pr-2">
                {isLoadingCustomers ? (
                  <div className="text-center py-8">Müşteriler yükleniyor...</div>
                ) : filteredCustomers.length > 0 ? (
                  filteredCustomers.map((customer) => (
                    <div
                      key={customer.id}
                      className="relative"
                    >
                      <div
                        onClick={() => {
                          setSelectedCustomerId(customer.id);
                        }}
                        className={cn(
                          "p-3 rounded-lg cursor-pointer transition-colors pr-10",
                          selectedCustomerId === customer.id
                            ? "bg-primary text-primary-foreground"
                            : "bg-accent hover:bg-accent/80"
                        )}
                      >
                        <div className="font-medium">{customer.name}</div>
                        <div className="text-sm opacity-90">{customer.phone}</div>
                        {customer.email && <div className="text-xs opacity-70">{customer.email}</div>}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className={cn(
                          "absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8",
                          selectedCustomerId === customer.id ? "text-primary-foreground" : "text-muted-foreground"
                        )}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedCustomerId(customer.id);
                          setShowEditDialog(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    Müşteri bulunamadı
                  </div>
                )}
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
                  <TabsList className="grid grid-cols-4 w-full">
                    <TabsTrigger value="records">Kayıtlar</TabsTrigger>
                    <TabsTrigger value="appointments">Randevular</TabsTrigger>
                    <TabsTrigger value="debt">Borç Ekle</TabsTrigger>
                    <TabsTrigger value="payment">Ödeme Al</TabsTrigger>
                  </TabsList>

                  <TabsContent value="records">
                    <Card className="p-6">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-medium">Müşteri Kayıtları</h3>
                        <Button variant="outline" size="sm">
                          <FileText className="h-4 w-4 mr-2" />
                          Rapor Al
                        </Button>
                      </div>
                      <CustomerRecordsList 
                        records={records.filter(record => record.customerId === selectedCustomer.id)}
                      />
                    </Card>
                  </TabsContent>

                  <TabsContent value="appointments">
                    <Card className="p-6">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-medium">Randevu Geçmişi</h3>
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-2" />
                          İndir
                        </Button>
                      </div>
                      <CustomerAppointmentsList 
                        appointments={appointments
                          .filter(apt => apt.customerId === selectedCustomer.id)
                          .map((apt): Appointment => ({
                            ...apt,
                            service: apt.service || ''
                          }))}
                        customerPhone={selectedCustomer.phone}
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
              <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground py-16">
                <User className="h-12 w-12 mb-4 text-muted-foreground/50" />
                <p>Lütfen bir müşteri seçin veya yeni müşteri ekleyin</p>
              </div>
            )}
          </div>
        </div>
      ) : (
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
                      <TableRow key={customer.id}>
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
                              onClick={() => {
                                setSelectedCustomerId(customer.id);
                                setViewMode('grid');
                              }}
                            >
                              Detay
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => {
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
