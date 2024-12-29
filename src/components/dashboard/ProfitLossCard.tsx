import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/utils/format";

interface ProfitLossCardProps {
  title: string;
  profit: number;
  sales: number;
  costs: number;
}

const ProfitLossCard = ({ title, profit, sales, costs }: ProfitLossCardProps) => {
  const isProfit = profit >= 0;

  return (
    <Card className="p-6">
      <h3 className="text-lg font-medium mb-4">{title}</h3>
      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-gray-500">Toplam Satış:</span>
          <span>{formatCurrency(sales)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Toplam Maliyet:</span>
          <span>{formatCurrency(costs)}</span>
        </div>
        <div className="flex justify-between font-semibold">
          <span>Kar/Zarar:</span>
          <span className={isProfit ? "text-green-600" : "text-red-600"}>
            {formatCurrency(profit)}
          </span>
        </div>
      </div>
    </Card>
  );
};

export default ProfitLossCard;