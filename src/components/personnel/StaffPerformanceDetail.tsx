
import React from 'react';
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatCurrency } from "@/utils/format";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { User } from '@/utils/auth';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  ResponsiveContainer 
} from 'recharts';
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { DateRange } from "react-day-picker";
import { addDays } from "date-fns";

// Mock data for demonstration - in real app, this would be fetched from API/storage
const generatePerformanceData = (staffId: number) => [
  { date: '01/05/2025', appointments: 5, sales: 3, revenue: 1500 },
  { date: '02/05/2025', appointments: 4, sales: 2, revenue: 1200 },
  { date: '03/05/2025', appointments: 6, sales: 4, revenue: 1800 },
  { date: '04/05/2025', appointments: 3, sales: 2, revenue: 900 },
  { date: '05/05/2025', appointments: 7, sales: 5, revenue: 2100 },
];

interface StaffPerformanceDetailProps {
  staff: User;
}

const StaffPerformanceDetail: React.FC<StaffPerformanceDetailProps> = ({ staff }) => {
  const [date, setDate] = React.useState<DateRange | undefined>({
    from: new Date(),
    to: addDays(new Date(), 7),
  });
  
  const performanceData = generatePerformanceData(staff.id);
  
  // Calculate summary metrics
  const totalAppointments = performanceData.reduce((sum, day) => sum + day.appointments, 0);
  const totalSales = performanceData.reduce((sum, day) => sum + day.sales, 0);
  const totalRevenue = performanceData.reduce((sum, day) => sum + day.revenue, 0);
  const avgDailyRevenue = totalRevenue / performanceData.length;
  
  return (
    <Card className="p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div>
          <h3 className="text-xl font-semibold flex items-center">
            {staff.displayName}
            <span 
              className="ml-2 w-3 h-3 rounded-full" 
              style={{ backgroundColor: staff.color }}
            />
          </h3>
          <p className="text-muted-foreground">{staff.title}</p>
        </div>
        
        <DatePickerWithRange 
          className="mt-3 sm:mt-0" 
          date={date} 
          setDate={setDate} 
        />
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card className="p-4 bg-accent/20">
          <p className="text-sm text-muted-foreground mb-1">Toplam Randevu</p>
          <p className="text-2xl font-bold">{totalAppointments}</p>
        </Card>
        
        <Card className="p-4 bg-accent/20">
          <p className="text-sm text-muted-foreground mb-1">Toplam Satış</p>
          <p className="text-2xl font-bold">{totalSales}</p>
        </Card>
        
        <Card className="p-4 bg-accent/20">
          <p className="text-sm text-muted-foreground mb-1">Toplam Gelir</p>
          <p className="text-2xl font-bold">{formatCurrency(totalRevenue)}</p>
        </Card>
        
        <Card className="p-4 bg-accent/20">
          <p className="text-sm text-muted-foreground mb-1">Günlük Ort. Gelir</p>
          <p className="text-2xl font-bold">{formatCurrency(avgDailyRevenue)}</p>
        </Card>
      </div>
      
      <Tabs defaultValue="chart">
        <TabsList className="mb-4">
          <TabsTrigger value="chart">Grafik</TabsTrigger>
          <TabsTrigger value="table">Tablo</TabsTrigger>
          <TabsTrigger value="commissions">Hakediş</TabsTrigger>
        </TabsList>
        
        <TabsContent value="chart" className="space-y-4">
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis yAxisId="left" orientation="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Bar yAxisId="left" dataKey="appointments" name="Randevu" fill="#8884d8" />
                <Bar yAxisId="left" dataKey="sales" name="Satış" fill="#82ca9d" />
                <Bar yAxisId="right" dataKey="revenue" name="Gelir" fill="#ffc658" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </TabsContent>
        
        <TabsContent value="table">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tarih</TableHead>
                <TableHead className="text-right">Randevu</TableHead>
                <TableHead className="text-right">Satış</TableHead>
                <TableHead className="text-right">Gelir</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {performanceData.map((day, index) => (
                <TableRow key={index}>
                  <TableCell>{day.date}</TableCell>
                  <TableCell className="text-right">{day.appointments}</TableCell>
                  <TableCell className="text-right">{day.sales}</TableCell>
                  <TableCell className="text-right">{formatCurrency(day.revenue)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>
        
        <TabsContent value="commissions">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tarih</TableHead>
                <TableHead>Ürün/Hizmet</TableHead>
                <TableHead className="text-right">Tutar</TableHead>
                <TableHead className="text-right">Komisyon %</TableHead>
                <TableHead className="text-right">Hakediş</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>01/05/2025</TableCell>
                <TableCell>Saç Kesimi</TableCell>
                <TableCell className="text-right">{formatCurrency(250)}</TableCell>
                <TableCell className="text-right">20%</TableCell>
                <TableCell className="text-right">{formatCurrency(50)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>02/05/2025</TableCell>
                <TableCell>Saç Boyama</TableCell>
                <TableCell className="text-right">{formatCurrency(500)}</TableCell>
                <TableCell className="text-right">15%</TableCell>
                <TableCell className="text-right">{formatCurrency(75)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>03/05/2025</TableCell>
                <TableCell>Fön</TableCell>
                <TableCell className="text-right">{formatCurrency(150)}</TableCell>
                <TableCell className="text-right">20%</TableCell>
                <TableCell className="text-right">{formatCurrency(30)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell colSpan={3}></TableCell>
                <TableCell className="text-right font-bold">Toplam:</TableCell>
                <TableCell className="text-right font-bold">{formatCurrency(155)}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TabsContent>
      </Tabs>
    </Card>
  );
};

export default StaffPerformanceDetail;
