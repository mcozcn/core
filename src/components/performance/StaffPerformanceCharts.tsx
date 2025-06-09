
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
    id: number;
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
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Revenue and Commission Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Gelir ve Hakediş Analizi</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => `₺${value.toLocaleString()}`} />
              <Bar dataKey="gelir" fill="#8884d8" name="Gelir" />
              <Bar dataKey="hakediş" fill="#82ca9d" name="Hakediş" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Appointment Status Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Randevu Durumu Analizi</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={appointmentData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
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
        <CardHeader>
          <CardTitle>Satış Performansı</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="hizmet" stroke="#8884d8" name="Hizmet Satışı" />
              <Line type="monotone" dataKey="ürün" stroke="#82ca9d" name="Ürün Satışı" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Revenue Distribution Pie Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Gelir Dağılımı</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
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
