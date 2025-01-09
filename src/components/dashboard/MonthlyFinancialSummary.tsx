import { formatCurrency } from "@/utils/format";
import { Card } from "@/components/ui/card";
import { CustomerRecord, Cost } from '@/utils/localStorage';

interface MonthlyFinancialSummaryProps {
  customerRecords: CustomerRecord[];
  costs: Cost[];
}

const MonthlyFinancialSummary = ({ customerRecords, costs }: MonthlyFinancialSummaryProps) => {
  // Toplam tahsilat hesaplama (ödemeler)
  const totalPayments = customerRecords
    .filter(r => r.type === 'payment')
    .reduce((sum, r) => sum + Math.abs(r.amount), 0);

  // Toplam masraf hesaplama
  const totalCosts = costs.reduce((sum, c) => sum + c.amount, 0);

  // Toplam borç hesaplama (ürün ve hizmet satışları)
  const totalDebts = customerRecords
    .filter(r => r.type === 'service' || r.type === 'product')
    .reduce((sum, r) => sum + r.amount, 0);

  console.log('MonthlyFinancialSummary calculations:', {
    totalPayments,
    totalCosts,
    totalDebts,
    recordsCount: customerRecords.length,
    costsCount: costs.length
  });

  return (
    <Card className="p-6">
      <h2 className="text-xl font-serif mb-4">Finansal Özet</h2>
      <div className="grid gap-4 md:grid-cols-4">
        <div className="flex flex-col p-4 bg-green-50 rounded-lg">
          <span className="text-sm text-green-600 mb-1">Toplam Tahsilat</span>
          <span className="text-2xl font-semibold text-green-700">{formatCurrency(totalPayments)}</span>
        </div>
        
        <div className="flex flex-col p-4 bg-red-50 rounded-lg">
          <span className="text-sm text-red-600 mb-1">Toplam Gider</span>
          <span className="text-2xl font-semibold text-red-700">{formatCurrency(totalCosts)}</span>
        </div>

        <div className="flex flex-col p-4 bg-orange-50 rounded-lg">
          <span className="text-sm text-orange-600 mb-1">Toplam Borç</span>
          <span className="text-2xl font-semibold text-orange-700">{formatCurrency(totalDebts)}</span>
        </div>
        
        <div className="flex flex-col p-4 bg-blue-50 rounded-lg">
          <span className="text-sm text-blue-600 mb-1">Net Durum</span>
          <span className={`text-2xl font-semibold ${
            totalPayments - totalCosts >= 0 ? 'text-green-700' : 'text-red-700'
          }`}>
            {formatCurrency(totalPayments - totalCosts)}
          </span>
        </div>
      </div>
    </Card>
  );
};

export default MonthlyFinancialSummary;