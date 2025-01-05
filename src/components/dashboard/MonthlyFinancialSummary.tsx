import React from 'react';
import { Card } from "@/components/ui/card";
import { Payment } from '@/utils/localStorage';
import { formatCurrency } from '@/utils/format';

interface MonthlyFinancialSummaryProps {
  payments: Payment[];
}

const MonthlyFinancialSummary = ({ payments }: MonthlyFinancialSummaryProps) => {
  console.log('MonthlyFinancialSummary received payments:', payments);

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const monthlyPayments = payments.filter(payment => {
    const paymentDate = new Date(payment.date);
    return paymentDate.getMonth() === currentMonth && 
           paymentDate.getFullYear() === currentYear;
  });

  console.log('Filtered monthly payments:', monthlyPayments);

  const totalCredit = monthlyPayments
    .filter(p => p.type === 'credit')
    .reduce((sum, p) => sum + p.amount, 0);

  const totalDebit = monthlyPayments
    .filter(p => p.type === 'debit')
    .reduce((sum, p) => sum + p.amount, 0);

  console.log('Calculated totals:', { totalCredit, totalDebit });

  return (
    <Card className="p-6">
      <h2 className="text-xl font-serif mb-4">Aylık Tahsilat Özeti</h2>
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