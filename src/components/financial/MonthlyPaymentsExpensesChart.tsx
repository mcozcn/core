
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useQuery } from "@tanstack/react-query";
import { getCustomerRecords, getCosts } from "@/utils/localStorage";
import { format, startOfMonth, endOfMonth, eachMonthOfInterval, subMonths } from "date-fns";
import { tr } from 'date-fns/locale';

const MonthlyPaymentsExpensesChart = () => {
  const { data: customerRecords = [] } = useQuery({
    queryKey: ['customerRecords'],
    queryFn: getCustomerRecords,
  });

  const { data: costs = [] } = useQuery({
    queryKey: ['costs'],
    queryFn: getCosts,
  });

  // Get last 6 months data
  const endDate = new Date();
  const startDate = subMonths(endDate, 5);
  const months = eachMonthOfInterval({ start: startDate, end: endDate });

  const chartData = months.map(month => {
    const monthStart = startOfMonth(month);
    const monthEnd = endOfMonth(month);
    
    // Calculate total payments (all positive customer records)
    const monthlyPayments = customerRecords
      .filter(record => {
        const recordDate = new Date(record.date);
        return recordDate >= monthStart && recordDate <= monthEnd && record.amount > 0;
      })
      .reduce((sum, record) => sum + Math.abs(record.amount), 0);

    // Calculate total expenses
    const monthlyExpenses = costs
      .filter(cost => {
        const costDate = new Date(cost.date);
        return costDate >= monthStart && costDate <= monthEnd;
      })
      .reduce((sum, cost) => sum + cost.amount, 0);

    return {
      month: format(month, 'MMM yyyy', { locale: tr }),
      payments: monthlyPayments,
      expenses: monthlyExpenses,
      net: monthlyPayments - monthlyExpenses
    };
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Aylık Tahsilat vs Masraf Karşılaştırması</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis tickFormatter={formatCurrency} />
            <Tooltip 
              formatter={(value: number, name: string) => [
                formatCurrency(value), 
                name === 'payments' ? 'Tahsilat' : name === 'expenses' ? 'Masraf' : 'Net'
              ]}
              labelStyle={{ color: '#000' }}
            />
            <Legend 
              wrapperStyle={{ paddingTop: '20px' }}
              formatter={(value) => {
                switch(value) {
                  case 'payments': return 'Tahsilat';
                  case 'expenses': return 'Masraf';
                  default: return value;
                }
              }}
            />
            <Bar 
              dataKey="payments" 
              fill="#22c55e" 
              name="payments"
              radius={[4, 4, 0, 0]}
            />
            <Bar 
              dataKey="expenses" 
              fill="#ef4444" 
              name="expenses"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default MonthlyPaymentsExpensesChart;
