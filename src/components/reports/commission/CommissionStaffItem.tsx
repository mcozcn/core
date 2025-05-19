
import { formatCurrency } from "@/utils/format";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface CommissionStaffItemProps {
  staffData: {
    staffId: string;
    staffName: string;
    totalCommission: number;
    sales: Array<{
      date: string;
      customerName: string;
      itemName: string;
      amount: number;
      commissionAmount: number;
    }>;
  };
}

export const CommissionStaffItem = ({ staffData }: CommissionStaffItemProps) => {
  return (
    <div className="border rounded-lg">
      <div className="p-4 bg-accent/10 flex justify-between items-center border-b">
        <h4 className="font-medium">{staffData.staffName}</h4>
        <span className="font-bold">{formatCurrency(staffData.totalCommission)}</span>
      </div>
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tarih</TableHead>
            <TableHead>Müşteri</TableHead>
            <TableHead>Ürün/Hizmet</TableHead>
            <TableHead className="text-right">Tutar</TableHead>
            <TableHead className="text-right">Hakediş</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {staffData.sales.map((sale, index) => (
            <TableRow key={index}>
              <TableCell>{sale.date}</TableCell>
              <TableCell>{sale.customerName}</TableCell>
              <TableCell>{sale.itemName}</TableCell>
              <TableCell className="text-right">{formatCurrency(sale.amount)}</TableCell>
              <TableCell className="text-right">{formatCurrency(sale.commissionAmount)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
