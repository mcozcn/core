import React from 'react';
import { Card } from "@/components/ui/card";
import { CustomerRecord } from '@/utils/localStorage';
import { formatCurrency } from '@/utils/format';

interface UpcomingPaymentsProps {
  records: CustomerRecord[];
}

const UpcomingPayments = ({ records }: UpcomingPaymentsProps) => {
  const upcomingPayments = records
    .filter(record => !record.isPaid && record.dueDate)
    .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
    .slice(0, 5);

  return (
    <Card className="p-6">
      <h2 className="text-xl font-serif mb-4">Yaklaşan Ödemeler</h2>
      <div className="space-y-4">
        {upcomingPayments.map((payment) => (
          <div key={payment.id} className="flex items-center justify-between p-3 bg-accent rounded-lg">
            <div>
              <div className="font-medium">{payment.itemName}</div>
              <div className="text-sm text-gray-500">
                {new Date(payment.dueDate!).toLocaleDateString()}
              </div>
            </div>
            <div className="text-primary font-semibold">
              {formatCurrency(payment.amount)}
            </div>
          </div>
        ))}
        {upcomingPayments.length === 0 && (
          <div className="text-center text-muted-foreground">
            Yaklaşan ödeme bulunmamaktadır.
          </div>
        )}
      </div>
    </Card>
  );
};

export default UpcomingPayments;