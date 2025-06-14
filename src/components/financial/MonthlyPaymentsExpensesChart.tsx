
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { useQuery } from "@tanstack/react-query";
import { getCustomerRecords, getCosts } from "@/utils/storage";
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

  // Son 6 aylık veriyi hesapla
  const sixMonthsAgo = subMonths(new Date(), 5);
  const months = eachMonthOfInterval({
    start: startOfMonth(sixMonthsAgo),
    end: endOfMonth(new Date())
  });

  const chartData = months.map(month => {
    const monthStart = startOfMonth(month);
    const monthEnd = endOfMonth(month);

    // Aylık tahsilat (payments - yeşil)
    const monthlyPayments = customerRecords
      .filter(record => {
        const recordDate = new Date(record.date);
        return record.type === 'payment' && 
               recordDate >= monthStart && 
               recordDate <= monthEnd;
      })
      .reduce((sum, record) => sum + Math.abs(record.amount), 0);

    // Aylık masraflar (costs - kırmızı)
    const monthlyExpenses = costs
      .filter(cost => {
        const costDate = new Date(cost.date);
        return costDate >= monthStart && costDate <= monthEnd;
      })
      .reduce((sum, cost) => sum + cost.amount, 0);

    return {
      month: format(month, 'MMM yyyy', { locale: tr }),
      tahsilat: monthlyPayments,
      masraf: monthlyExpenses,
    };
  });

  const chartConfig = {
    tahsilat: {
      label: "Tahsilat",
      color: "#10b981", // Yeşil
    },
    masraf: {
      label: "Masraf",
      color: "#ef4444", // Kırmızı
    },
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Aylık Tahsilat vs Masraf Karşılaştırması</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <XAxis 
                dataKey="month" 
                axisLine={false}
                tickLine={false}
                fontSize={12}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                fontSize={12}
                tickFormatter={(value) => `₺${value.toLocaleString()}`}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar 
                dataKey="tahsilat" 
                fill="var(--color-tahsilat)" 
                radius={[4, 4, 0, 0]}
                name="Tahsilat"
              />
              <Bar 
                dataKey="masraf" 
                fill="var(--color-masraf)" 
                radius={[4, 4, 0, 0]}
                name="Masraf"
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default MonthlyPaymentsExpensesChart;
