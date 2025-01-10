import { Link, useLocation, useNavigate } from "react-router-dom";
import { Calendar, Users, Scissors, BarChart3, Package, DollarSign, CreditCard, ShoppingCart, Database, LogOut } from "lucide-react";
import { logout, getCurrentUser } from "@/utils/auth";
import { useToast } from "@/components/ui/use-toast";

const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const currentUser = getCurrentUser();
  
  const links = [
    { to: "/", label: "Panel", icon: BarChart3 },
    { to: "/appointments", label: "Randevular", icon: Calendar },
    { to: "/customers", label: "Müşteriler", icon: Users },
    { to: "/services", label: "Hizmetler", icon: Scissors },
    { to: "/stock", label: "Stok Yönetimi", icon: Package },
    { to: "/sales", label: "Satışlar", icon: ShoppingCart },
    { to: "/costs", label: "Masraflar", icon: DollarSign },
    { to: "/financial", label: "Finansal Takip", icon: CreditCard },
    { to: "/backup", label: "Yedekleme", icon: Database },
  ];

  const handleLogout = () => {
    logout();
    toast({
      title: "Çıkış yapıldı",
      description: "Başarıyla çıkış yaptınız",
    });
    navigate('/login');
  };

  return (
    <nav className="fixed top-0 left-0 h-full w-64 bg-background border-r border-border shadow-lg p-6">
      <div className="mb-8">
        <img 
          src="/lovable-uploads/b98e8cd9-86a0-4af7-b322-84c8d9d63a3d.png" 
          alt="Aslı Altınbaş Beauty Logo" 
          className="w-56 mx-auto mb-6"
        />
        <p className="text-sm text-muted-foreground text-center">Salon Yönetimi</p>
        {currentUser && (
          <p className="text-sm text-primary text-center mt-2">
            {currentUser.username} ({currentUser.role})
          </p>
        )}
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

      <button
        onClick={handleLogout}
        className="flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors text-foreground hover:bg-accent hover:text-accent-foreground mt-8 w-full"
      >
        <LogOut size={20} />
        <span>Çıkış Yap</span>
      </button>
    </nav>
  );
};

export default Navigation;