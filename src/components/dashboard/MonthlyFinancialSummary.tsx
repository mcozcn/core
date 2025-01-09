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
  // Toplam tahsilat hesaplama
  const totalCredit = customerRecords
    .filter(r => r.type === 'payment')
    .reduce((sum, r) => sum + r.amount, 0);

  // Toplam masraf hesaplama
  const totalDebit = costs.reduce((sum, c) => sum + c.amount, 0);

  console.log('MonthlyFinancialSummary calculations:', {
    totalCredit,
    totalDebit,
    recordsCount: customerRecords.length,
    paymentsCount: payments.length,
    costsCount: costs.length
  });

  return (
    <Card className="p-6">
      <h2 className="text-xl font-serif mb-4">Finansal Özet</h2>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="flex flex-col p-4 bg-green-50 rounded-lg">
          <span className="text-sm text-green-600 mb-1">Toplam Tahsilat</span>
          <span className="text-2xl font-semibold text-green-700">{formatCurrency(totalCredit)}</span>
        </div>
        
        <div className="flex flex-col p-4 bg-red-50 rounded-lg">
          <span className="text-sm text-red-600 mb-1">Toplam Gider</span>
          <span className="text-2xl font-semibold text-red-700">{formatCurrency(totalDebit)}</span>
        </div>
        
        <div className="flex flex-col p-4 bg-blue-50 rounded-lg">
          <span className="text-sm text-blue-600 mb-1">Net Durum</span>
          <span className={`text-2xl font-semibold ${
            totalCredit - totalDebit >= 0 ? 'text-green-700' : 'text-red-700'
          }`}>
            {formatCurrency(totalCredit - totalDebit)}
          </span>
        </div>
      </div>
    </Card>
  );
};

export default MonthlyFinancialSummary;