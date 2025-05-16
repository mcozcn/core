
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CreatePersonnelForm from "@/components/personnel/CreatePersonnelForm";
import PersonnelList from "@/components/personnel/PersonnelList";
import { getAllUsers } from "@/utils/auth";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";

const PersonnelManagement = () => {
  const [personnel, setPersonnel] = useState(getAllUsers());
  const queryClient = useQueryClient();

  const handlePersonnelUpdate = () => {
    setPersonnel(getAllUsers());
    // Invalidate staff performance queries to reflect the updated personnel
    queryClient.invalidateQueries({ queryKey: ['staffPerformance'] });
  };

  return (
    <div className="p-8 pl-72 animate-fadeIn">
      <div className="mb-8 flex justify-between items-center">
        <h1 className="text-4xl font-serif">Personel Yönetimi</h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              Yeni Personel Ekle
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[550px]">
            <CreatePersonnelForm onSuccess={handlePersonnelUpdate} />
          </DialogContent>
        </Dialog>
      </div>

      <PersonnelList personnel={personnel} onUpdate={handlePersonnelUpdate} />
    </div>
  );
};

export default PersonnelManagement;
