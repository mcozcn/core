
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
import { getStock, type StockItem } from "@/utils/localStorage";
import { AlertCircle, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";

interface StockTableProps {
  searchTerm?: string;
  onEditProduct?: (product: StockItem) => void;
}

const CRITICAL_STOCK_LEVEL = 5;

const StockTable = ({ searchTerm = '', onEditProduct }: StockTableProps) => {
  const { toast } = useToast();
  const { data: stock = [] } = useQuery({
    queryKey: ['stock'],
    queryFn: getStock,
  });

  const filteredProducts = stock.filter(product =>
    product.productName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Kritik stok seviyesindeki ürünler için uyarı göster
  React.useEffect(() => {
    const lowStockProducts = stock.filter(product => product.quantity <= CRITICAL_STOCK_LEVEL);
    if (lowStockProducts.length > 0) {
      toast({
        title: "Kritik Stok Uyarısı!",
        description: `${lowStockProducts.length} ürün kritik stok seviyesinde.`,
        variant: "destructive",
      });
    }
  }, [stock, toast]);

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
            <TableHead>İşlemler</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredProducts.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-muted-foreground">
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
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEditProduct?.(product)}
                    className="h-8 w-8"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </Card>
  );
};

export default StockTable;
