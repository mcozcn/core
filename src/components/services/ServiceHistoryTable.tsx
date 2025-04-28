
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
import { getServices } from "@/utils/localStorage";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

interface PriceHistory {
  id: number;
  serviceId: number;
  oldPrice: number;
  newPrice: number;
  date: Date;
}

const ServiceHistoryTable = () => {
  const { data: services = [] } = useQuery({
    queryKey: ['services'],
    queryFn: getServices,
  });

  // Fiyat değişikliklerini izle
  const priceHistory: PriceHistory[] = [];
  services.forEach(service => {
    const serviceId = service.id;
    const currentPrice = service.price;
    const date = service.createdAt;
    
    // Her servis için bir tarihçe kaydı oluştur
    priceHistory.push({
      id: serviceId,
      serviceId,
      oldPrice: currentPrice,
      newPrice: currentPrice,
      date: new Date(date),
    });
  });

  // Tarihe göre sırala
  const sortedHistory = priceHistory.sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <Card className="p-4">
      <h2 className="text-xl font-semibold mb-4">Hizmet Fiyat Geçmişi</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tarih</TableHead>
            <TableHead>Hizmet</TableHead>
            <TableHead className="text-right">Yeni Fiyat</TableHead>
            <TableHead className="text-right">Önceki Fiyat</TableHead>
            <TableHead>Son Güncelleme</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedHistory.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-muted-foreground">
                Henüz hizmet fiyat değişikliği kaydı bulunmamaktadır.
              </TableCell>
            </TableRow>
          ) : (
            sortedHistory.map((record) => {
              const service = services.find(s => s.id === record.serviceId);
              return (
                <TableRow key={`${record.id}-${record.date.getTime()}`}>
                  <TableCell>
                    {format(new Date(record.date), 'dd MMMM yyyy HH:mm', { locale: tr })}
                  </TableCell>
                  <TableCell>{service?.name || 'Silinmiş hizmet'}</TableCell>
                  <TableCell className="text-right">
                    ₺{record.newPrice.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell className="text-right">
                    ₺{record.oldPrice.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell>
                    {format(new Date(record.date), 'dd MMMM yyyy HH:mm', { locale: tr })}
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </Card>
  );
};

export default ServiceHistoryTable;
