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

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const monthlyPayments = payments.filter(payment => {
    const paymentDate = new Date(payment.date);
    return paymentDate.getMonth() === currentMonth && 
           paymentDate.getFullYear() === currentYear;
  });

  const monthlyRecords = customerRecords.filter(record => {
    const recordDate = new Date(record.date);
    return recordDate.getMonth() === currentMonth && 
           recordDate.getFullYear() === currentYear;
  });

  const monthlyCosts = costs.filter(cost => {
    const costDate = new Date(cost.date);
    return costDate.getMonth() === currentMonth && 
           costDate.getFullYear() === currentYear;
  });

  console.log('Filtered monthly data:', { monthlyPayments, monthlyRecords, monthlyCosts });

  // Calculate total income (payments and customer payments)
  const totalCredit = monthlyRecords
    .filter(r => r.recordType === 'payment' || (r.recordType === 'debt' && r.isPaid))
    .reduce((sum, r) => sum + Math.abs(r.amount), 0);

  // Calculate total expenses (costs)
  const totalDebit = monthlyCosts
    .reduce((sum, c) => sum + c.amount, 0);

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