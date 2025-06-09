
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import UserForm from '@/components/users/UserForm';
import UserList from '@/components/users/UserList';
import { getVisibleUsers } from '@/utils/storage/userManager';
import { useToast } from '@/hooks/use-toast';
import { User } from '@/utils/storage/types'; // Changed from '@/types/user' to use the correct type
import { Users, UserPlus, Shield, Search, Settings } from 'lucide-react';

const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const visibleUsers = await getVisibleUsers();
      setUsers(visibleUsers);
    } catch (error) {
      console.error('Error loading users:', error);
      toast({
        variant: 'destructive',
        title: 'Hata',
        description: 'Kullanıcılar yüklenemedi.'
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user =>
    user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 pl-72 animate-fadeIn space-y-6">
      {/* Header Section */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3 mb-2">
          <Shield className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-serif">Kullanıcı Yönetimi</h1>
        </div>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Personel kullanıcılarını yönetin ve yetkilendirmeleri düzenleyin
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500 rounded-lg">
                <Users className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Toplam Kullanıcı</p>
                <p className="text-2xl font-bold text-blue-600">{users.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500 rounded-lg">
                <Shield className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Admin</p>
                <p className="text-2xl font-bold text-green-600">{users.filter(u => u.role === 'admin').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-500 rounded-lg">
                <Settings className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Personel</p>
                <p className="text-2xl font-bold text-orange-600">{users.filter(u => u.role === 'staff').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500 rounded-lg">
                <Search className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Filtrelenen</p>
                <p className="text-2xl font-bold text-purple-600">{filteredUsers.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Kullanıcı Yönetimi
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="users" className="space-y-6">
            <TabsList className="grid grid-cols-2 w-full max-w-md">
              <TabsTrigger value="users" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Kullanıcılar ({filteredUsers.length})
              </TabsTrigger>
              <TabsTrigger value="create" className="flex items-center gap-2">
                <UserPlus className="h-4 w-4" />
                Yeni Kullanıcı
              </TabsTrigger>
            </TabsList>

            <TabsContent value="users" className="space-y-6">
              {/* Search Bar */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Kullanıcı ara..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Quick Filters */}
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="cursor-pointer hover:bg-accent">
                  Tümü ({users.length})
                </Badge>
                <Badge variant="outline" className="cursor-pointer hover:bg-accent text-green-600">
                  Admin ({users.filter(u => u.role === 'admin').length})
                </Badge>
                <Badge variant="outline" className="cursor-pointer hover:bg-accent text-blue-600">
                  Personel ({users.filter(u => u.role === 'staff').length})
                </Badge>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
                  <span className="ml-3">Yükleniyor...</span>
                </div>
              ) : (
                <UserList users={filteredUsers} onUserUpdated={loadUsers} />
              )}
            </TabsContent>

            <TabsContent value="create" className="space-y-4">
              <div className="bg-accent/20 p-6 rounded-lg">
                <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                  <UserPlus className="h-5 w-5" />
                  Yeni Kullanıcı Oluştur
                </h3>
                <UserForm onSuccess={loadUsers} />
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserManagement;
