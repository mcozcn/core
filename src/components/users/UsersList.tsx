
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Trash2, Edit, Shield, User, Eye } from "lucide-react";
import { updateUserPermissions, type User } from "@/utils/storage/users";
import { useToast } from "@/components/ui/use-toast";

interface UsersListProps {
  users: User[];
  onDeleteUser: (userId: number) => void;
  onUserUpdated: () => void;
}

const UsersList = ({ users, onDeleteUser, onUserUpdated }: UsersListProps) => {
  const { toast } = useToast();
  const [editingUser, setEditingUser] = useState<number | null>(null);

  const pageLabels: Record<string, string> = {
    dashboard: "Ana Sayfa",
    appointments: "Randevular",
    customers: "Müşteriler",
    services: "Hizmetler",
    stock: "Stok",
    sales: "Satışlar",
    costs: "Masraflar",
    financial: "Finans",
    reports: "Raporlar",
    backup: "Yedekleme",
    personnel: "Personel",
    performance: "Performans"
  };

  const handlePermissionUpdate = async (userId: number, type: 'edit' | 'delete', value: boolean) => {
    try {
      await updateUserPermissions(userId, { [type === 'edit' ? 'canEdit' : 'canDelete']: value });
      
      toast({
        title: "Başarılı",
        description: "Kullanıcı yetkileri güncellendi",
      });
      
      onUserUpdated();
    } catch (error) {
      console.error("Error updating user permissions:", error);
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Kullanıcı yetkileri güncellenirken bir hata oluştu.",
      });
    }
  };

  const handleDeleteConfirm = async (userId: number) => {
    try {
      await onDeleteUser(userId);
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  if (users.length === 0) {
    return (
      <Card className="p-12 text-center">
        <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
          <User className="h-12 w-12 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium mb-2">Henüz kullanıcı yok</h3>
        <p className="text-muted-foreground mb-4">
          İlk personel kullanıcınızı oluşturmak için "Yeni Kullanıcı" sekmesini kullanın.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Kullanıcı</TableHead>
            <TableHead>Rol & Ünvan</TableHead>
            <TableHead>Yetkiler</TableHead>
            <TableHead>Erişim Sayfaları</TableHead>
            <TableHead className="text-right">İşlemler</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-medium"
                    style={{ backgroundColor: user.color }}
                  >
                    {user.displayName?.substring(0, 2).toUpperCase() || user.username.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-medium">{user.displayName || user.username}</div>
                    <div className="text-sm text-muted-foreground">@{user.username}</div>
                  </div>
                </div>
              </TableCell>

              <TableCell>
                <div className="space-y-1">
                  <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                    {user.role === 'admin' ? 'Yönetici' : 'Personel'}
                  </Badge>
                  {user.title && (
                    <div className="text-sm text-muted-foreground">{user.title}</div>
                  )}
                </div>
              </TableCell>

              <TableCell>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`edit-${user.id}`}
                      checked={user.canEdit}
                      onCheckedChange={(checked) => 
                        handlePermissionUpdate(user.id, 'edit', checked as boolean)
                      }
                      disabled={user.role === "admin"}
                    />
                    <Label htmlFor={`edit-${user.id}`} className="text-sm">Düzenleme</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`delete-${user.id}`}
                      checked={user.canDelete}
                      onCheckedChange={(checked) => 
                        handlePermissionUpdate(user.id, 'delete', checked as boolean)
                      }
                      disabled={user.role === "admin"}
                    />
                    <Label htmlFor={`delete-${user.id}`} className="text-sm">Silme</Label>
                  </div>
                </div>
              </TableCell>

              <TableCell>
                <div className="max-w-xs">
                  {user.role === 'admin' ? (
                    <Badge variant="default" className="flex items-center gap-1">
                      <Shield className="h-3 w-3" />
                      Tüm Sayfalara Erişim
                    </Badge>
                  ) : (
                    <div className="flex flex-wrap gap-1">
                      {user.allowedPages?.slice(0, 3).map(pageId => (
                        <Badge key={pageId} variant="outline" className="text-xs">
                          {pageLabels[pageId] || pageId}
                        </Badge>
                      ))}
                      {user.allowedPages && user.allowedPages.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{user.allowedPages.length - 3} daha
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              </TableCell>

              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingUser(editingUser === user.id ? null : user.id)}
                    disabled={user.role === "admin"}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="destructive"
                        size="sm"
                        disabled={user.role === "admin"}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Kullanıcıyı Sil</AlertDialogTitle>
                        <AlertDialogDescription>
                          <strong>{user.displayName || user.username}</strong> kullanıcısını silmek istediğinizden emin misiniz? 
                          Bu işlem geri alınamaz.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>İptal</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => handleDeleteConfirm(user.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Sil
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Detay Görünümü */}
      {editingUser && (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Kullanıcı Detayları
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(() => {
              const user = users.find(u => u.id === editingUser);
              if (!user) return null;
              
              return (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-3">Kullanıcı Bilgileri</h4>
                    <div className="space-y-2 text-sm">
                      <div><strong>Ad:</strong> {user.displayName}</div>
                      <div><strong>Kullanıcı Adı:</strong> {user.username}</div>
                      <div><strong>Ünvan:</strong> {user.title}</div>
                      <div><strong>Rol:</strong> {user.role === 'admin' ? 'Yönetici' : 'Personel'}</div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-3">Erişim Sayfaları</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {user.allowedPages?.map(pageId => (
                        <Badge key={pageId} variant="outline" className="justify-start">
                          {pageLabels[pageId] || pageId}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })()}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default UsersList;
