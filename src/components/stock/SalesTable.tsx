import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { type Sale } from "@/utils/localStorage";

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
          <TableHead>Toplam Fiyat</TableHead>
          <TableHead>Müşteri</TableHead>
          <TableHead>Telefon</TableHead>
          <TableHead>Tarih</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sales.length === 0 ? (
          <TableRow>
            <TableCell colSpan={6} className="text-center text-muted-foreground">
              Henüz satış kaydı bulunmamaktadır.
            </TableCell>
          </TableRow>
        ) : (
          sales.map((sale) => (
            <TableRow key={sale.id}>
              <TableCell>{sale.productName}</TableCell>
              <TableCell>{sale.quantity}</TableCell>
              <TableCell>{sale.totalPrice} ₺</TableCell>
              <TableCell>{sale.customerName}</TableCell>
              <TableCell>{sale.customerPhone}</TableCell>
              <TableCell>{new Date(sale.saleDate).toLocaleDateString()}</TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
};

export default SalesTable;