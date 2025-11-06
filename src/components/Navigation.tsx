
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Calendar, Users, BarChart3, Package, DollarSign, CreditCard, ShoppingCart, Database, BarChart, Menu, User, LogOut, Clock, ChevronLeft, ChevronRight, Dumbbell, UserCheck, Activity, Target, Scale, ClipboardCheck } from "lucide-react";
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
    { to: "/", label: "Ana Sayfa", icon: BarChart3, permission: "dashboard" },
    { to: "/customers", label: "Üyeler", icon: Users, permission: "customers" },
    { to: "/appointments", label: "PT Seansları", icon: Dumbbell, permission: "appointments" },
    { to: "/services", label: "Grup Dersleri", icon: Activity, permission: "services" },
    { to: "/personnel", label: "Antrenörler", icon: UserCheck, permission: "personnel" },
    { to: "/check-in", label: "Giriş/Çıkış", icon: ClipboardCheck, permission: "check_in" },
    { to: "/body-metrics", label: "Vücut Ölçümleri", icon: Scale, permission: "body_metrics" },
    { to: "/membership-packages", label: "Üyelik Paketleri", icon: Target, permission: "membership_packages" },
    { to: "/payment-tracking", label: "Ödeme Takip", icon: Clock, permission: "payment_tracking" },
    { to: "/stock", label: "Ürün Yönetimi", icon: Package, permission: "stock" },
    { to: "/sales", label: "Satışlar", icon: ShoppingCart, permission: "sales" },
    { to: "/costs", label: "Masraflar", icon: DollarSign, permission: "costs" },
    { to: "/financial", label: "Finansal", icon: CreditCard, permission: "financial" },
    { to: "/reports", label: "Raporlar", icon: BarChart, permission: "reports" },
    { to: "/performance", label: "Performans", icon: BarChart3, permission: "performance" },
    { to: "/backup", label: "Yedekleme", icon: Database, permission: "backup" },
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
        <div className="flex flex-col items-center space-y-4">
          {/* Logo */}
          <div className="flex items-center justify-center w-full px-2">
            <img 
              src="/lovable-uploads/91cb1ad9-255c-44ce-9796-4e318446526e.png" 
              alt="Beautiq" 
              className={`${isCollapsed ? 'w-10 h-6' : 'w-44 h-24'} object-contain transition-all duration-300`}
            />
          </div>
          
          {/* Text and Collapse Button */}
          <div className="flex items-center justify-between w-full">
            {!isCollapsed && (
              <div className="text-center flex-1">
                <p className="text-xs font-semibold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  CORE FITNESS
                </p>
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
