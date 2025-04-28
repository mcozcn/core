
import { Link, useLocation } from "react-router-dom";
import { Calendar, Users, BarChart3, Package, DollarSign, CreditCard, ShoppingCart, Database } from "lucide-react";

const Navigation = () => {
  const location = useLocation();
  
  const links = [
    { to: "/", label: "Panel", icon: BarChart3 },
    { to: "/appointments", label: "Randevular", icon: Calendar },
    { to: "/customers", label: "Müşteriler", icon: Users },
    { to: "/stock", label: "Stok Yönetimi", icon: Package },
    { to: "/sales", label: "Satışlar", icon: ShoppingCart },
    { to: "/costs", label: "Masraflar", icon: DollarSign },
    { to: "/financial", label: "Finansal Takip", icon: CreditCard },
    { to: "/backup", label: "Yedekleme", icon: Database },
    { to: "/personnel", label: "Personel Yönetimi", icon: Users },
  ];

  return (
    <nav className="fixed top-0 left-0 h-full w-64 bg-background border-r border-border shadow-lg p-6">
      <div className="mb-8">
        <img 
          src="/lovable-uploads/18599c6d-da00-4149-814e-e1ce55f990d5.png" 
          alt="Beautiq Logo" 
          className="w-56 mx-auto mb-6"
        />
        <p className="text-sm text-muted-foreground text-center">Salon Yönetimi</p>
      </div>
      
      <div className="space-y-2">
        {links.map(({ to, label, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
              location.pathname === to
                ? "bg-primary text-primary-foreground"
                : "text-foreground hover:bg-accent hover:text-accent-foreground"
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

