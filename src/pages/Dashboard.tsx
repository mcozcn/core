
import { useQuery } from "@tanstack/react-query";
import { getAppointments, getSales, getServiceSales } from "@/utils/localStorage";
import SalesSummary from "@/components/dashboard/SalesSummary";
import UpcomingAppointments from "@/components/dashboard/UpcomingAppointments";
import StatCard from "@/components/dashboard/StatCard";
import { Calendar, DollarSign } from "lucide-react";

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

  // Calculate today's appointments
  const today = new Date();
  const todayAppointments = appointments.filter(apt => 
    new Date(apt.date).toDateString() === today.toDateString()
  );

  // Calculate today's total sales (products + services)
  const todaySales = sales.filter(sale => 
    new Date(sale.saleDate).toDateString() === today.toDateString()
  );

  const todayServiceSales = serviceSales.filter(sale => 
    new Date(sale.saleDate).toDateString() === today.toDateString()
  );

  const totalDailySales = todaySales.length + todayServiceSales.length;

  return (
    <div className="p-8 pl-72 animate-fadeIn">
      <div className="mb-6 flex justify-center">
        <img 
          src="/lovable-uploads/18599c6d-da00-4149-814e-e1ce55f990d5.png" 
          alt="Beautiq Logo" 
          className="w-96" 
        />
      </div>
      <p className="text-gray-500 text-center mb-6">Salonunuzdaki güncel durumu buradan takip edebilirsiniz.</p>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 max-w-4xl mx-auto">
        <StatCard
          title="Bugünkü Randevular"
          value={todayAppointments.length.toString()}
          icon={Calendar}
          showTrend={false}
        />
        <StatCard
          title="Bugünkü Satışlar"
          value={totalDailySales.toString()}
          icon={DollarSign}
          showTrend={false}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
        <div className="w-full">
          <UpcomingAppointments appointments={appointments} />
        </div>
        <div className="w-full">
          <SalesSummary />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
