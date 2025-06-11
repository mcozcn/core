
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Calendar, Users, BarChart3, Package, DollarSign, CreditCard, ShoppingCart, Database, BarChart, Menu, User, LogOut, Clock, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { useAuth } from '@/contexts/AuthContext';
import { Button } from "./ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";

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
    { to: "/payment-tracking", label: "Ödeme Takip", icon: Clock, permission: "payment_tracking" },
    { to: "/stock", label: "Stok Yönetimi", icon: Package, permission: "stock" },
    { to: "/sales", label: "Satışlar", icon: ShoppingCart, permission: "sales" },
    { to: "/costs", label: "Masraflar", icon: DollarSign, permission: "costs" },
    { to: "/financial", label: "Finansal", icon: CreditCard, permission: "financial" },
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
    // Admin ve manager kullanıcıları tüm linkleri görebilir
    if (user?.role === 'admin' || user?.role === 'manager') {
      return true;
    }
    // User kullanıcıları sadece izinli sayfaları görebilir
    return user?.allowedPages?.includes(link.permission);
  });
  
  // Admin-only user management link
  if (user?.role === 'admin') {
    allowedLinks.push({
      to: "/users",
      label: "Kullanıcılar",
      icon: User,
      permission: "users"
    });
  }

  console.log('Navigation - Visible links:', allowedLinks.map(l => l.label));

  const NavItem = ({ to, label, icon: Icon }: { to: string; label: string; icon: any }) => {
    const isActive = location.pathname === to;
    
    if (isCollapsed) {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                to={to}
                className={`flex items-center justify-center h-10 w-10 rounded-lg transition-all duration-200 ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                }`}
              >
                <Icon size={18} />
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right" className="ml-2">
              {label}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    return (
      <Link
        to={to}
        className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
          isActive
            ? "bg-primary text-primary-foreground shadow-md"
            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
        }`}
      >
        <Icon size={18} />
        <span className="text-sm font-medium">{label}</span>
      </Link>
    );
  };

  return (
    <nav className={`fixed top-0 left-0 h-full ${isCollapsed ? 'w-16' : 'w-56'} bg-background/95 backdrop-blur border-r border-border shadow-lg transition-all duration-300 z-50 flex flex-col`}>
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex flex-col items-center space-y-3">
          {/* Logo */}
          <div className="flex items-center justify-center">
            <img 
              src="/lovable-uploads/18599c6d-da00-4149-814e-e1ce55f990d5.png" 
              alt="Beautiq" 
              className={`${isCollapsed ? 'w-8 h-8' : 'w-12 h-12'} object-contain transition-all duration-300`}
            />
          </div>
          
          {/* Text and Collapse Button */}
          <div className="flex items-center justify-between w-full">
            {!isCollapsed && (
              <div className="text-center flex-1">
                <h1 className="text-lg font-bold">Beautiq</h1>
                <p className="text-xs text-muted-foreground">Salon Yönetimi</p>
              </div>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="h-8 w-8 p-0 shrink-0"
            >
              {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            </Button>
          </div>
        </div>
      </div>
      
      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto py-4">
        <div className={`space-y-1 ${isCollapsed ? 'px-2' : 'px-3'}`}>
          {allowedLinks.map((link) => (
            <NavItem key={link.to} {...link} />
          ))}
        </div>
      </div>

      {/* User Section */}
      <div className="border-t border-border p-4">
        {!isCollapsed && user && (
          <div className="mb-3 px-3 py-2 bg-accent/50 rounded-lg">
            <p className="text-sm font-medium">{user.displayName}</p>
            <p className="text-xs text-muted-foreground">
              {user.role === 'admin' ? 'Yönetici' : user.role === 'manager' ? 'Manager' : 'Personel'}
            </p>
          </div>
        )}
        
        {isCollapsed ? (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-10 w-10 p-0"
                  onClick={handleLogout}
                >
                  <LogOut size={18} />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="ml-2">
                Çıkış Yap
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          <Button
            variant="ghost"
            className="w-full justify-start text-muted-foreground hover:text-foreground"
            onClick={handleLogout}
          >
            <LogOut size={18} className="mr-2" />
            Çıkış Yap
          </Button>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
