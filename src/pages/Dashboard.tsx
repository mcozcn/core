import { Card } from "@/components/ui/card";
import { Calendar, Users, DollarSign, Clock } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

const StatCard = ({ title, value, icon: Icon, trend }: { title: string; value: string; icon: any; trend?: string }) => (
  <Card className="p-6 card-hover">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <h3 className="text-2xl font-semibold mt-1">{value}</h3>
        {trend && <p className="text-xs text-green-500 mt-1">↑ Geçen aya göre {trend} artış</p>}
      </div>
      <Icon className="text-primary" size={24} />
    </div>
  </Card>
);

const Dashboard = () => {
  // Randevuları getir
  const { data: appointmentsData } = useQuery({
    queryKey: ['appointments'],
    queryFn: () => {
      console.log('Fetching appointments data');
      return [];
    },
  });

  // Müşterileri getir
  const { data: customersData } = useQuery({
    queryKey: ['customers'],
    queryFn: () => {
      console.log('Fetching customers data');
      return [];
    },
  });

  // Hizmetleri getir
  const { data: servicesData } = useQuery({
    queryKey: ['services'],
    queryFn: () => {
      console.log('Fetching services data');
      return [];
    },
  });

  // Bugünkü randevuları hesapla
  const todayAppointments = appointmentsData?.filter((apt: any) => {
    const aptDate = new Date(apt?.date);
    const today = new Date();
    return aptDate?.toDateString() === today.toDateString();
  })?.length || 0;

  // Toplam müşteri sayısı
  const totalCustomers = customersData?.length || 0;

  // Toplam gelir hesapla
  const totalRevenue = servicesData?.reduce((acc: number, service: any) => {
    return acc + (service.price || 0);
  }, 0) || 0;

  // Ortalama hizmet süresi hesapla (dakika cinsinden)
  const averageServiceDuration = servicesData?.reduce((acc: number, service: any) => {
    return acc + (service.duration || 0);
  }, 0) / (servicesData?.length || 1) || 45;

  return (
    <div className="p-8 pl-72 animate-fadeIn">
      <div className="mb-8">
        <h1 className="text-4xl font-serif mb-2" style={{ color: '#D4AF37' }}>Hoş Geldiniz</h1>
        <p className="text-gray-500">Salonunuzdaki güncel durumu buradan takip edebilirsiniz.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Bugünkü Randevular"
          value={todayAppointments.toString()}
          icon={Calendar}
          trend="12%"
        />
        <StatCard
          title="Toplam Müşteriler"
          value={totalCustomers.toString()}
          icon={Users}
          trend="8%"
        />
        <StatCard
          title="Toplam Gelir"
          value={`₺${totalRevenue.toLocaleString()}`}
          icon={DollarSign}
          trend="15%"
        />
        <StatCard
          title="Ortalama Hizmet Süresi"
          value={`${Math.round(averageServiceDuration)}dk`}
          icon={Clock}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="p-6">
          <h2 className="text-xl font-serif mb-4">Yaklaşan Randevular</h2>
          <div className="space-y-4">
            {(appointmentsData || [])
              .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())
              .slice(0, 3)
              .map((apt: any, i: number) => (
                <div key={i} className="flex items-center justify-between p-3 bg-accent rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="text-sm font-semibold">{apt.time}</div>
                    <div>
                      <div className="font-medium">{apt.client}</div>
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
            {(servicesData || [])
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