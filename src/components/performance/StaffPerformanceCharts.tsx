
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';

interface StaffPerformanceChartsProps {
  data: Array<{
    id: string | number;
    name: string;
    role: string;
    servicesProvided: number;
    totalRevenue: number;
    appointmentsCount: number;
    confirmedAppointments: number;
    cancelledAppointments: number;
    pendingAppointments: number;
    productSales: number;
    totalCommission: number;
  }>;
}

const StaffPerformanceCharts = ({ data }: StaffPerformanceChartsProps) => {
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  // Prepare data for charts
  const revenueData = data.map(staff => ({
    name: staff.name,
    gelir: staff.totalRevenue,
    hakediş: staff.totalCommission
  }));

  const appointmentData = data.map(staff => ({
    name: staff.name,
    onaylanan: staff.confirmedAppointments,
    iptal: staff.cancelledAppointments,
    bekleyen: staff.pendingAppointments
  }));

  const salesData = data.map(staff => ({
    name: staff.name,
    hizmet: staff.servicesProvided,
    ürün: staff.productSales
  }));

  const pieData = data.map((staff, index) => ({
    name: staff.name,
    value: staff.totalRevenue,
    color: COLORS[index % COLORS.length]
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
      {/* Revenue and Commission Chart */}
      <Card>
        <CardHeader className="p-3 md:p-6">
          <CardTitle className="text-sm md:text-base">Gelir ve Hakediş Analizi</CardTitle>
        </CardHeader>
        <CardContent className="p-3 md:p-6 pt-0">
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip formatter={(value) => `₺${value.toLocaleString()}`} />
              <Bar dataKey="gelir" fill="#8884d8" name="Gelir" />
              <Bar dataKey="hakediş" fill="#82ca9d" name="Hakediş" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Appointment Status Chart */}
      <Card>
        <CardHeader className="p-3 md:p-6">
          <CardTitle className="text-sm md:text-base">Randevu Durumu Analizi</CardTitle>
        </CardHeader>
        <CardContent className="p-3 md:p-6 pt-0">
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={appointmentData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip />
              <Bar dataKey="onaylanan" fill="#10B981" name="Onaylanan" />
              <Bar dataKey="iptal" fill="#EF4444" name="İptal" />
              <Bar dataKey="bekleyen" fill="#F59E0B" name="Bekleyen" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Sales Performance Chart */}
      <Card>
        <CardHeader className="p-3 md:p-6">
          <CardTitle className="text-sm md:text-base">Satış Performansı</CardTitle>
        </CardHeader>
        <CardContent className="p-3 md:p-6 pt-0">
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip />
              <Line type="monotone" dataKey="hizmet" stroke="#8884d8" name="Hizmet Satışı" />
              <Line type="monotone" dataKey="ürün" stroke="#82ca9d" name="Ürün Satışı" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Revenue Distribution Pie Chart */}
      <Card>
        <CardHeader className="p-3 md:p-6">
          <CardTitle className="text-sm md:text-base">Gelir Dağılımı</CardTitle>
        </CardHeader>
        <CardContent className="p-3 md:p-6 pt-0">
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name.substring(0, 8)}... ${(percent * 100).toFixed(0)}%`}
                outerRadius={70}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `₺${value.toLocaleString()}`} />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default StaffPerformanceCharts;
