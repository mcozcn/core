import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";
import { getCurrentUser, register, getAuthState, setAuthState, User } from "@/utils/auth";
import { Trash2, UserPlus } from "lucide-react";

const AVAILABLE_PAGES = [
  { id: "dashboard", label: "Panel" },
  { id: "appointments", label: "Randevular" },
  { id: "customers", label: "Müşteriler" },
  { id: "services", label: "Hizmetler" },
  { id: "stock", label: "Stok Yönetimi" },
  { id: "sales", label: "Satışlar" },
  { id: "costs", label: "Masraflar" },
  { id: "financial", label: "Finansal Takip" },
  { id: "backup", label: "Yedekleme" },
];

const UserManagement = () => {
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [selectedPages, setSelectedPages] = useState<string[]>(["dashboard"]);
  const { toast } = useToast();
  const authState = getAuthState();

  const handleCreateUser = () => {
    if (!newUsername || !newPassword) {
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Kullanıcı adı ve şifre gereklidir",
      });
      return;
    }

    const newUser = register(newUsername, newPassword, "user");
    if (newUser) {
      // Kullanıcı izinlerini güncelle
      const updatedState = getAuthState();
      const userIndex = updatedState.users.findIndex(u => u.id === newUser.id);
      if (userIndex !== -1) {
        updatedState.users[userIndex] = {
          ...updatedState.users[userIndex],
          allowedPages: selectedPages
        };
        setAuthState(updatedState);
      }

      toast({
        title: "Başarılı",
        description: "Kullanıcı oluşturuldu",
      });
      setNewUsername("");
      setNewPassword("");
      setSelectedPages(["dashboard"]);
    }
  };

  const handleDeleteUser = (userId: number) => {
    const updatedState = getAuthState();
    updatedState.users = updatedState.users.filter(u => u.id !== userId);
    setAuthState(updatedState);
    
    toast({
      title: "Başarılı",
      description: "Kullanıcı silindi",
    });
  };

  const handlePageToggle = (pageId: string) => {
    setSelectedPages(current =>
      current.includes(pageId)
        ? current.filter(id => id !== pageId)
        : [...current, pageId]
    );
  };

  return (
    <div className="p-8 ml-64">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Yeni Kullanıcı Oluştur</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="username" className="text-sm font-medium">
                  Kullanıcı Adı
                </label>
                <Input
                  id="username"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium">
                  Şifre
                </label>
                <Input
                  id="password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Erişim İzinleri</label>
              <div className="grid grid-cols-3 gap-2">
                {AVAILABLE_PAGES.map((page) => (
                  <div key={page.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={page.id}
                      checked={selectedPages.includes(page.id)}
                      onCheckedChange={() => handlePageToggle(page.id)}
                    />
                    <label
                      htmlFor={page.id}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {page.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <Button onClick={handleCreateUser} className="w-full">
              <UserPlus className="mr-2 h-4 w-4" />
              Kullanıcı Oluştur
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Mevcut Kullanıcılar</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {authState.users.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div>
                  <p className="font-medium">{user.username}</p>
                  <p className="text-sm text-muted-foreground">
                    Rol: {user.role}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    İzinli Sayfalar: {user.allowedPages?.join(", ") || "Tümü"}
                  </p>
                </div>
                {user.role !== "admin" && (
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => handleDeleteUser(user.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserManagement;