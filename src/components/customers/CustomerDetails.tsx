import React from 'react';
import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { getCustomerRecords, getCustomers } from "@/utils/localStorage";
import { formatCurrency } from "@/utils/format";

interface CustomerDetailsProps {
  customerId: number;
  customerName: string;
}

const CustomerDetails = ({ customerId, customerName }: CustomerDetailsProps) => {
  const { data: records = [] } = useQuery({
    queryKey: ['customerRecords', customerId],
    queryFn: () => {
      console.log('Fetching customer records for:', customerId);
      const allRecords = getCustomerRecords();
      return allRecords.filter(record => record.customerId === customerId);
    }
  });

  // Toplam borç hesaplama
  const totalDebt = records.reduce((acc, record) => {
    if (record.type !== 'payment' && !record.isPaid) {
      return acc + record.amount;
    }
    return acc;
  }, 0);

  // Toplam ödeme hesaplama
  const totalPayments = records.reduce((acc, record) => {
    if (record.type === 'payment') {
      return acc + record.amount;
    }
    return acc;
  }, 0);

  // Son işlem tarihi
  const lastTransactionDate = records.length > 0 
    ? new Date(Math.max(...records.map(r => new Date(r.date).getTime())))
    : null;

  console.log('Customer Details:', {
    customerId,
    recordsCount: records.length,
    totalDebt,
    totalPayments,
    lastTransactionDate
  });

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-serif">{customerName}</h2>
          <div className="text-sm text-muted-foreground">
            Son İşlem: {lastTransactionDate 
              ? lastTransactionDate.toLocaleDateString('tr-TR')
              : 'İşlem bulunamadı'}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg bg-accent">
            <div className="text-sm text-muted-foreground">Toplam İşlem</div>
            <div className="text-2xl font-semibold mt-1">
              {records.length}
            </div>
          </div>

          <div className="p-4 rounded-lg bg-red-100 dark:bg-red-900">
            <div className="text-sm text-muted-foreground">Toplam Borç</div>
            <div className="text-2xl font-semibold mt-1 text-red-600 dark:text-red-400">
              {formatCurrency(totalDebt)}
            </div>
          </div>

          <div className="p-4 rounded-lg bg-green-100 dark:bg-green-900">
            <div className="text-sm text-muted-foreground">Toplam Ödeme</div>
            <div className="text-2xl font-semibold mt-1 text-green-600 dark:text-green-400">
              {formatCurrency(totalPayments)}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default CustomerDetails;