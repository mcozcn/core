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
  // Toplam borç ve alacak hesaplama
  const totals = records.reduce((acc, record) => {
    if (record.recordType === 'debt') {
      acc.totalDebt += record.amount;
    } else {
      acc.totalCredit += Math.abs(record.amount);
    }
    return acc;
  }, { totalDebt: 0, totalCredit: 0 });

  const balance = totals.totalDebt - totals.totalCredit;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="p-4 bg-red-50 rounded-lg">
          <div className="text-sm text-red-600">Toplam Borç</div>
          <div className="text-lg font-semibold text-red-700">{formatCurrency(totals.totalDebt)}</div>
        </div>
        <div className="p-4 bg-green-50 rounded-lg">
          <div className="text-sm text-green-600">Toplam Alacak</div>
          <div className="text-lg font-semibold text-green-700">{formatCurrency(totals.totalCredit)}</div>
        </div>
        <div className={`p-4 ${balance > 0 ? 'bg-red-50' : 'bg-green-50'} rounded-lg`}>
          <div className={`text-sm ${balance > 0 ? 'text-red-600' : 'text-green-600'}`}>Bakiye</div>
          <div className={`text-lg font-semibold ${balance > 0 ? 'text-red-700' : 'text-green-700'}`}>
            {formatCurrency(Math.abs(balance))}
          </div>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tarih</TableHead>
            <TableHead>Tür</TableHead>
            <TableHead>Ürün/Hizmet</TableHead>
            <TableHead>Tutar</TableHead>
            <TableHead>Durum</TableHead>
            <TableHead>Vade Tarihi</TableHead>
            <TableHead>Açıklama</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {records.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-muted-foreground">
                Henüz kayıt bulunmamaktadır.
              </TableCell>
            </TableRow>
          ) : (
            records.map((record) => (
              <TableRow key={record.id}>
                <TableCell>{new Date(record.date).toLocaleDateString()}</TableCell>
                <TableCell>{record.type === 'service' ? 'Hizmet' : 'Ürün'}</TableCell>
                <TableCell>{record.itemName}</TableCell>
                <TableCell className={record.recordType === 'debt' ? 'text-red-600' : 'text-green-600'}>
                  {formatCurrency(Math.abs(record.amount))}
                </TableCell>
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
                <TableCell>{record.description || '-'}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default CustomerRecordsList;