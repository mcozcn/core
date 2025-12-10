import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getCustomers, getCustomerRecords, getAppointments, setCustomers } from '@/utils/storage';
import SearchInput from '@/components/common/SearchInput';
import CustomerDetailView from '@/components/customers/CustomerDetailView';
import { Edit, Plus, User, Users, Calendar, DollarSign, TrendingUp, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

const Customers = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Admin kontrolü - artık herkes admin yetkisine sahip
  const isAdmin = true;

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

  const handleDeleteCustomer = async (customerId: number) => {
    try {
      const updatedCustomers = customers.filter(c => c.id !== customerId);
      await setCustomers(updatedCustomers);
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      
      // Eğer silinen müşteri seçili ise, seçimi temizle
      if (selectedCustomerId === customerId) {
        setSelectedCustomerId(null);
      }

      toast({
        title: "Müşteri silindi",
        description: "Müşteri başarıyla silindi.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Müşteri silinirken bir hata oluştu.",
      });
    }
  };

  // Calculate stats
  const totalCustomers = customers.length;
  const activeCustomers = customers.filter(customer => {
    const customerRecords = records.filter(record => record.customerId === customer.id);
    return customerRecords.length > 0;
  }).length;
  
  const totalRevenue = records
    .filter(record => record.type !== 'payment')
    .reduce((sum, record) => sum + record.amount, 0);

  const totalDebt = Math.max(0, 
    records.reduce((acc, record) => 
      record.type !== 'payment' ? acc + record.amount : acc, 0
    ) - 
    records.reduce((acc, record) => 
      record.type === 'payment' ? acc + Math.abs(record.amount) : acc, 0
    )
  );

  return (
    <div className="p-4 md:p-6 md:pl-72 animate-fadeIn space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 md:gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-serif">Müşteri Yönetimi</h1>
          <p className="text-sm md:text-base text-muted-foreground mt-1">Müşterilerinizi yönetin</p>
        </div>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 gap-2 w-full sm:w-auto">
              <Plus className="h-4 w-4" />
              Yeni Müşteri
            </Button>
          </DialogTrigger>
          <DialogContent 
            className="max-w-4xl max-h-[90vh] overflow-hidden p-0"
            onInteractOutside={(e) => e.preventDefault()}
            onEscapeKeyDown={(e) => e.preventDefault()}
          >
            <DialogHeader className="p-6 pb-4">
              <DialogTitle className="text-2xl">Yeni Müşteri Ekle</DialogTitle>
            </DialogHeader>
            <ScrollArea className="max-h-[calc(90vh-100px)] px-6 pb-6">
              <AddCustomerForm onSuccess={handleAddSuccess} />
            </ScrollArea>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200">
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="p-1.5 md:p-2 bg-blue-500 rounded-lg">
                <Users className="h-3.5 w-3.5 md:h-4 md:w-4 text-white" />
              </div>
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">Toplam</p>
                <p className="text-lg md:text-2xl font-bold text-blue-600">{totalCustomers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200">
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="p-1.5 md:p-2 bg-green-500 rounded-lg">
                <TrendingUp className="h-3.5 w-3.5 md:h-4 md:w-4 text-white" />
              </div>
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">Aktif</p>
                <p className="text-lg md:text-2xl font-bold text-green-600">{activeCustomers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200">
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="p-1.5 md:p-2 bg-purple-500 rounded-lg">
                <DollarSign className="h-3.5 w-3.5 md:h-4 md:w-4 text-white" />
              </div>
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">Gelir</p>
                <p className="text-lg md:text-2xl font-bold text-purple-600">₺{totalRevenue.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-orange-200">
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="p-1.5 md:p-2 bg-orange-500 rounded-lg">
                <Calendar className="h-3.5 w-3.5 md:h-4 md:w-4 text-white" />
              </div>
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">Borç</p>
                <p className="text-lg md:text-2xl font-bold text-orange-600">₺{totalDebt.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {selectedCustomer ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <Button 
              variant="outline" 
              onClick={() => setSelectedCustomerId(null)}
              className="gap-2"
            >
              ← Müşteri Listesi
            </Button>
            {isAdmin && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm" className="gap-2">
                    <Trash2 className="h-4 w-4" />
                    Müşteriyi Sil
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Müşteriyi Sil</AlertDialogTitle>
                    <AlertDialogDescription>
                      Bu işlem geri alınamaz. "{selectedCustomer.name}" adlı müşteriyi kalıcı olarak silmek istediğinizden emin misiniz?
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>İptal</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={() => handleDeleteCustomer(selectedCustomer.id)}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Sil
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
          <CustomerDetailView 
            customer={selectedCustomer}
            onEdit={() => setShowEditDialog(true)}
          />
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Müşteri Listesi
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Search Section */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <SearchInput
                  value={searchTerm}
                  onChange={setSearchTerm}
                  placeholder="Müşteri adı, telefon veya e-posta ile ara..."
                />
              </div>
            </div>

            {/* Quick Filters */}
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="cursor-pointer hover:bg-accent">
                Tümü ({totalCustomers})
              </Badge>
              <Badge variant="outline" className="cursor-pointer hover:bg-accent text-green-600">
                Aktif ({activeCustomers})
              </Badge>
              <Badge variant="outline" className="cursor-pointer hover:bg-accent text-orange-600">
                Borçlu ({customers.filter(customer => {
                  const customerRecords = records.filter(record => record.customerId === customer.id);
                  const debt = Math.max(0, 
                    customerRecords.reduce((acc, record) => 
                      record.type !== 'payment' ? acc + record.amount : acc, 0
                    ) - 
                    customerRecords.reduce((acc, record) => 
                      record.type === 'payment' ? acc + Math.abs(record.amount) : acc, 0
                    )
                  );
                  return debt > 0;
                }).length})
              </Badge>
            </div>

            {/* Customer Table */}
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Müşteri Adı</TableHead>
                    <TableHead>Telefon</TableHead>
                    <TableHead>E-posta</TableHead>
                    <TableHead>Son İşlem</TableHead>
                    <TableHead>Durum</TableHead>
                    <TableHead>İşlemler</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoadingCustomers ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center h-32">Müşteriler yükleniyor...</TableCell>
                    </TableRow>
                  ) : filteredCustomers.length > 0 ? (
                    filteredCustomers.map((customer) => {
                      // Son işlem tarihini bul
                      const customerRecords = records.filter(record => record.customerId === customer.id);
                      const lastRecord = customerRecords.length > 0 
                        ? customerRecords.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]
                        : null;
                      
                      const debt = Math.max(0, 
                        customerRecords.reduce((acc, record) => 
                          record.type !== 'payment' ? acc + record.amount : acc, 0
                        ) - 
                        customerRecords.reduce((acc, record) => 
                          record.type === 'payment' ? acc + Math.abs(record.amount) : acc, 0
                        )
                      );
                      
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
                            {debt > 0 ? (
                              <Badge variant="destructive">Borçlu (₺{debt.toLocaleString()})</Badge>
                            ) : customerRecords.length > 0 ? (
                              <Badge variant="default" className="bg-green-500">Aktif</Badge>
                            ) : (
                              <Badge variant="outline">Yeni</Badge>
                            )}
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
                              {isAdmin && (
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button 
                                      variant="ghost" 
                                      size="sm"
                                      onClick={(e) => e.stopPropagation()}
                                      className="text-destructive hover:text-destructive"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Müşteriyi Sil</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Bu işlem geri alınamaz. "{customer.name}" adlı müşteriyi kalıcı olarak silmek istediğinizden emin misiniz?
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>İptal</AlertDialogCancel>
                                      <AlertDialogAction 
                                        onClick={() => handleDeleteCustomer(customer.id)}
                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                      >
                                        Sil
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center h-32">
                        {searchTerm ? 'Arama sonucu bulunamadı' : 'Henüz müşteri eklenmemiş'}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Edit Customer Sheet */}
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
