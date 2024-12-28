import { Card } from "@/components/ui/card";
import { Calendar, Users, DollarSign, Clock } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getAppointments, getCustomers, getServices } from "@/utils/localStorage";

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
  // Randevuları getir
  const { data: appointmentsData = [] } = useQuery({
    queryKey: ['appointments'],
    queryFn: () => {
      console.log('Fetching appointments from local storage');
      return getAppointments();
    },
  });

  // Müşterileri getir
  const { data: customersData = [] } = useQuery({
    queryKey: ['customers'],
    queryFn: () => {
      console.log('Fetching customers from local storage');
      return getCustomers();
    },
  });

  // Hizmetleri getir
  const { data: servicesData = [] } = useQuery({
    queryKey: ['services'],
    queryFn: () => {
      console.log('Fetching services from local storage');
      return getServices();
    },
  });

  // Bugünkü randevuları hesapla
  const today = new Date();
  const todayAppointments = appointmentsData.filter((apt: any) => {
    const aptDate = new Date(apt?.date);
    return aptDate?.toDateString() === today.toDateString();
  }).length;

  // Geçen ayın randevularını hesapla
  const lastMonth = new Date();
  lastMonth.setMonth(lastMonth.getMonth() - 1);
  const lastMonthAppointments = appointmentsData.filter((apt: any) => {
    const aptDate = new Date(apt?.date);
    return aptDate.getMonth() === lastMonth.getMonth();
  }).length;

  // Randevu trendini hesapla
  const appointmentTrend = lastMonthAppointments === 0 
    ? { percentage: 0, direction: 'none' as const }
    : {
        percentage: Math.round(((todayAppointments - lastMonthAppointments) / lastMonthAppointments) * 100),
        direction: todayAppointments >= lastMonthAppointments ? 'up' as const : 'down' as const
      };

  // Toplam müşteri sayısı
  const totalCustomers = customersData.length;
  const lastMonthCustomers = customersData.filter((customer: any) => {
    const customerDate = new Date(customer?.createdAt);
    return customerDate.getMonth() === lastMonth.getMonth();
  }).length;

  // Müşteri trendini hesapla
  const customerTrend = lastMonthCustomers === 0
    ? { percentage: 0, direction: 'none' as const }
    : {
        percentage: Math.round(((totalCustomers - lastMonthCustomers) / lastMonthCustomers) * 100),
        direction: totalCustomers >= lastMonthCustomers ? 'up' as const : 'down' as const
      };

  // Toplam gelir hesapla
  const totalRevenue = servicesData.reduce((acc: number, service: any) => {
    return acc + (service.price || 0);
  }, 0);

  // Geçen ayın gelirini hesapla
  const lastMonthRevenue = servicesData
    .filter((service: any) => {
      const serviceDate = new Date(service?.createdAt);
      return serviceDate.getMonth() === lastMonth.getMonth();
    })
    .reduce((acc: number, service: any) => acc + (service.price || 0), 0);

  // Gelir trendini hesapla
  const revenueTrend = lastMonthRevenue === 0
    ? { percentage: 0, direction: 'none' as const }
    : {
        percentage: Math.round(((totalRevenue - lastMonthRevenue) / lastMonthRevenue) * 100),
        direction: totalRevenue >= lastMonthRevenue ? 'up' as const : 'down' as const
      };

  // Ortalama hizmet süresi hesapla (dakika cinsinden)
  const averageServiceDuration = servicesData.reduce((acc: number, service: any) => {
    return acc + (parseInt(service.duration) || 0);
  }, 0) / (servicesData.length || 1);

  return (
    <div className="p-8 pl-72 animate-fadeIn">
      <div className="mb-8">
        <h1 className="text-4xl font-serif mb-2" style={{ color: '#D4AF37' }}>ASLI ALTINBAŞ BEAUTY</h1>
        <p className="text-gray-500">Salonunuzdaki güncel durumu buradan takip edebilirsiniz.</p>
      </div>

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
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="p-6">
          <h2 className="text-xl font-serif mb-4">Yaklaşan Randevular</h2>
          <div className="space-y-4">
            {appointmentsData
              .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())
              .slice(0, 3)
              .map((apt: any, i: number) => (
                <div key={i} className="flex items-center justify-between p-3 bg-accent rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="text-sm font-semibold">{apt.time}</div>
                    <div>
                      <div className="font-medium">{apt.customerName}</div>
                      <div className="text-sm text-gray-500">{apt.service}</div>
                    </div>
                  </div>
                  <button className="text-primary hover:text-primary/80">Görüntüle</button>
                </div>
              ))}
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-serif mb-4">Popüler Hizmetler</h2>
          <div className="space-y-4">
            {servicesData
              .sort((a: any, b: any) => (b.bookings || 0) - (a.bookings || 0))
              .slice(0, 3)
              .map((service: any, i: number) => (
                <div key={i} className="flex items-center justify-between p-3 bg-accent rounded-lg">
                  <div className="font-medium">{service.name}</div>
                  <div className="text-sm text-gray-500">{service.bookings || 0} randevu</div>
                </div>
              ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;