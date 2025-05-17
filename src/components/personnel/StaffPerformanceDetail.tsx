import React, { useEffect, useState } from 'react';
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
import { addDays, isWithinInterval, format, startOfDay, endOfDay } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { getSales, getServiceSales, getAppointments } from "@/utils/localStorage";

interface StaffPerformanceDetailProps {
  staff: User;
}

interface PerformanceDataPoint {
  date: string;
  appointments: number;
  sales: number;
  revenue: number;
}

const StaffPerformanceDetail: React.FC<StaffPerformanceDetailProps> = ({ staff }) => {
  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date(),
    to: addDays(new Date(), 7),
  });

  const { data: sales = [] } = useQuery({
    queryKey: ['sales'],
    queryFn: () => getSales(),
  });

  const { data: serviceSales = [] } = useQuery({
    queryKey: ['serviceSales'],
    queryFn: () => getServiceSales(),
  });
  
  const { data: appointments = [] } = useQuery({
    queryKey: ['appointments'],
    queryFn: () => getAppointments(),
  });

  // Filter data by staff and date range
  const filterByStaffAndDate = (item: any) => {
    // Handle both date and saleDate properties
    const itemDate = new Date(item.date || item.saleDate || new Date());
    const staffMatch = item.staffId === staff.id;
    
    if (!date?.from) return staffMatch;
    
    const fromDate = startOfDay(date.from);
    const toDate = date.to ? endOfDay(date.to) : endOfDay(date.from);
    
    return staffMatch && isWithinInterval(itemDate, { start: fromDate, end: toDate });
  };
  
  // Get staff data from different sources
  const staffSales = sales.filter(filterByStaffAndDate);
  const staffServiceSales = serviceSales.filter(filterByStaffAndDate);
  const staffAppointments = appointments.filter(filterByStaffAndDate);

  // Process commission data
  const commissionItems = [
    ...staffSales.map(sale => ({
      date: new Date(sale.saleDate || sale.date || new Date()),
      item: sale.productName || 'Ürün Satışı',
      amount: sale.price || sale.total || 0,
      commissionRate: sale.commissionRate || 0,
      commissionAmount: sale.commissionAmount || 0,
      customerName: sale.customerName || 'Müşteri'
    })),
    ...staffServiceSales.map(sale => ({
      date: new Date(sale.saleDate || new Date()),
      item: sale.serviceName || 'Hizmet Satışı',
      amount: sale.price || 0,
      commissionRate: sale.commissionRate || 0,
      commissionAmount: sale.commissionAmount || 0,
      customerName: sale.customerName || 'Müşteri'
    }))
  ];
  
  // Sort items by date
  commissionItems.sort((a, b) => b.date.getTime() - a.date.getTime());
  
  // Calculate total commission
  const totalCommission = commissionItems.reduce((sum, item) => sum + item.commissionAmount, 0);
  
  // Group data by date for chart
  const generatePerformanceData = (): PerformanceDataPoint[] => {
    const dataMap = new Map<string, PerformanceDataPoint>();
    
    // Start with an empty data point for each day in the range
    if (date?.from && date?.to) {
      const currentDate = new Date(date.from);
      const endDate = new Date(date.to);
      
      while (currentDate <= endDate) {
        const dateKey = format(currentDate, 'yyyy-MM-dd');
        dataMap.set(dateKey, {
          date: format(currentDate, 'dd/MM/yyyy'),
          appointments: 0,
          sales: 0,
          revenue: 0
        });
        currentDate.setDate(currentDate.getDate() + 1);
      }
    }
    
    // Add appointment data
    staffAppointments.forEach(appointment => {
      const appointmentDate = new Date(appointment.date);
      const dateKey = format(appointmentDate, 'yyyy-MM-dd');
      
      if (dataMap.has(dateKey)) {
        const data = dataMap.get(dateKey)!;
        data.appointments++;
      } else {
        dataMap.set(dateKey, {
          date: format(appointmentDate, 'dd/MM/yyyy'),
          appointments: 1,
          sales: 0,
          revenue: 0
        });
      }
    });
    
    // Add sales data - safely handle different data structures
    [...staffSales, ...staffServiceSales].forEach(sale => {
      // Handle both date formats safely
      const saleDate = new Date(sale.saleDate || (sale as any).date || new Date());
      const dateKey = format(saleDate, 'yyyy-MM-dd');
      
      // Handle both price structures safely
      const saleAmount = ('price' in sale) ? sale.price : 
                        ('total' in sale) ? (sale as any).total : 0;
      
      if (dataMap.has(dateKey)) {
        const data = dataMap.get(dateKey)!;
        data.sales++;
        data.revenue += saleAmount;
      } else {
        dataMap.set(dateKey, {
          date: format(saleDate, 'dd/MM/yyyy'),
          appointments: 0,
          sales: 1,
          revenue: saleAmount
        });
      }
    });
    
    return Array.from(dataMap.values()).sort((a, b) => {
      // Sort by date
      const dateA = new Date(a.date.split('/').reverse().join('-'));
      const dateB = new Date(b.date.split('/').reverse().join('-'));
      return dateA.getTime() - dateB.getTime();
    });
  };

  const performanceData = generatePerformanceData();
  
  // Calculate summary metrics
  const totalAppointments = staffAppointments.length;
  const totalSales = staffSales.length + staffServiceSales.length;
  
  // Safely calculate total revenue
  const totalRevenue = [...staffSales, ...staffServiceSales].reduce(
    (sum, sale) => {
      // Handle both price structures safely
      const amount = 'price' in sale ? sale.price : 
                    'total' in sale ? (sale as any).total : 0;
      return sum + amount;
    }, 
    0
  );
  
  const avgDailyRevenue = performanceData.length > 0 
    ? totalRevenue / performanceData.length 
    : 0;
  
  return (
    <Card className="p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div>
          <h3 className="text-xl font-semibold flex items-center">
            {staff.displayName || staff.username}
            <span 
              className="ml-2 w-3 h-3 rounded-full" 
              style={{ backgroundColor: staff.color }}
            />
          </h3>
          <p className="text-muted-foreground">{staff.title || 'Personel'}</p>
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
          {performanceData.length > 0 ? (
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
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Seçilen tarih aralığında veri bulunamadı.
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="table">
          {performanceData.length > 0 ? (
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
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Seçilen tarih aralığında veri bulunamadı.
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="commissions">
          {commissionItems.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tarih</TableHead>
                  <TableHead>Müşteri</TableHead>
                  <TableHead>Ürün/Hizmet</TableHead>
                  <TableHead className="text-right">Tutar</TableHead>
                  <TableHead className="text-right">Komisyon %</TableHead>
                  <TableHead className="text-right">Hakediş</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {commissionItems.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{format(item.date, 'dd/MM/yyyy')}</TableCell>
                    <TableCell>{item.customerName}</TableCell>
                    <TableCell>{item.item}</TableCell>
                    <TableCell className="text-right">{formatCurrency(item.amount)}</TableCell>
                    <TableCell className="text-right">%{item.commissionRate}</TableCell>
                    <TableCell className="text-right">{formatCurrency(item.commissionAmount)}</TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell colSpan={4}></TableCell>
                  <TableCell className="text-right font-bold">Toplam:</TableCell>
                  <TableCell className="text-right font-bold">{formatCurrency(totalCommission)}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Seçilen tarih aralığında hakediş bilgisi bulunamadı.
            </div>
          )}
        </TabsContent>
      </Tabs>
    </Card>
  );
};

export default StaffPerformanceDetail;
