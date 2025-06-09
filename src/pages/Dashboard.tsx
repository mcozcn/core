
import { useQuery } from "@tanstack/react-query";
import { getAppointments, getSales, getServiceSales, getCustomers } from "@/utils/localStorage";
import SalesSummary from "@/components/dashboard/SalesSummary";
import UpcomingAppointments from "@/components/dashboard/UpcomingAppointments";
import StatCard from "@/components/dashboard/StatCard";
import { Calendar, DollarSign, Users, TrendingUp, Clock, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Dashboard = () => {
  const { data: appointments = [] } = useQuery({
    queryKey: ['appointments'],
    queryFn: () => {
      console.log('Fetching appointments for dashboard');
      return getAppointments();
    }
  });

  const { data: sales = [] } = useQuery({
    queryKey: ['sales'],
    queryFn: () => {
      console.log('Fetching sales for stats');
      return getSales();
    }
  });

  const { data: serviceSales = [] } = useQuery({
    queryKey: ['serviceSales'],
    queryFn: () => {
      console.log('Fetching service sales for stats');
      return getServiceSales();
    }
  });

  const { data: customers = [] } = useQuery({
    queryKey: ['customers'],
    queryFn: () => {
      console.log('Fetching customers for stats');
      return getCustomers();
    }
  });

  // Calculate today's appointments
  const today = new Date();
  const todayAppointments = appointments.filter(apt => 
    new Date(apt.date).toDateString() === today.toDateString()
  );

  const confirmedTodayAppointments = todayAppointments.filter(apt => apt.status === 'confirmed');

  // Calculate today's total sales (products + services)
  const todaySales = sales.filter(sale => 
    new Date(sale.saleDate).toDateString() === today.toDateString()
  );

  const todayServiceSales = serviceSales.filter(sale => 
    new Date(sale.saleDate).toDateString() === today.toDateString()
  );

  const totalDailySales = todaySales.length + todayServiceSales.length;

  // Calculate total daily revenue
  const totalDailyRevenue = [
    ...todaySales.map(sale => sale.totalPrice),
    ...todayServiceSales.map(sale => sale.price)
  ].reduce((sum, price) => sum + price, 0);

  // Get upcoming appointments (next 7 days)
  const nextWeek = new Date();
  nextWeek.setDate(today.getDate() + 7);
  const upcomingAppointments = appointments.filter(apt => {
    const aptDate = new Date(apt.date);
    return aptDate >= today && aptDate <= nextWeek && apt.status !== 'cancelled';
  });

  return (
    <div className="p-6 pl-72 animate-fadeIn space-y-8">
      {/* Header Section */}
      <div className="text-center space-y-4">
        <div className="flex justify-center mb-6">
          <img 
            src="/lovable-uploads/18599c6d-da00-4149-814e-e1ce55f990d5.png" 
            alt="Beautiq Logo" 
            className="w-80 h-auto" 
          />
        </div>
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-serif text-foreground mb-2">Hoş Geldiniz</h1>
          <p className="text-muted-foreground">Salonunuzdaki güncel durumu buradan takip edebilirsiniz.</p>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Bugünkü Randevular"
          value={todayAppointments.length.toString()}
          icon={Calendar}
          showTrend={false}
          className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800"
        />
        <StatCard
          title="Onaylı Randevular"
          value={confirmedTodayAppointments.length.toString()}
          icon={CheckCircle}
          showTrend={false}
          className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-800"
        />
        <StatCard
          title="Bugünkü Satışlar"
          value={totalDailySales.toString()}
          icon={DollarSign}
          showTrend={false}
          className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-800"
        />
        <StatCard
          title="Günlük Gelir"
          value={`₺${totalDailyRevenue.toLocaleString()}`}
          icon={TrendingUp}
          showTrend={false}
          className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-orange-200 dark:border-orange-800"
        />
      </div>

      {/* Quick Access Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-accent/50 to-accent/30 border-accent">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="h-5 w-5" />
              Müşteri Özeti
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Toplam Müşteri:</span>
                <span className="font-medium">{customers.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Bu Hafta Yeni:</span>
                <span className="font-medium text-green-600">
                  {customers.filter(c => {
                    const customerDate = new Date(c.createdAt || Date.now());
                    const weekAgo = new Date();
                    weekAgo.setDate(today.getDate() - 7);
                    return customerDate >= weekAgo;
                  }).length}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Clock className="h-5 w-5" />
              Yaklaşan Randevular
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Bu Hafta:</span>
                <span className="font-medium">{upcomingAppointments.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Bekleyen Onay:</span>
                <span className="font-medium text-orange-600">
                  {upcomingAppointments.filter(apt => apt.status === 'pending').length}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-secondary/50 to-secondary/30 border-secondary">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="h-5 w-5" />
              Performans
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Haftalık Gelir:</span>
                <span className="font-medium text-green-600">
                  ₺{[
                    ...sales.filter(sale => {
                      const saleDate = new Date(sale.saleDate);
                      const weekAgo = new Date();
                      weekAgo.setDate(today.getDate() - 7);
                      return saleDate >= weekAgo;
                    }).map(sale => sale.totalPrice),
                    ...serviceSales.filter(sale => {
                      const saleDate = new Date(sale.saleDate);
                      const weekAgo = new Date();
                      weekAgo.setDate(today.getDate() - 7);
                      return saleDate >= weekAgo;
                    }).map(sale => sale.price)
                  ].reduce((sum, price) => sum + price, 0).toLocaleString()}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <div className="space-y-6">
          <UpcomingAppointments appointments={appointments} />
        </div>
        <div className="space-y-6">
          <SalesSummary />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
