
import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { type Sale } from "@/utils/storage/types";
import { formatCurrency } from '@/utils/format';

interface SalesTableProps {
  sales: Sale[];
}

const SalesTable = ({ sales }: SalesTableProps) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Ürün</TableHead>
          <TableHead>Miktar</TableHead>
          <TableHead>İndirim</TableHead>
          <TableHead>Toplam Fiyat</TableHead>
          <TableHead>Müşteri</TableHead>
          <TableHead>Telefon</TableHead>
          <TableHead>Tarih</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sales.length === 0 ? (
          <TableRow>
            <TableCell colSpan={7} className="text-center text-muted-foreground">
              Henüz satış kaydı bulunmamaktadır.
            </TableCell>
          </TableRow>
        ) : (
          sales.map((sale) => (
            <TableRow key={sale.id}>
              <TableCell>{sale.productName}</TableCell>
              <TableCell>{sale.quantity}</TableCell>
              <TableCell>{formatCurrency(sale.discount || 0)}</TableCell>
              <TableCell>{formatCurrency(sale.totalPrice || sale.total)}</TableCell>
              <TableCell>{sale.customerName}</TableCell>
              <TableCell>{sale.customerPhone}</TableCell>
              <TableCell>{new Date(sale.saleDate || sale.date).toLocaleDateString()}</TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
};

export default SalesTable;
