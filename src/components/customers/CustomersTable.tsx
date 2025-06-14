
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { User, Edit } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import SearchInput from '@/components/common/SearchInput';
import { Customer, CustomerRecord } from '@/utils/storage';

interface CustomersTableProps {
  customers: Customer[];
  records: CustomerRecord[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  onSelectCustomer: (customerId: number) => void;
  onEditCustomer: (customerId: number) => void;
  isLoading: boolean;
}

const CustomersTable = ({ 
  customers, 
  records, 
  searchTerm, 
  setSearchTerm, 
  onSelectCustomer, 
  onEditCustomer,
  isLoading 
}: CustomersTableProps) => {
  const filteredCustomers = customers.filter(customer => 
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone.includes(searchTerm) ||
    customer.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalCustomers = customers.length;
  const activeCustomers = customers.filter(customer => {
    const customerRecords = records.filter(record => record.customerId === customer.id);
    return customerRecords.length > 0;
  }).length;

  const debtCustomers = customers.filter(customer => {
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
  }).length;

  return (
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
            Borçlu ({debtCustomers})
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
              {isLoading ? (
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
                      onClick={() => onSelectCustomer(customer.id)}
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
                              onSelectCustomer(customer.id);
                            }}
                          >
                            Detay
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              onEditCustomer(customer.id);
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
  );
};

export default CustomersTable;
