import { Link, useLocation } from "react-router-dom";
import { Calendar, Users, Scissors, BarChart3 } from "lucide-react";

const Navigation = () => {
  const location = useLocation();
  
  const links = [
    { to: "/", label: "Dashboard", icon: BarChart3 },
    { to: "/appointments", label: "Appointments", icon: Calendar },
    { to: "/customers", label: "Customers", icon: Users },
    { to: "/services", label: "Services", icon: Scissors },
  ];

  return (
    <nav className="fixed top-0 left-0 h-full w-64 bg-white shadow-lg p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-serif text-primary font-semibold">Bella Beauty</h1>
        <p className="text-sm text-gray-500">Salon Management</p>
      </div>
      
      <div className="space-y-2">
        {links.map(({ to, label, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
              location.pathname === to
                ? "bg-primary text-white"
                : "text-gray-600 hover:bg-accent"
            }`}
          >
            <Icon size={20} />
            <span>{label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
};

export default Navigation;