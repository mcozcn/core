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
import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";

interface StockTableProps {
  searchTerm?: string;
}

const CRITICAL_STOCK_LEVEL = 5; // Kritik stok seviyesi

const StockTable = ({ searchTerm = '' }: StockTableProps) => {
  const { toast } = useToast();
  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: getProducts,
  });

  const filteredProducts = products.filter(product =>
    product.productName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Kritik stok seviyesindeki ürünler için uyarı göster
  React.useEffect(() => {
    const lowStockProducts = products.filter(product => product.quantity <= CRITICAL_STOCK_LEVEL);
    if (lowStockProducts.length > 0) {
      toast({
        title: "Kritik Stok Uyarısı!",
        description: `${lowStockProducts.length} ürün kritik stok seviyesinde.`,
        variant: "destructive",
      });
    }
  }, [products, toast]);

  return (
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Ürün Adı</TableHead>
            <TableHead>Stok Miktarı</TableHead>
            <TableHead>Birim Fiyatı</TableHead>
            <TableHead>Kategori</TableHead>
            <TableHead>Son Güncelleme</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredProducts.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-muted-foreground">
                {searchTerm ? 'Arama sonucu bulunamadı.' : 'Henüz ürün kaydı bulunmamaktadır.'}
              </TableCell>
            </TableRow>
          ) : (
            filteredProducts.map((product) => (
              <TableRow key={product.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    {product.productName}
                    {product.quantity <= CRITICAL_STOCK_LEVEL && (
                      <AlertCircle className="h-4 w-4 text-destructive" />
                    )}
                  </div>
                </TableCell>
                <TableCell className={cn(
                  product.quantity <= CRITICAL_STOCK_LEVEL && "text-destructive font-medium"
                )}>
                  {product.quantity}
                </TableCell>
                <TableCell>{product.price} ₺</TableCell>
                <TableCell>{product.category}</TableCell>
                <TableCell>{new Date(product.lastUpdated).toLocaleDateString()}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </Card>
  );
};

export default StockTable;