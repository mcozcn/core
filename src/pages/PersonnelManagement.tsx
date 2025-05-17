
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CreatePersonnelForm from "@/components/personnel/CreatePersonnelForm";
import PersonnelList from "@/components/personnel/PersonnelList";
import StaffPerformanceDetail from "@/components/personnel/StaffPerformanceDetail";
import { getAllUsers } from "@/utils/auth";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { User } from "@/utils/auth";

const PersonnelManagement = () => {
  const [personnel, setPersonnel] = useState(getAllUsers());
  const [selectedStaff, setSelectedStaff] = useState<User | null>(null);
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

      <Tabs defaultValue="list" className="space-y-6">
        <TabsList className="w-full max-w-md">
          <TabsTrigger value="list" className="flex-1">Personel Listesi</TabsTrigger>
          <TabsTrigger value="performance" className="flex-1">Performans Takibi</TabsTrigger>
        </TabsList>
        
        <TabsContent value="list">
          <PersonnelList 
            personnel={personnel} 
            onUpdate={handlePersonnelUpdate} 
          />
        </TabsContent>
        
        <TabsContent value="performance">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {personnel.map(staff => (
              <Card 
                key={staff.id} 
                className={`cursor-pointer transition-all ${selectedStaff?.id === staff.id ? 'ring-2 ring-primary' : 'hover:bg-accent/10'}`}
                onClick={() => setSelectedStaff(staff)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: staff.color }}
                    />
                    <h3 className="font-medium">{staff.displayName}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{staff.title}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {selectedStaff ? (
            <StaffPerformanceDetail staff={selectedStaff} />
          ) : (
            <Card className="p-6 text-center text-muted-foreground">
              <p>Detaylı performans bilgisi görmek için bir personel seçin.</p>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PersonnelManagement;
