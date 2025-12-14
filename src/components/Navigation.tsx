
import { Link, useLocation } from "react-router-dom";
import { Users, BarChart3, Package, DollarSign, CreditCard, ShoppingCart, Database, BarChart, Clock, ChevronLeft, ChevronRight, Activity, UserCheck, Scale, ClipboardCheck, Target, CalendarDays, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "./ui/sheet";
import { ScrollArea } from "./ui/scroll-area";
 import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from "@/hooks/use-mobile";
  import { useAuth } from '@/contexts/AuthContext';
  const { user, logout, isAuthenticated } = useAuth();

const Navigation = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const isMobile = useIsMobile();
  
  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const links = [
    { to: "/", label: "Ana Sayfa", icon: BarChart3 },
    { to: "/customers", label: "Üyeler", icon: Users },
    { to: "/calendar", label: "Antrenman Takvimi", icon: CalendarDays },
    { to: "/services", label: "Hizmetler", icon: Activity },
    { to: "/personnel", label: "Antrenörler", icon: UserCheck },
    { to: "/check-in", label: "Giriş/Çıkış", icon: ClipboardCheck },
    { to: "/body-metrics", label: "Vücut Ölçümleri", icon: Scale },
    { to: "/membership-packages", label: "Üyelik Paketleri", icon: Target },
    { to: "/payment-tracking", label: "Ödeme ve Üyelik Takip", icon: Clock },
    { to: "/stock", label: "Ürün Yönetimi", icon: Package },
    { to: "/sales", label: "Satışlar", icon: ShoppingCart },
    { to: "/costs", label: "Masraflar", icon: DollarSign },
    { to: "/financial", label: "Finansal", icon: CreditCard },
    { to: "/reports", label: "Raporlar", icon: BarChart },
    { to: "/performance", label: "Performans", icon: BarChart3 },
    { to: "/backup", label: "Yedekleme", icon: Database },
  ];

  const NavItem = ({ to, label, icon: Icon, onClick }: { to: string; label: string; icon: any; onClick?: () => void }) => {
    const isActive = location.pathname === to;
    
    if (isCollapsed && !isMobile) {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                to={to}
                onClick={onClick}
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
        onClick={onClick}
        className={`flex items-center space-x-3 px-3 py-3 rounded-lg transition-all duration-200 ${
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

  // Mobile Navigation
  if (isMobile) {
    return (
      <>
        {/* Mobile Header Bar */}
        <div className="fixed top-0 left-0 right-0 h-14 bg-background/95 backdrop-blur border-b border-border z-50 flex items-center justify-between px-4">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-10 w-10">
                <Menu size={24} />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0">
              <div className="flex flex-col h-full">
                {/* Logo */}
                <div className="p-4 border-b border-border">
                  <div className="flex items-center justify-center">
                    <img 
                      src="/lovable-uploads/core.png" 
                      alt="CORE" 
                      className="w-32 h-auto object-contain"
                    />
                  </div>
                  <p className="text-xs font-semibold text-center mt-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                    CORE FITNESS
                  </p>
                </div>
                
                {/* Navigation Links */}
                <ScrollArea className="flex-1 py-4">
                  <div className="space-y-1 px-3">
                    {links.map((link) => (
                      <NavItem 
                        key={link.to} 
                        to={link.to} 
                        label={link.label} 
                        icon={link.icon}
                        onClick={() => setMobileOpen(false)}
                      />
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </SheetContent>
          </Sheet>
          
          <img 
            src="/lovable-uploads/core.png" 
            alt="CORE" 
            className="h-8 object-contain"
          />
          
          <div className="w-10" /> {/* Spacer for centering */}
        </div>
        
        {/* Spacer to prevent content from going under fixed header */}
        <div className="h-14" />
      </>
    );
  }

  // Desktop Navigation
  return (
    <nav className={`fixed top-0 left-0 h-full ${isCollapsed ? 'w-16' : 'w-56'} bg-background/95 backdrop-blur border-r border-border shadow-lg transition-all duration-300 z-50 flex flex-col`}>
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex flex-col items-center space-y-4">
          {/* Logo */}
          <div className="flex items-center justify-center w-full px-2">
            <img 
              src="/lovable-uploads/core.png" 
              alt="CORE" 
              className={`${isCollapsed ? 'w-10 h-6' : 'w-44 h-24'} object-contain transition-all duration-300`}
            />
          </div>
          
          {/* Text and Collapse Button */}
                {isAuthenticated ? (
                  <button
                    onClick={async () => {
                      await logout();
                      toast({ title: 'Çıkış yapıldı', description: 'Oturum kapatıldı.' });
                      navigate('/');
                    }}
                    className="text-sm text-muted-foreground underline"
                  >
                    Çıkış Yap
                  </button>
                ) : (
                  <button onClick={() => navigate('/login')} className="text-sm text-muted-foreground underline">Giriş</button>
                )}
              <div className="ml-2">
                <button onClick={() => navigate('/login')} className="text-sm text-muted-foreground underline">
                  {user?.username === 'guest' ? 'Misafir' : user?.displayName || 'Giriş'}
                </button>
              </div>
                        </div>
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
          {links.map((link) => (
            <NavItem key={link.to} to={link.to} label={link.label} icon={link.icon} />
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
