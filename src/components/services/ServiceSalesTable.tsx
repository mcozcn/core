import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { type ServiceSale } from "@/utils/localStorage";
import { formatCurrency } from '@/utils/format';

interface ServiceSalesTableProps {
  sales: ServiceSale[];
}

const ServiceSalesTable = ({ sales }: ServiceSalesTableProps) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Hizmet</TableHead>
          <TableHead>Fiyat</TableHead>
          <TableHead>Müşteri</TableHead>
          <TableHead>Telefon</TableHead>
          <TableHead>Tarih</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sales.length === 0 ? (
          <TableRow>
            <TableCell colSpan={5} className="text-center text-muted-foreground">
              Henüz hizmet satışı kaydı bulunmamaktadır.
            </TableCell>
          </TableRow>
        ) : (
          sales.map((sale) => (
            <TableRow key={sale.id}>
              <TableCell>{sale.serviceName}</TableCell>
              <TableCell>{formatCurrency(sale.price)}</TableCell>
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

export default ServiceSalesTable;