
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CreateUserForm from '@/components/users/CreateUserForm';
import UsersList from '@/components/users/UsersList';
import { User, getUsers, deleteUser } from '@/utils/storage/users';

const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const loadedUsers = await getUsers();
        // Filter out admin user from the list for normal users
        setUsers(loadedUsers.filter(user => user.role !== 'admin' || user.username !== 'admin'));
        setLoading(false);
      } catch (error) {
        console.error("Error loading users:", error);
        setLoading(false);
      }
    };
    
    loadUsers();
  }, []);

  const handleDeleteUser = async (userId: number) => {
    try {
      await deleteUser(userId);
      // Reload users after deletion
      const updatedUsers = await getUsers();
      setUsers(updatedUsers.filter(user => user.role !== 'admin' || user.username !== 'admin'));
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  const handleUserCreated = async () => {
    try {
      const updatedUsers = await getUsers();
      setUsers(updatedUsers.filter(user => user.role !== 'admin' || user.username !== 'admin'));
    } catch (error) {
      console.error("Error reloading users:", error);
    }
  };

  return (
    <div className="p-8 pl-72 animate-fadeIn">
      <div className="mb-8">
        <h1 className="text-4xl font-serif">Kullanıcı Yönetimi</h1>
      </div>

      <Tabs defaultValue="users" className="w-full">
        <TabsList>
          <TabsTrigger value="users">Kullanıcılar</TabsTrigger>
          <TabsTrigger value="create">Yeni Kullanıcı</TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          {loading ? (
            <div className="text-center py-8">Kullanıcılar yükleniyor...</div>
          ) : (
            <UsersList 
              users={users}
              onDeleteUser={handleDeleteUser}
            />
          )}
        </TabsContent>

        <TabsContent value="create">
          <CreateUserForm onSuccess={handleUserCreated} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserManagement;
