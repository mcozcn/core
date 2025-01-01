import React from 'react';
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useQuery } from "@tanstack/react-query";
import { getCustomerRecords } from "@/utils/localStorage";

interface CustomerRecordsListProps {
  searchTerm?: string;
}

const CustomerRecordsList = ({ searchTerm = '' }: CustomerRecordsListProps) => {
  const { data: records = [] } = useQuery({
    queryKey: ['customerRecords'],
    queryFn: getCustomerRecords,
  });

  const filteredRecords = records.filter(record =>
    record.customerName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Müşteri Adı</TableHead>
            <TableHead>Borç</TableHead>
            <TableHead>Tahsilat</TableHead>
            <TableHead>Tarih</TableHead>
            <TableHead>Not</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredRecords.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-muted-foreground">
                {searchTerm ? 'Arama sonucu bulunamadı.' : 'Henüz kayıt bulunmamaktadır.'}
              </TableCell>
            </TableRow>
          ) : (
            filteredRecords.map((record) => (
              <TableRow key={record.id}>
                <TableCell>{record.customerName}</TableCell>
                <TableCell>{record.debt} ₺</TableCell>
                <TableCell>{record.payment} ₺</TableCell>
                <TableCell>{new Date(record.date).toLocaleDateString('tr-TR')}</TableCell>
                <TableCell>{record.note}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </Card>
  );
};

export default CustomerRecordsList;