import React from 'react';
import { Card } from "@/components/ui/card";
import { Payment, CustomerRecord, Cost } from '@/utils/localStorage';
import { formatCurrency } from '@/utils/format';

interface MonthlyFinancialSummaryProps {
  payments: Payment[];
  customerRecords: CustomerRecord[];
  costs: Cost[];
}

const MonthlyFinancialSummary = ({ payments, customerRecords, costs }: MonthlyFinancialSummaryProps) => {
  console.log('MonthlyFinancialSummary received data:', { payments, customerRecords, costs });

  // Toplam gelir hesaplama (ödemeler ve müşteri ödemeleri)
  const totalCredit = customerRecords
    .filter(r => r.recordType === 'payment' || (r.recordType === 'debt' && r.isPaid))
    .reduce((sum, r) => sum + Math.abs(r.amount), 0);

  // Toplam gider hesaplama
  const totalDebit = costs.reduce((sum, c) => sum + c.amount, 0);

  console.log('Calculated totals:', { totalCredit, totalDebit });

  return (
    <Card className="p-6">
      <h2 className="text-xl font-serif mb-4">Finansal Özet</h2>
      <div className="space-y-4">
        <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
          <span className="font-medium">Toplam Tahsilat</span>
          <span className="text-green-600 font-semibold">{formatCurrency(totalCredit)}</span>
        </div>
        <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
          <span className="font-medium">Toplam Gider</span>
          <span className="text-red-600 font-semibold">{formatCurrency(totalDebit)}</span>
        </div>
        <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
          <span className="font-medium">Net Durum</span>
          <span className={`font-semibold ${
            totalCredit - totalDebit >= 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {formatCurrency(totalCredit - totalDebit)}
          </span>
        </div>
      </div>
    </Card>
  );
};

export default MonthlyFinancialSummary;