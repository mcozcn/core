
import { Link, useLocation } from "react-router-dom";
import { Calendar, Users, BarChart3, Package, DollarSign, CreditCard, ShoppingCart, Database, BarChart, Menu } from "lucide-react";
import { useState } from "react";

const Navigation = () => {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  const links = [
    { to: "/", label: "Panel", icon: BarChart3 },
    { to: "/appointments", label: "Randevular", icon: Calendar },
    { to: "/customers", label: "Müşteriler", icon: Users },
    { to: "/stock", label: "Stok Yönetimi", icon: Package },
    { to: "/sales", label: "Satışlar", icon: ShoppingCart },
    { to: "/costs", label: "Masraflar", icon: DollarSign },
    { to: "/financial", label: "Finansal Takip", icon: CreditCard },
    { to: "/reports", label: "Raporlar", icon: BarChart },
    { to: "/backup", label: "Yedekleme", icon: Database },
    { to: "/personnel", label: "Personel Yönetimi", icon: Users },
  ];

  return (
    <nav className={`fixed top-0 left-0 h-full ${isCollapsed ? 'w-20' : 'w-64'} bg-background border-r border-border shadow-lg transition-all duration-300 z-50`}>
      <div className="absolute -right-4 top-4">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="bg-primary text-primary-foreground p-1 rounded-full shadow-md hover:bg-primary/90 transition-colors"
        >
          <Menu size={16} />
        </button>
      </div>
      
      <div className={`${isCollapsed ? 'p-2' : 'p-6'} mb-8`}>
        {!isCollapsed ? (
          <>
            <img 
              src="/lovable-uploads/18599c6d-da00-4149-814e-e1ce55f990d5.png" 
              alt="Beautiq Logo" 
              className="w-56 mx-auto mb-6"
            />
            <p className="text-sm text-muted-foreground text-center">Salon Yönetimi</p>
          </>
        ) : (
          <img 
            src="/lovable-uploads/18599c6d-da00-4149-814e-e1ce55f990d5.png" 
            alt="Beautiq Logo" 
            className="w-16 mx-auto mb-6"
          />
        )}
      </div>
      
      <div className="space-y-2 px-2">
        {links.map(({ to, label, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3 px-4'} py-3 rounded-lg transition-colors ${
              location.pathname === to
                ? "bg-primary text-primary-foreground"
                : "text-foreground hover:bg-accent hover:text-accent-foreground"
            }`}
          >
            <Icon size={20} />
            {!isCollapsed && <span>{label}</span>}
          </Link>
        ))}
      </div>
    </nav>
  );
};

export default Navigation;
