import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  Users, 
  LayoutDashboard, 
  DollarSign, 
  CreditCard, 
  Database, 
  Clock, 
  ChevronLeft, 
  ChevronRight, 
  UserCheck, 
  Scale, 
  ClipboardCheck, 
  Target, 
  CalendarDays, 
  Menu,
  LogOut,
  LogIn
} from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import { ScrollArea } from "./ui/scroll-area";
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from '@/contexts/AuthContext';
import { Separator } from "./ui/separator";

const Navigation = () => {
  const { logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const isMobile = useIsMobile();
  
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const mainLinks = [
    { to: "/", label: "Ana Sayfa", icon: LayoutDashboard },
    { to: "/customers", label: "Üyeler", icon: Users },
    { to: "/calendar", label: "Antrenman Takvimi", icon: CalendarDays },
    { to: "/membership-packages", label: "Üyelik Paketleri", icon: Target },
  ];

  const operationLinks = [
    { to: "/check-in", label: "Giriş/Çıkış", icon: ClipboardCheck },
    { to: "/body-metrics", label: "Vücut Ölçümleri", icon: Scale },
    { to: "/personnel", label: "Personel", icon: UserCheck },
  ];

  const financeLinks = [
    { to: "/payment-tracking", label: "Ödeme ve Üyelik Takip", icon: Clock },
    { to: "/costs", label: "Masraflar", icon: DollarSign },
    { to: "/financial", label: "Finansal", icon: CreditCard },
  ];

  const systemLinks = [
    { to: "/backup", label: "Yedekleme", icon: Database },
  ];

  const NavSection = ({ title, links, onClick }: { title: string; links: typeof mainLinks; onClick?: () => void }) => (
    <div className="space-y-1">
      {!isCollapsed && !isMobile && (
        <p className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          {title}
        </p>
      )}
      {links.map((link) => (
        <NavItem 
          key={link.to} 
          to={link.to} 
          label={link.label} 
          icon={link.icon}
          onClick={onClick}
        />
      ))}
    </div>
  );

  const NavItem = ({ to, label, icon: Icon, onClick }: { to: string; label: string; icon: React.ElementType; onClick?: () => void }) => {
    const isActive = location.pathname === to;
    
    if (isCollapsed && !isMobile) {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                to={to}
                onClick={onClick}
                className={`flex items-center justify-center h-11 w-11 rounded-xl mx-auto transition-all duration-200 ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                }`}
              >
                <Icon size={20} />
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right" className="ml-2 font-medium">
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
        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
          isActive
            ? "bg-primary text-primary-foreground shadow-md"
            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
        }`}
      >
        <Icon size={20} />
        <span className="text-sm font-medium">{label}</span>
      </Link>
    );
  };

  if (isMobile) {
    return (
      <>
        <div className="fixed top-0 left-0 right-0 h-16 bg-card/95 backdrop-blur-xl border-b border-border z-50 flex items-center justify-between px-4 shadow-sm">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl">
                <Menu size={22} />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0 border-r-0">
              <div className="flex flex-col h-full bg-card">
                <div className="p-5 border-b border-border">
                  <div className="flex items-center justify-center">
                    <img 
                      src="/lovable-uploads/core.png" 
                      alt="CORE" 
                      className="w-28 h-auto object-contain"
                    />
                  </div>
                </div>
                
                <ScrollArea className="flex-1 py-4 px-3">
                  <div className="space-y-6">
                    <NavSection title="Ana Menü" links={mainLinks} onClick={() => setMobileOpen(false)} />
                    <Separator />
                    <NavSection title="Operasyonlar" links={operationLinks} onClick={() => setMobileOpen(false)} />
                    <Separator />
                    <NavSection title="Finans" links={financeLinks} onClick={() => setMobileOpen(false)} />
                    <Separator />
                    <NavSection title="Sistem" links={systemLinks} onClick={() => setMobileOpen(false)} />
                  </div>
                </ScrollArea>

                <div className="p-4 border-t border-border">
                  {isAuthenticated ? (
                    <Button
                      variant="ghost"
                      className="w-full justify-start gap-3"
                      onClick={async () => {
                        await logout();
                        toast({ title: 'Çıkış yapıldı' });
                        navigate('/');
                        setMobileOpen(false);
                      }}
                    >
                      <LogOut size={20} />
                      <span>Çıkış Yap</span>
                    </Button>
                  ) : (
                    <Button
                      variant="ghost"
                      className="w-full justify-start gap-3"
                      onClick={() => {
                        navigate('/login');
                        setMobileOpen(false);
                      }}
                    >
                      <LogIn size={20} />
                      <span>Giriş Yap</span>
                    </Button>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
          
          <img 
            src="/lovable-uploads/core.png" 
            alt="CORE" 
            className="h-8 object-contain"
          />
          
          <div className="w-10" />
        </div>
        
        <div className="h-16" />
      </>
    );
  }

  return (
    <nav className={`fixed top-0 left-0 h-full ${isCollapsed ? 'w-[72px]' : 'w-60'} bg-card border-r border-border transition-all duration-300 z-50 flex flex-col shadow-lg`}>
      <div className="p-4 border-b border-border">
        <div className="flex flex-col items-center space-y-3">
          <div className="flex items-center justify-center w-full">
            <img 
              src="/lovable-uploads/core.png" 
              alt="CORE" 
              className={`${isCollapsed ? 'w-10 h-8' : 'w-32 h-16'} object-contain transition-all duration-300`}
            />
          </div>
          
          {!isCollapsed && (
            <div className="flex items-center justify-between w-full">
              {isAuthenticated ? (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-muted-foreground hover:text-foreground gap-1.5"
                  onClick={async () => {
                    await logout();
                    toast({ title: 'Çıkış yapıldı' });
                    navigate('/');
                  }}
                >
                  <LogOut size={14} />
                  Çıkış
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-muted-foreground hover:text-foreground gap-1.5"
                  onClick={() => navigate('/login')}
                >
                  <LogIn size={14} />
                  Giriş
                </Button>
              )}
              
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="h-8 w-8 rounded-lg"
              >
                <ChevronLeft size={16} />
              </Button>
            </div>
          )}
          
          {isCollapsed && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="h-8 w-8 rounded-lg"
            >
              <ChevronRight size={16} />
            </Button>
          )}
        </div>
      </div>
      
      <ScrollArea className="flex-1 py-4">
        <div className={`space-y-6 ${isCollapsed ? 'px-2' : 'px-3'}`}>
          <NavSection title="Ana Menü" links={mainLinks} />
          {!isCollapsed && <Separator />}
          <NavSection title="Operasyonlar" links={operationLinks} />
          {!isCollapsed && <Separator />}
          <NavSection title="Finans" links={financeLinks} />
          {!isCollapsed && <Separator />}
          <NavSection title="Sistem" links={systemLinks} />
        </div>
      </ScrollArea>
    </nav>
  );
};

export default Navigation;
