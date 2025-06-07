
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { UserPlus, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getAllUsers } from '@/utils/auth';
import { User } from '@/utils/auth';
import CreatePersonnelForm from '@/components/personnel/CreatePersonnelForm';
import PersonnelList from '@/components/personnel/PersonnelList';

const Personnel = () => {
  const [personnel, setPersonnel] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadPersonnel();
  }, []);

  const loadPersonnel = () => {
    try {
      setLoading(true);
      const allUsers = getAllUsers();
      // Filter to show staff users (personnel)
      const staffUsers = allUsers.filter(user => user.role === 'staff');
      setPersonnel(staffUsers);
    } catch (error) {
      console.error('Error loading personnel:', error);
      toast({
        variant: 'destructive',
        title: 'Hata',
        description: 'Personel listesi yüklenemedi.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePersonnelUpdate = () => {
    loadPersonnel();
  };

  return (
    <div className="p-8 pl-72 animate-fadeIn">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Users className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-serif">Personel Yönetimi</h1>
          </div>
          <p className="text-muted-foreground">
            Personel ekleme, düzenleme ve yönetimi
          </p>
        </div>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              Yeni Personel Ekle
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[550px]">
            <CreatePersonnelForm onSuccess={handlePersonnelUpdate} />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Personel Listesi ({personnel.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
              <span className="ml-3">Yükleniyor...</span>
            </div>
          ) : (
            <PersonnelList 
              personnel={personnel} 
              onUpdate={handlePersonnelUpdate} 
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Personnel;
