
import { formatCurrency } from "@/utils/format";
import { DateRange } from "react-day-picker";
import { format } from "date-fns";

interface CommissionSummaryProps {
  totalCommissionAmount: number;
  date: DateRange | undefined;
}

export const CommissionSummary = ({ totalCommissionAmount, date }: CommissionSummaryProps) => {
  const formatDate = (date: Date) => {
    return format(date, 'dd/MM/yyyy');
  };

  return (
    <div className="mb-6 p-4 bg-accent/20 rounded-lg">
      <div className="flex justify-between">
        <span>Toplam Hakediş Tutarı:</span>
        <span className="font-bold">{formatCurrency(totalCommissionAmount)}</span>
      </div>
      {date?.from && (
        <div className="text-sm text-muted-foreground mt-2">
          {formatDate(date.from)} - {date.to ? formatDate(date.to) : formatDate(date.from)}
        </div>
      )}
    </div>
  );
};
