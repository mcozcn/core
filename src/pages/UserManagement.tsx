import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CreateUserForm from '@/components/users/CreateUserForm';
import UsersList from '@/components/users/UsersList';
import UserPerformanceComponent from '@/components/users/UserPerformance';
import { getCurrentUser } from '@/utils/auth';

const UserManagement = () => {
  const currentUser = getCurrentUser();
  const isAdmin = currentUser?.role === 'admin';

  return (
    <div className="p-8 pl-72 animate-fadeIn">
      <div className="mb-8">
        <h1 className="text-4xl font-serif">Kullanıcı Yönetimi</h1>
      </div>

      <Tabs defaultValue="performance" className="w-full">
        <TabsList>
          <TabsTrigger value="performance">Performans</TabsTrigger>
          {isAdmin && (
            <>
              <TabsTrigger value="users">Kullanıcılar</TabsTrigger>
              <TabsTrigger value="create">Yeni Kullanıcı</TabsTrigger>
            </>
          )}
        </TabsList>

        <TabsContent value="performance">
          <UserPerformanceComponent />
        </TabsContent>

        {isAdmin && (
          <>
            <TabsContent value="users">
              <UsersList />
            </TabsContent>

            <TabsContent value="create">
              <CreateUserForm />
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  );
};

export default UserManagement;