import React from 'react';
import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { getCustomerRecords, getAppointments, type CustomerRecord } from '@/utils/localStorage';
import { formatCurrency } from '@/utils/format';
import { cn } from "@/lib/utils";

interface CustomerDetailsProps {
  customerId: number;
  customerName: string;
}

const CustomerDetails = ({ customerId, customerName }: CustomerDetailsProps) => {
  const { data: records = [] } = useQuery({
    queryKey: ['customerRecords', customerId],
    queryFn: () => getCustomerRecords().filter(record => record.customerId === customerId),
  });

  const { data: appointments = [] } = useQuery({
    queryKey: ['appointments', customerId],
    queryFn: () => getAppointments().filter(apt => apt.customerId === customerId),
  });

  const calculateBalance = (records: CustomerRecord[]) => {
    return records.reduce((total, record) => total + record.amount, 0);
  };

  const balance = calculateBalance(records);

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-serif mb-6">{customerName}</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="p-4 bg-accent rounded-lg">
          <div className="text-sm text-muted-foreground">Toplam Borç</div>
          <div className="text-2xl font-semibold text-primary">
            {formatCurrency(Math.max(balance, 0))}
          </div>
        </div>
        
        <div className="p-4 bg-accent rounded-lg">
          <div className="text-sm text-muted-foreground">Son Randevu</div>
          <div className="text-lg">
            {appointments.length > 0 
              ? new Date(appointments[appointments.length - 1].date).toLocaleDateString()
              : 'Randevu yok'}
          </div>
        </div>

        <div className="p-4 bg-accent rounded-lg">
          <div className="text-sm text-muted-foreground">Toplam İşlem</div>
          <div className="text-lg">{records.length}</div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Son İşlemler</h3>
        <div className="space-y-2">
          {records.slice(-5).reverse().map((record) => (
            <div key={record.id} className="flex justify-between items-center p-3 bg-accent/50 rounded-lg">
              <div>
                <div className="font-medium">{record.itemName}</div>
                <div className="text-sm text-muted-foreground">
                  {new Date(record.date).toLocaleDateString()}
                </div>
              </div>
              <div className={cn(
                "text-lg font-semibold",
                record.amount > 0 ? "text-red-600" : "text-green-600"
              )}>
                {formatCurrency(record.amount)}
              </div>
            </div>
          ))}
          {records.length === 0 && (
            <div className="text-center text-muted-foreground py-4">
              Henüz işlem bulunmamaktadır.
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default CustomerDetails;