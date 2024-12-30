import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CustomerRecord } from '@/utils/localStorage';
import { formatCurrency } from '@/utils/format';

interface CustomerRecordsListProps {
  records: CustomerRecord[];
}

const CustomerRecordsList = ({ records }: CustomerRecordsListProps) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Tarih</TableHead>
          <TableHead>Tür</TableHead>
          <TableHead>Ürün/Hizmet</TableHead>
          <TableHead>Tutar</TableHead>
          <TableHead>Durum</TableHead>
          <TableHead>Vade Tarihi</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {records.length === 0 ? (
          <TableRow>
            <TableCell colSpan={6} className="text-center text-muted-foreground">
              Henüz kayıt bulunmamaktadır.
            </TableCell>
          </TableRow>
        ) : (
          records.map((record) => (
            <TableRow key={record.id}>
              <TableCell>{new Date(record.date).toLocaleDateString()}</TableCell>
              <TableCell>{record.type === 'service' ? 'Hizmet' : 'Ürün'}</TableCell>
              <TableCell>{record.itemName}</TableCell>
              <TableCell>{formatCurrency(record.amount)}</TableCell>
              <TableCell>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  record.isPaid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {record.isPaid ? 'Ödendi' : 'Ödenmedi'}
                </span>
              </TableCell>
              <TableCell>
                {record.dueDate ? new Date(record.dueDate).toLocaleDateString() : '-'}
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
};

export default CustomerRecordsList;