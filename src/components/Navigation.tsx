import { Link, useLocation } from "react-router-dom";
import { Calendar, Users, Scissors, BarChart3, Package } from "lucide-react";

const Navigation = () => {
  const location = useLocation();
  
  const links = [
    { to: "/", label: "Panel", icon: BarChart3 },
    { to: "/appointments", label: "Randevular", icon: Calendar },
    { to: "/customers", label: "Müşteriler", icon: Users },
    { to: "/services", label: "Hizmetler", icon: Scissors },
    { to: "/stock", label: "Stok Yönetimi", icon: Package },
  ];

  return (
    <nav className="fixed top-0 left-0 h-full w-64 bg-white shadow-lg p-6">
      <div className="mb-8">
        <img 
          src="/lovable-uploads/b98e8cd9-86a0-4af7-b322-84c8d9d63a3d.png" 
          alt="Aslı Altınbaş Beauty Logo" 
          className="w-32 mx-auto mb-2"
        />
        <p className="text-sm text-gray-500 text-center">Salon Yönetimi</p>
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