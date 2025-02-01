import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";
import { getCurrentUser, register, getAuthState, setAuthState, updateUserPermissions, User } from "@/utils/auth";
import { Trash2, UserPlus } from "lucide-react";
import { Label } from "@/components/ui/label";
import { HexColorPicker } from "react-colorful";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

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
  const [displayName, setDisplayName] = useState("");
  const [selectedColor, setSelectedColor] = useState("#aabbcc");
  const [selectedPages, setSelectedPages] = useState<string[]>(["dashboard"]);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const { toast } = useToast();
  const authState = getAuthState();

  const handleCreateUser = () => {
    if (!newUsername || !newPassword || !displayName) {
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Tüm alanları doldurun",
      });
      return;
    }

    const newUser = register(
      newUsername, 
      newPassword, 
      "user", 
      displayName,
      selectedColor,
      selectedPages
    );

    if (newUser) {
      toast({
        title: "Başarılı",
        description: "Kullanıcı oluşturuldu",
      });
      setNewUsername("");
      setNewPassword("");
      setDisplayName("");
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

  const handlePermissionUpdate = (userId: number, type: 'edit' | 'delete', value: boolean) => {
    updateUserPermissions(userId, { [type === 'edit' ? 'canEdit' : 'canDelete']: value });
    
    toast({
      title: "Başarılı",
      description: "Kullanıcı yetkileri güncellendi",
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
    <div className="p-8 pl-72 animate-fadeIn">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Yeni Personel Oluştur</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="username">Kullanıcı Adı</Label>
                <Input
                  id="username"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Şifre</Label>
                <Input
                  id="password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="displayName">Görünen Ad</Label>
              <Input
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Personelin görünen adı"
              />
            </div>

            <div className="space-y-2">
              <Label>Personel Rengi</Label>
              <Popover open={showColorPicker} onOpenChange={setShowColorPicker}>
                <PopoverTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    style={{ backgroundColor: selectedColor }}
                  >
                    Renk Seç
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <HexColorPicker
                    color={selectedColor}
                    onChange={setSelectedColor}
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="space-y-2">
              <Label>Erişim İzinleri</Label>
              <div className="grid grid-cols-3 gap-2">
                {AVAILABLE_PAGES.map((page) => (
                  <div key={page.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={page.id}
                      checked={selectedPages.includes(page.id)}
                      onCheckedChange={() => handlePageToggle(page.id)}
                    />
                    <Label
                      htmlFor={page.id}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {page.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <Button onClick={handleCreateUser} className="w-full">
              <UserPlus className="mr-2 h-4 w-4" />
              Personel Oluştur
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Mevcut Personeller</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {authState.users.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <p className="font-medium">{user.displayName || user.username}</p>
                    {user.color && (
                      <div 
                        className="w-4 h-4 rounded-full" 
                        style={{ backgroundColor: user.color }}
                      />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Rol: {user.role}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    İzinli Sayfalar: {user.allowedPages?.join(", ") || "Tümü"}
                  </p>
                </div>
                
                {user.role !== "admin" && (
                  <div className="flex items-center space-x-4">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`edit-${user.id}`}
                          checked={user.canEdit}
                          onCheckedChange={(checked) => 
                            handlePermissionUpdate(user.id, 'edit', checked as boolean)
                          }
                        />
                        <Label htmlFor={`edit-${user.id}`}>Düzenleme</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`delete-${user.id}`}
                          checked={user.canDelete}
                          onCheckedChange={(checked) => 
                            handlePermissionUpdate(user.id, 'delete', checked as boolean)
                          }
                        />
                        <Label htmlFor={`delete-${user.id}`}>Silme</Label>
                      </div>
                    </div>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => handleDeleteUser(user.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
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