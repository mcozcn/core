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
import { getProducts, type Product } from "@/utils/localStorage";

interface StockTableProps {
  searchTerm?: string;
}

const StockTable = ({ searchTerm = '' }: StockTableProps) => {
  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: getProducts,
  });

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Ürün Adı</TableHead>
            <TableHead>Stok Miktarı</TableHead>
            <TableHead>Birim Fiyatı</TableHead>
            <TableHead>Açıklama</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredProducts.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center text-muted-foreground">
                {searchTerm ? 'Arama sonucu bulunamadı.' : 'Henüz ürün kaydı bulunmamaktadır.'}
              </TableCell>
            </TableRow>
          ) : (
            filteredProducts.map((product) => (
              <TableRow key={product.id}>
                <TableCell>{product.name}</TableCell>
                <TableCell>{product.quantity}</TableCell>
                <TableCell>{product.price} ₺</TableCell>
                <TableCell>{product.description}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </Card>
  );
};

export default StockTable;