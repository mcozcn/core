import { useQuery } from "@tanstack/react-query";
import { getAppointments, getSales, getServiceSales } from "@/utils/localStorage";
import SalesSummary from "@/components/dashboard/SalesSummary";
import UpcomingAppointments from "@/components/dashboard/UpcomingAppointments";

const Dashboard = () => {
  const { data: appointments = [] } = useQuery({
    queryKey: ['appointments'],
    queryFn: () => {
      console.log('Fetching appointments for dashboard');
      return getAppointments();
    }
  });

  return (
    <div className="p-8 pl-72 animate-fadeIn">
      <div className="mb-8">
        <h1 className="text-5xl font-serif mb-4 text-center" style={{ color: '#D4AF37' }}>
          ASLI ALTINBAŞ BEAUTY
        </h1>
        <p className="text-gray-500 text-center">Salonunuzdaki güncel durumu buradan takip edebilirsiniz.</p>
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