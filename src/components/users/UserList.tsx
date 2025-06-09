
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { deleteUser, updateUser, type User } from '@/utils/storage/userManager';
import { Trash2, Eye, EyeOff, User as UserIcon } from 'lucide-react';

interface UserListProps {
  users: User[];
  onUserUpdated: () => void;
  currentUser: User | null;
  canEdit: boolean;
}

const UserList = ({ users, onUserUpdated, currentUser, canEdit }: UserListProps) => {
  const { toast } = useToast();
  const [expandedUser, setExpandedUser] = useState<number | null>(null);

  const handleDelete = async (userId: number) => {
    try {
      const success = await deleteUser(userId);
      if (success) {
        toast({
          title: 'Başarılı',
          description: 'Kullanıcı silindi.'
        });
        onUserUpdated();
      } else {
        toast({
          variant: 'destructive',
          title: 'Hata',
          description: 'Kullanıcı silinemedi.'
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Hata',
        description: 'Bir hata oluştu.'
      });
    }
  };

  const getRoleBadge = (role: string) => {
    const variants = {
      admin: 'default',
      manager: 'secondary',
      user: 'outline'
    } as const;
    
    const labels = {
      admin: 'Yönetici',
      manager: 'Manager',
      user: 'Personel'
    };
    
    return (
      <Badge variant={variants[role as keyof typeof variants] || 'outline'}>
        {labels[role as keyof typeof labels] || role}
      </Badge>
    );
  };

  if (users.length === 0) {
    return (
      <Card className="p-12 text-center">
        <UserIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">Henüz kullanıcı yok</h3>
        <p className="text-muted-foreground">İlk kullanıcınızı oluşturun.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Kullanıcı</TableHead>
            <TableHead>Rol</TableHead>
            <TableHead>Sayfa Sayısı</TableHead>
            <TableHead>Son Giriş</TableHead>
            {canEdit && <TableHead className="text-right">İşlemler</TableHead>}
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
                    {user.displayName.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-medium">{user.displayName}</div>
                    <div className="text-sm text-muted-foreground">@{user.username}</div>
                    {user.title && (
                      <div className="text-xs text-muted-foreground">{user.title}</div>
                    )}
                  </div>
                </div>
              </TableCell>

              <TableCell>
                {getRoleBadge(user.role)}
              </TableCell>

              <TableCell>
                <Badge variant="outline">
                  {user.allowedPages.length} sayfa
                </Badge>
              </TableCell>

              <TableCell>
                <div className="text-sm">
                  {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString('tr-TR') : 'Henüz giriş yok'}
                </div>
              </TableCell>

              {canEdit && (
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setExpandedUser(expandedUser === user.id ? null : user.id)}
                    >
                      {expandedUser === user.id ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Kullanıcıyı Sil</AlertDialogTitle>
                          <AlertDialogDescription>
                            <strong>{user.displayName}</strong> kullanıcısını silmek istediğinizden emin misiniz?
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>İptal</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => handleDelete(user.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Sil
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {expandedUser && (
        <Card>
          <CardHeader>
            <CardTitle>Kullanıcı Detayları</CardTitle>
          </CardHeader>
          <CardContent>
            {(() => {
              const user = users.find(u => u.id === expandedUser);
              if (!user) return null;
              
              return (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-3">Bilgiler</h4>
                    <div className="space-y-2 text-sm">
                      <div><strong>Ad:</strong> {user.displayName}</div>
                      <div><strong>Kullanıcı Adı:</strong> {user.username}</div>
                      <div><strong>E-posta:</strong> {user.email}</div>
                      <div><strong>Ünvan:</strong> {user.title}</div>
                      <div><strong>Düzenleme:</strong> {user.canEdit ? 'Evet' : 'Hayır'}</div>
                      <div><strong>Silme:</strong> {user.canDelete ? 'Evet' : 'Hayır'}</div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-3">Erişim Sayfaları ({user.allowedPages.length})</h4>
                    <div className="flex flex-wrap gap-1">
                      {user.allowedPages.map(pageId => (
                        <Badge key={pageId} variant="outline" className="text-xs">
                          {pageId}
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

export default UserList;
