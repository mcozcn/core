import { Card } from "@/components/ui/card";
import { Calendar, Users, DollarSign, Clock, Package } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getAppointments, getCustomers, getServices, getStock, getSales } from "@/utils/localStorage";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProductProfitLossAnalysis from "@/components/dashboard/ProductProfitLossAnalysis";
import ServiceProfitLossAnalysis from "@/components/dashboard/ServiceProfitLossAnalysis";
import SalesSummary from "@/components/dashboard/SalesSummary";
import UpcomingAppointments from "@/components/dashboard/UpcomingAppointments";

const StatCard = ({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  showTrend = true 
}: { 
  title: string; 
  value: string; 
  icon: any; 
  trend?: { 
    percentage: number; 
    direction: 'up' | 'down' | 'none' 
  }; 
  showTrend?: boolean;
}) => (
  <Card className="p-6 card-hover">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <h3 className="text-2xl font-semibold mt-1">{value}</h3>
        {showTrend && trend && trend.percentage !== 0 && (
          <p className={`text-xs mt-1 ${
            trend.direction === 'up' 
              ? 'text-green-500' 
              : trend.direction === 'down' 
                ? 'text-red-500' 
                : 'text-gray-500'
          }`}>
            {trend.direction === 'up' ? '↑' : trend.direction === 'down' ? '↓' : '→'} 
            Geçen aya göre {Math.abs(trend.percentage)}% {
              trend.direction === 'up' 
                ? 'artış' 
                : trend.direction === 'down' 
                  ? 'azalış' 
                  : 'değişim yok'
            }
          </p>
        )}
      </div>
      <Icon className="text-primary" size={24} />
    </div>
  </Card>
);

const Dashboard = () => {
  const { data: appointmentsData = [] } = useQuery({
    queryKey: ['appointments'],
    queryFn: () => {
      console.log('Fetching appointments from local storage');
      return getAppointments();
    },
  });

  const { data: customersData = [] } = useQuery({
    queryKey: ['customers'],
    queryFn: () => {
      console.log('Fetching customers from local storage');
      return getCustomers();
    },
  });

  const { data: servicesData = [] } = useQuery({
    queryKey: ['services'],
    queryFn: () => {
      console.log('Fetching services from local storage');
      return getServices();
    },
  });

  const { data: stockData = [] } = useQuery({
    queryKey: ['stock'],
    queryFn: () => {
      console.log('Fetching stock from localStorage');
      return getStock();
    },
  });

  const { data: salesData = [] } = useQuery({
    queryKey: ['sales'],
    queryFn: () => {
      console.log('Fetching sales from localStorage');
      return getSales();
    },
  });

  const today = new Date();
  const todayAppointments = appointmentsData.filter((apt: any) => {
    const aptDate = new Date(apt?.date);
    return aptDate?.toDateString() === today.toDateString();
  }).length;

  const lastMonth = new Date();
  lastMonth.setMonth(lastMonth.getMonth() - 1);
  const lastMonthAppointments = appointmentsData.filter((apt: any) => {
    const aptDate = new Date(apt?.date);
    return aptDate.getMonth() === lastMonth.getMonth();
  }).length;

  const appointmentTrend = lastMonthAppointments === 0 
    ? { percentage: 0, direction: 'none' as const }
    : {
        percentage: Math.round(((todayAppointments - lastMonthAppointments) / lastMonthAppointments) * 100),
        direction: todayAppointments >= lastMonthAppointments ? 'up' as const : 'down' as const
      };

  const totalCustomers = customersData.length;
  const lastMonthCustomers = customersData.filter((customer: any) => {
    const customerDate = new Date(customer?.createdAt);
    return customerDate.getMonth() === lastMonth.getMonth();
  }).length;

  const customerTrend = lastMonthCustomers === 0
    ? { percentage: 0, direction: 'none' as const }
    : {
        percentage: Math.round(((totalCustomers - lastMonthCustomers) / lastMonthCustomers) * 100),
        direction: totalCustomers >= lastMonthCustomers ? 'up' as const : 'down' as const
      };

  const totalRevenue = servicesData.reduce((acc: number, service: any) => {
    return acc + (service.price || 0);
  }, 0);

  const lastMonthRevenue = servicesData
    .filter((service: any) => {
      const serviceDate = new Date(service?.createdAt);
      return serviceDate.getMonth() === lastMonth.getMonth();
    })
    .reduce((acc: number, service: any) => acc + (service.price || 0), 0);

  const revenueTrend = lastMonthRevenue === 0
    ? { percentage: 0, direction: 'none' as const }
    : {
        percentage: Math.round(((totalRevenue - lastMonthRevenue) / lastMonthRevenue) * 100),
        direction: totalRevenue >= lastMonthRevenue ? 'up' as const : 'down' as const
      };

  const averageServiceDuration = servicesData.reduce((acc: number, service: any) => {
    return acc + (parseInt(service.duration) || 0);
  }, 0) / (servicesData.length || 1);

  const todaySales = salesData.filter((sale: any) => {
    const saleDate = new Date(sale.saleDate);
    return saleDate.toDateString() === today.toDateString();
  });

  const dailySalesTotal = todaySales.reduce((acc: number, sale: any) => acc + sale.totalPrice, 0);

  const totalStockValue = stockData.reduce((acc: number, item: any) => {
    return acc + (item.quantity * item.price);
  }, 0);

  return (
    <div className="p-8 pl-72 animate-fadeIn">
      <div className="mb-8">
        <h1 className="text-5xl font-serif mb-4 text-center" style={{ color: '#D4AF37' }}>
          ASLI ALTINBAŞ BEAUTY
        </h1>
        <p className="text-gray-500 text-center">Salonunuzdaki güncel durumu buradan takip edebilirsiniz.</p>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Genel Bakış</TabsTrigger>
          <TabsTrigger value="productProfitLoss">Ürün Kar/Zarar</TabsTrigger>
          <TabsTrigger value="serviceProfitLoss">Hizmet Kar/Zarar</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Bugünkü Randevular"
              value={todayAppointments.toString()}
              icon={Calendar}
              trend={appointmentTrend}
            />
            <StatCard
              title="Toplam Müşteriler"
              value={totalCustomers.toString()}
              icon={Users}
              trend={customerTrend}
            />
            <StatCard
              title="Toplam Gelir"
              value={`₺${totalRevenue.toLocaleString()}`}
              icon={DollarSign}
              trend={revenueTrend}
            />
            <StatCard
              title="Ortalama Hizmet Süresi"
              value={`${Math.round(averageServiceDuration)}dk`}
              icon={Clock}
              showTrend={false}
            />
            <StatCard
              title="Günlük Satış"
              value={`₺${dailySalesTotal.toLocaleString()}`}
              icon={DollarSign}
              showTrend={false}
            />
            <StatCard
              title="Toplam Stok Değeri"
              value={`₺${totalStockValue.toLocaleString()}`}
              icon={Package}
              showTrend={false}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <UpcomingAppointments appointments={appointmentsData} />
            <SalesSummary />
          </div>
        </TabsContent>

        <TabsContent value="productProfitLoss">
          <ProductProfitLossAnalysis />
        </TabsContent>

        <TabsContent value="serviceProfitLoss">
          <ServiceProfitLossAnalysis />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;
