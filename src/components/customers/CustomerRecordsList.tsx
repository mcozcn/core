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
import { formatCurrency } from '@/utils/format';

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
  
  const filteredRecords = recordsToUse
    .filter(record =>
      record.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.description?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const getPaymentMethodText = (record: CustomerRecord) => {
    if (record.type !== 'payment' || !record.paymentMethod) return '-';
    return record.paymentMethod === 'cash' ? 'Nakit' : 'Kredi Kartı';
  };

  const getRecordTypeText = (record: CustomerRecord) => {
    switch (record.type) {
      case 'payment':
        return 'Ödeme';
      case 'service':
        return 'Hizmet';
      case 'product':
        return 'Ürün';
      default:
        return record.type;
    }
  };

  const getAmountClass = (record: CustomerRecord) => {
    if (record.type === 'payment') {
      return 'text-green-600 font-medium';
    }
    return 'text-red-600 font-medium';
  };

  console.log('CustomerRecordsList:', {
    recordsCount: recordsToUse.length,
    filteredCount: filteredRecords.length,
    searchTerm
  });

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
                <TableCell className={getAmountClass(record)}>
                  {formatCurrency(record.amount)}
                </TableCell>
                <TableCell>{getRecordTypeText(record)}</TableCell>
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