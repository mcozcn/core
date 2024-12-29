import { formatCurrency } from "@/utils/format";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Cost } from "@/utils/localStorage";

interface CostsTableProps {
  costs: Cost[];
}

const CostsTable = ({ costs }: CostsTableProps) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Tarih</TableHead>
          <TableHead>Açıklama</TableHead>
          <TableHead>Kategori</TableHead>
          <TableHead className="text-right">Tutar</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {costs.map((cost) => (
          <TableRow key={cost.id}>
            <TableCell>{new Date(cost.date).toLocaleDateString('tr-TR')}</TableCell>
            <TableCell>{cost.description}</TableCell>
            <TableCell>{cost.category}</TableCell>
            <TableCell className="text-right">{formatCurrency(cost.amount)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default CostsTable;