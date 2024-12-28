import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { type StockItem } from "@/utils/localStorage";

interface StockTableProps {
  filteredStock: StockItem[];
}

const StockTable = ({ filteredStock }: StockTableProps) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Ürün Adı</TableHead>
          <TableHead>Kategori</TableHead>
          <TableHead>Stok</TableHead>
          <TableHead>Fiyat</TableHead>
          <TableHead>Son Güncelleme</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {filteredStock.length === 0 ? (
          <TableRow>
            <TableCell colSpan={5} className="text-center text-muted-foreground">
              Stokta ürün bulunmamaktadır.
            </TableCell>
          </TableRow>
        ) : (
          filteredStock.map((item) => (
            <TableRow key={item.id}>
              <TableCell>{item.productName}</TableCell>
              <TableCell>{item.category}</TableCell>
              <TableCell>{item.quantity}</TableCell>
              <TableCell>{item.price} ₺</TableCell>
              <TableCell>{new Date(item.lastUpdated).toLocaleDateString()}</TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
};

export default StockTable;