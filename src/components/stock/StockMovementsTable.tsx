
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
import { format, isValid } from "date-fns";
import { tr } from "date-fns/locale";

interface StockMovementsTableProps {
  searchTerm?: string;
}

// Helper function to safely format dates
const safeFormatDate = (dateValue: any): string => {
  if (!dateValue) return '-';
  
  const date = dateValue instanceof Date ? dateValue : new Date(dateValue);
  
  if (!isValid(date)) {
    console.warn('Invalid date value:', dateValue);
    return '-';
  }
  
  return format(date, 'dd MMMM yyyy HH:mm', { locale: tr });
};

const StockMovementsTable = ({ searchTerm = '' }: StockMovementsTableProps) => {
  const { data: movements = [] } = useQuery({
    queryKey: ['stockMovements'],
    queryFn: getStockMovements,
  });

  const { data: stock = [] } = useQuery({
    queryKey: ['stock'],
    queryFn: getStock,
  });

  // Sort movements to show the most recent first
  const sortedMovements = movements ? 
    [...movements].sort((a, b) => {
      const dateA = a.date ? new Date(a.date) : new Date(0);
      const dateB = b.date ? new Date(b.date) : new Date(0);
      return dateB.getTime() - dateA.getTime();
    }) 
    : [];

  // Filter movements based on search term
  const filteredMovements = sortedMovements.filter(movement => {
    if (!movement) return false;
    
    const product = stock.find(item => item.productId === movement.productId);
    const productName = product?.productName || '';
    const description = movement.description || '';
    const type = movement.type === 'in' ? 'Giriş' : 'Çıkış';
    
    return (
      productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      type.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // Find previous movements for a product
  const getProductPreviousMovement = (productId: string | number, currentDate: Date) => {
    if (!movements) return null;
    
    const previousMovements = movements
      .filter(m => 
        m.productId === productId && 
        m.date && 
        isValid(new Date(m.date)) &&
        new Date(m.date) < currentDate
      )
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    return previousMovements[0];
  };

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
            <TableHead className="text-right">Yeni Birim Maliyet</TableHead>
            <TableHead className="text-right">Önceki Birim Maliyet</TableHead>
            <TableHead>Önceki İşlem Tarihi</TableHead>
            <TableHead>Açıklama</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {!filteredMovements || filteredMovements.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center text-muted-foreground">
                {searchTerm ? 'Arama sonucu bulunamadı.' : 'Henüz stok hareketi bulunmamaktadır.'}
              </TableCell>
            </TableRow>
          ) : (
            filteredMovements.map((movement) => {
              const product = stock.find(item => item.productId === movement.productId);
              const currentDate = movement.date ? new Date(movement.date) : new Date();
              const previousMovement = getProductPreviousMovement(movement.productId, currentDate);
              
              return (
                <TableRow key={movement.id}>
                  <TableCell>
                    {safeFormatDate(movement.date)}
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
                  <TableCell className="text-right">₺{movement.cost ? movement.cost.toLocaleString('tr-TR', { minimumFractionDigits: 2 }) : '0.00'}</TableCell>
                  <TableCell className="text-right">
                    {previousMovement && previousMovement.cost
                      ? `₺${previousMovement.cost.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}` 
                      : '-'}
                  </TableCell>
                  <TableCell>
                    {previousMovement ? safeFormatDate(previousMovement.date) : '-'}
                  </TableCell>
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
