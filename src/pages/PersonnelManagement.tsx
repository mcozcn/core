import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CreatePersonnelForm from '@/components/personnel/CreatePersonnelForm';
import PersonnelList from '@/components/personnel/PersonnelList';
import { getAllUsers } from '@/utils/auth';

const PersonnelManagement = () => {
  const [personnel, setPersonnel] = React.useState(getAllUsers());

  const handlePersonnelCreated = () => {
    setPersonnel(getAllUsers());
  };

  return (
    <div className="p-8 pl-72 animate-fadeIn">
      <div className="mb-8">
        <h1 className="text-4xl font-serif">Personel Yönetimi</h1>
      </div>

      <Tabs defaultValue="list" className="w-full">
        <TabsList>
          <TabsTrigger value="list">Personel Listesi</TabsTrigger>
          <TabsTrigger value="create">Yeni Personel</TabsTrigger>
        </TabsList>

        <TabsContent value="list">
          <PersonnelList personnel={personnel} onUpdate={() => setPersonnel(getAllUsers())} />
        </TabsContent>

        <TabsContent value="create">
          <CreatePersonnelForm onSuccess={handlePersonnelCreated} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PersonnelManagement;