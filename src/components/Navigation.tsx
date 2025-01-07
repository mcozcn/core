import { Link, useLocation } from "react-router-dom";
import { Calendar, Users, Scissors, BarChart3, Package, DollarSign, CreditCard, ShoppingCart, Database, Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

const Navigation = () => {
  const location = useLocation();
  const { theme, setTheme } = useTheme();
  
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

  console.log('Current theme:', theme); // Tema durumunu kontrol etmek için

  return (
    <nav className="fixed top-0 left-0 h-full w-64 bg-background border-r border-border shadow-lg p-6">
      <div className="mb-4">
        <img 
          src="/lovable-uploads/b98e8cd9-86a0-4af7-b322-84c8d9d63a3d.png" 
          alt="Aslı Altınbaş Beauty Logo" 
          className="w-56 mx-auto mb-4"
        />
        <Button
          variant="outline"
          size="icon"
          className="w-10 h-10 mx-auto mb-4 block hover:bg-accent"
          onClick={() => {
            const newTheme = theme === 'dark' ? 'light' : 'dark';
            console.log('Switching theme to:', newTheme); // Tema değişimini kontrol etmek için
            setTheme(newTheme);
          }}
        >
          {theme === 'dark' ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
          <span className="sr-only">Tema değiştir</span>
        </Button>
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