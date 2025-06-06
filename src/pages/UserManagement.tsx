
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import NewCreateUserForm from '@/components/users/NewCreateUserForm';
import NewUsersList from '@/components/users/NewUsersList';
import { User, getVisibleUsers, deleteUser } from '@/utils/storage/users';
import { useToast } from "@/components/ui/use-toast";
import { Users, UserPlus, Shield } from "lucide-react";

const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      // Sadece görünür kullanıcıları yükle (admin ve power user gizli)
      const visibleUsers = await getVisibleUsers();
      setUsers(visibleUsers);
      console.log('Loaded visible users:', visibleUsers);
    } catch (error) {
      console.error("Error loading users:", error);
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Kullanıcılar yüklenirken bir hata oluştu.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: number) => {
    try {
      const success = await deleteUser(userId);
      if (success) {
        await loadUsers();
        toast({
          title: "Başarılı",
          description: "Kullanıcı başarıyla silindi.",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Hata",
          description: "Bu kullanıcı silinemez.",
        });
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Kullanıcı silinirken bir hata oluştu.",
      });
    }
  };

  const handleUserCreated = async () => {
    await loadUsers();
  };

  const handleUserUpdated = async () => {
    await loadUsers();
  };

  return (
    <div className="p-8 pl-72 animate-fadeIn">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Shield className="h-8 w-8 text-primary" />
          <h1 className="text-4xl font-serif">Kullanıcı Yönetimi</h1>
        </div>
        <p className="text-muted-foreground">
          Personel kullanıcılarını yönetin ve yetkilendirmelerini düzenleyin
        </p>
      </div>

      <Tabs defaultValue="users" className="w-full space-y-6">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Kullanıcılar ({users.length})
          </TabsTrigger>
          <TabsTrigger value="create" className="flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            Yeni Kullanıcı
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Kayıtlı Kullanıcılar
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
                  <span className="ml-3">Kullanıcılar yükleniyor...</span>
                </div>
              ) : (
                <NewUsersList 
                  users={users}
                  onDeleteUser={handleDeleteUser}
                  onUserUpdated={handleUserUpdated}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="create" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="h-5 w-5" />
                Yeni Kullanıcı Oluştur
              </CardTitle>
            </CardHeader>
            <CardContent>
              <NewCreateUserForm onSuccess={handleUserCreated} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserManagement;
