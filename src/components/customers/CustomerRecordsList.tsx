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
import { getCustomerRecords, type CustomerRecord } from '@/utils/localStorage';

interface CustomerRecordsListProps {
  searchTerm?: string;
  records?: CustomerRecord[];
}

const CustomerRecordsList = ({ searchTerm = '', records }: CustomerRecordsListProps) => {
  const { data: fetchedRecords = [] } = useQuery({
    queryKey: ['customerRecords'],
    queryFn: getCustomerRecords,
  });

  const recordsToUse = records || fetchedRecords;
  
  const filteredRecords = recordsToUse.filter(record =>
    record.itemName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getPaymentMethodText = (record: CustomerRecord) => {
    if (record.type !== 'payment' || !record.paymentMethod) return '-';
    return record.paymentMethod === 'cash' ? 'Nakit' : 'Kredi Kartı';
  };

  return (
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>İşlem</TableHead>
            <TableHead>Tutar</TableHead>
            <TableHead>Tür</TableHead>
            <TableHead>Ödeme Yöntemi</TableHead>
            <TableHead>Tarih</TableHead>
            <TableHead>Açıklama</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredRecords.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-muted-foreground">
                {searchTerm ? 'Arama sonucu bulunamadı.' : 'Henüz kayıt bulunmamaktadır.'}
              </TableCell>
            </TableRow>
          ) : (
            filteredRecords.map((record) => (
              <TableRow key={record.id}>
                <TableCell>{record.itemName}</TableCell>
                <TableCell>{record.amount} ₺</TableCell>
                <TableCell>{record.type}</TableCell>
                <TableCell>{getPaymentMethodText(record)}</TableCell>
                <TableCell>{new Date(record.date).toLocaleDateString('tr-TR')}</TableCell>
                <TableCell>{record.description || '-'}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </Card>
  );
};

export default CustomerRecordsList;