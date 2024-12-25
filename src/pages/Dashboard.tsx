import { Card } from "@/components/ui/card";
import { Calendar, Users, DollarSign, Clock } from "lucide-react";

const StatCard = ({ title, value, icon: Icon, trend }: { title: string; value: string; icon: any; trend?: string }) => (
  <Card className="p-6 card-hover">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <h3 className="text-2xl font-semibold mt-1">{value}</h3>
        {trend && <p className="text-xs text-green-500 mt-1">↑ {trend} from last month</p>}
      </div>
      <Icon className="text-primary" size={24} />
    </div>
  </Card>
);

const Dashboard = () => {
  return (
    <div className="p-8 pl-72 animate-fadeIn">
      <div className="mb-8">
        <h1 className="text-4xl font-serif mb-2">Welcome Back</h1>
        <p className="text-gray-500">Here's what's happening at your salon today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Today's Appointments"
          value="24"
          icon={Calendar}
          trend="12%"
        />
        <StatCard
          title="New Customers"
          value="156"
          icon={Users}
          trend="8%"
        />
        <StatCard
          title="Revenue"
          value="$2,845"
          icon={DollarSign}
          trend="15%"
        />
        <StatCard
          title="Avg. Service Time"
          value="45m"
          icon={Clock}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="p-6">
          <h2 className="text-xl font-serif mb-4">Upcoming Appointments</h2>
          <div className="space-y-4">
            {[
              { time: "10:00 AM", client: "Sarah Johnson", service: "Hair Coloring" },
              { time: "11:30 AM", client: "Emily Davis", service: "Manicure" },
              { time: "2:00 PM", client: "Michael Smith", service: "Haircut" },
            ].map((apt, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-accent rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="text-sm font-semibold">{apt.time}</div>
                  <div>
                    <div className="font-medium">{apt.client}</div>
                    <div className="text-sm text-gray-500">{apt.service}</div>
                  </div>
                </div>
                <button className="text-primary hover:text-primary/80">View</button>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-serif mb-4">Popular Services</h2>
          <div className="space-y-4">
            {[
              { name: "Hair Coloring", bookings: 45 },
              { name: "Manicure & Pedicure", bookings: 38 },
              { name: "Haircut & Styling", bookings: 32 },
            ].map((service, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-accent rounded-lg">
                <div className="font-medium">{service.name}</div>
                <div className="text-sm text-gray-500">{service.bookings} bookings</div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;