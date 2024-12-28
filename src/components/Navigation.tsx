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
        <h1 className="text-2xl font-serif font-semibold" style={{ color: '#D4AF37' }}>ASLI ALTINBAŞ BEAUTY</h1>
        <p className="text-sm text-gray-500">Salon Yönetimi</p>
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