
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Calendar, Users, BarChart3, Package, DollarSign, CreditCard, ShoppingCart, Database, BarChart, Menu, User, LogOut } from "lucide-react";
import { useState } from "react";
import { useAuth } from '@/contexts/AuthContext';
import { Button } from "./ui/button";

const Navigation = () => {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };
  
  const links = [
    { to: "/", label: "Panel", icon: BarChart3, permission: "dashboard" },
    { to: "/appointments", label: "Randevular", icon: Calendar, permission: "appointments" },
    { to: "/customers", label: "Müşteriler", icon: Users, permission: "customers" },
    { to: "/services", label: "Hizmetler", icon: Calendar, permission: "services" },
    { to: "/stock", label: "Stok Yönetimi", icon: Package, permission: "stock" },
    { to: "/sales", label: "Satışlar", icon: ShoppingCart, permission: "sales" },
    { to: "/costs", label: "Masraflar", icon: DollarSign, permission: "costs" },
    { to: "/financial", label: "Finansal Takip", icon: CreditCard, permission: "financial" },
    { to: "/reports", label: "Raporlar", icon: BarChart, permission: "reports" },
    { to: "/backup", label: "Yedekleme", icon: Database, permission: "backup" },
    { to: "/personnel", label: "Personel", icon: Users, permission: "personnel" },
    { to: "/performance", label: "Performans", icon: BarChart3, permission: "performance" },
  ];

  console.log('Navigation - User info:', {
    role: user?.role,
    allowedPages: user?.allowedPages,
    username: user?.username
  });

  // Filter links based on user permissions
  const allowedLinks = links.filter(link => {
    // Admin ve power_user kullanıcıları tüm linkleri görebilir
    if (user?.role === 'admin' || user?.role === 'power_user') {
      return true;
    }
    // Staff kullanıcıları sadece izinli sayfaları görebilir
    return user?.allowedPages?.includes(link.permission);
  });
  
  // Admin-only user management link (sadece admin görebilir)
  if (user?.role === 'admin') {
    allowedLinks.push({
      to: "/users",
      label: "Kullanıcılar",
      icon: User,
      permission: "users"
    });
  }

  console.log('Navigation - Visible links:', allowedLinks.map(l => l.label));

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
        {allowedLinks.map(({ to, label, icon: Icon }) => (
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
        
        {/* User info and logout button */}
        <div className={`mt-auto pt-4 border-t ${isCollapsed ? 'text-center' : ''}`}>
          {!isCollapsed && user && (
            <div className="px-4 py-2">
              <p className="font-medium">{user.displayName}</p>
              <p className="text-xs text-muted-foreground">
                {user.role === 'admin' ? 'Yönetici' : user.role === 'power_user' ? 'Power User' : 'Personel'}
              </p>
            </div>
          )}
          <Button
            variant="ghost"
            className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'justify-start px-4'} mt-2`}
            onClick={handleLogout}
          >
            <LogOut size={20} />
            {!isCollapsed && <span className="ml-3">Çıkış Yap</span>}
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
