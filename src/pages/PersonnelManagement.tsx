import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import CreatePersonnelForm from "@/components/personnel/CreatePersonnelForm";
import PersonnelList from "@/components/personnel/PersonnelList";
import StaffPerformanceDetail from "@/components/personnel/StaffPerformanceDetail";
import { getAllUsers } from "@/utils/auth";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { UserPlus, Users, TrendingUp, Award } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { User } from "@/utils/auth";
import PersonnelDetailCard from "@/components/personnel/PersonnelDetailCard";

const PersonnelManagement = () => {
  const [personnel, setPersonnel] = useState(getAllUsers());
  const [selectedStaff, setSelectedStaff] = useState<User | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedPersonnel, setSelectedPersonnel] = useState<User | null>(null);
  const [showDetailCard, setShowDetailCard] = useState(false);
  const queryClient = useQueryClient();

  const handlePersonnelUpdate = () => {
    setPersonnel(getAllUsers());
    setShowCreateDialog(false);
    queryClient.invalidateQueries({ queryKey: ['staffPerformance'] });
  };

  const handleViewDetails = (person: User) => {
    setSelectedPersonnel(person);
    setShowDetailCard(true);
  };

  return (
    <div className="p-6 pl-72 animate-fadeIn space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif">Personel Yönetimi</h1>
          <p className="text-muted-foreground mt-1">Personel listesi ve performans takibi</p>
        </div>
        
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 gap-2">
              <UserPlus className="h-4 w-4" />
              Yeni Personel Ekle
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[550px]">
            <CreatePersonnelForm onSuccess={handlePersonnelUpdate} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500 rounded-lg">
                <Users className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Toplam Personel</p>
                <p className="text-2xl font-bold text-blue-600">{personnel.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500 rounded-lg">
                <TrendingUp className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Aktif Personel</p>
                <p className="text-2xl font-bold text-green-600">{personnel.filter(p => p.role === 'staff').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500 rounded-lg">
                <Award className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Seçili Personel</p>
                <p className="text-2xl font-bold text-purple-600">{selectedStaff ? '1' : '0'}</p>
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
            Personel Yönetimi
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="list" className="space-y-6">
            <TabsList className="grid grid-cols-2 w-full max-w-md">
              <TabsTrigger value="list" className="gap-2">
                <Users className="h-4 w-4" />
                Personel Listesi
              </TabsTrigger>
              <TabsTrigger value="performance" className="gap-2">
                <TrendingUp className="h-4 w-4" />
                Performans Takibi
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="list" className="space-y-4">
              <PersonnelList 
                personnel={personnel} 
                onUpdate={handlePersonnelUpdate} 
                onViewDetails={handleViewDetails}
              />
            </TabsContent>
            
            <TabsContent value="performance" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {personnel.map(staff => (
                  <Card 
                    key={staff.id} 
                    className={`cursor-pointer transition-all hover:shadow-md ${selectedStaff?.id === staff.id ? 'ring-2 ring-primary bg-primary/5' : 'hover:bg-accent/10'}`}
                    onClick={() => setSelectedStaff(staff)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div 
                            className="w-4 h-4 rounded-full" 
                            style={{ backgroundColor: staff.color }}
                          />
                          <div>
                            <h3 className="font-medium">{staff.displayName}</h3>
                            <p className="text-sm text-muted-foreground">{staff.title}</p>
                          </div>
                        </div>
                        {selectedStaff?.id === staff.id && (
                          <Badge variant="default">Seçili</Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              {selectedStaff ? (
                <StaffPerformanceDetail staff={selectedStaff} />
              ) : (
                <Card className="p-8 text-center">
                  <div className="space-y-3">
                    <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto" />
                    <h3 className="text-lg font-medium text-muted-foreground">Personel Seçin</h3>
                    <p className="text-muted-foreground">Detaylı performans bilgisi görmek için yukarıdan bir personel seçin.</p>
                  </div>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Personnel Detail Modal */}
      <Dialog open={showDetailCard} onOpenChange={setShowDetailCard}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          {selectedPersonnel && (
            <PersonnelDetailCard 
              personnel={selectedPersonnel} 
              onClose={() => setShowDetailCard(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PersonnelManagement;
