
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Users, TrendingUp, DollarSign, Calendar } from "lucide-react";
import { Customer, CustomerRecord } from '@/utils/storage';

interface CustomersStatsProps {
  customers: Customer[];
  records: CustomerRecord[];
}

const CustomersStats = ({ customers, records }: CustomersStatsProps) => {
  const totalCustomers = customers.length;
  const activeCustomers = customers.filter(customer => {
    const customerRecords = records.filter(record => record.customerId === customer.id);
    return customerRecords.length > 0;
  }).length;
  
  const totalRevenue = records
    .filter(record => record.type !== 'payment')
    .reduce((sum, record) => sum + record.amount, 0);

  const totalDebt = Math.max(0, 
    records.reduce((acc, record) => 
      record.type !== 'payment' ? acc + record.amount : acc, 0
    ) - 
    records.reduce((acc, record) => 
      record.type === 'payment' ? acc + Math.abs(record.amount) : acc, 0
    )
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500 rounded-lg">
              <Users className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Toplam Müşteri</p>
              <p className="text-2xl font-bold text-blue-600">{totalCustomers}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500 rounded-lg">
              <TrendingUp className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Aktif Müşteri</p>
              <p className="text-2xl font-bold text-green-600">{activeCustomers}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500 rounded-lg">
              <DollarSign className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Toplam Gelir</p>
              <p className="text-2xl font-bold text-purple-600">₺{totalRevenue.toLocaleString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-orange-200">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-500 rounded-lg">
              <Calendar className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Toplam Borç</p>
              <p className="text-2xl font-bold text-orange-600">₺{totalDebt.toLocaleString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomersStats;
