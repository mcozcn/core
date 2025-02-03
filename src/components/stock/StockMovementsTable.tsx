import { useQuery } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { getStockMovements, getStock } from "@/utils/localStorage";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

const StockMovementsTable = () => {
  const { data: movements = [] } = useQuery({
    queryKey: ['stockMovements'],
    queryFn: getStockMovements,
  });

  const { data: stock = [] } = useQuery({
    queryKey: ['stock'],
    queryFn: getStock,
  });

  // En son hareketleri başta göster
  const sortedMovements = [...movements].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <Card className="p-4">
      <h2 className="text-xl font-semibold mb-4">Stok Hareketleri</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tarih</TableHead>
            <TableHead>Ürün</TableHead>
            <TableHead>Hareket</TableHead>
            <TableHead className="text-right">Miktar</TableHead>
            <TableHead className="text-right">Birim Maliyet</TableHead>
            <TableHead>Açıklama</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedMovements.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-muted-foreground">
                Henüz stok hareketi bulunmamaktadır.
              </TableCell>
            </TableRow>
          ) : (
            sortedMovements.map((movement) => {
              const product = stock.find(item => item.productId === movement.productId);
              return (
                <TableRow key={movement.id}>
                  <TableCell>
                    {format(new Date(movement.date), 'dd MMMM yyyy HH:mm', { locale: tr })}
                  </TableCell>
                  <TableCell>{product?.productName || 'Silinmiş ürün'}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded text-sm ${
                      movement.type === 'in' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {movement.type === 'in' ? 'Giriş' : 'Çıkış'}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">{movement.quantity}</TableCell>
                  <TableCell className="text-right">₺{movement.cost.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</TableCell>
                  <TableCell>{movement.description}</TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </Card>
  );
};

export default StockMovementsTable;