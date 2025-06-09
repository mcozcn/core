
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { UserPlus, Users, Search, Filter } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getAllUsers } from '@/utils/auth';
import { User } from '@/utils/auth';
import CreatePersonnelForm from '@/components/personnel/CreatePersonnelForm';
import PersonnelList from '@/components/personnel/PersonnelList';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

const Personnel = () => {
  const [personnel, setPersonnel] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadPersonnel();
  }, []);

  const loadPersonnel = () => {
    try {
      setLoading(true);
      const allUsers = getAllUsers();
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
    setShowCreateDialog(false);
  };

  const filteredPersonnel = personnel.filter(person =>
    person.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    person.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 pl-72 animate-fadeIn space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif">Personel Yönetimi</h1>
          <p className="text-muted-foreground mt-1">Personel ekleme, düzenleme ve yönetimi</p>
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
                <UserPlus className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Aktif Personel</p>
                <p className="text-2xl font-bold text-green-600">{personnel.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500 rounded-lg">
                <Filter className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Filtrelenen</p>
                <p className="text-2xl font-bold text-purple-600">{filteredPersonnel.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Personel Listesi ({filteredPersonnel.length})
            </CardTitle>
            
            {/* Search Bar */}
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Personel ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
              <span className="ml-3">Yükleniyor...</span>
            </div>
          ) : (
            <>
              {/* Quick Filters */}
              <div className="flex flex-wrap gap-2 mb-6">
                <Badge variant="outline" className="cursor-pointer hover:bg-accent">
                  Tümü ({personnel.length})
                </Badge>
                <Badge variant="outline" className="cursor-pointer hover:bg-accent text-blue-600">
                  Aktif ({personnel.length})
                </Badge>
              </div>
              
              <PersonnelList 
                personnel={filteredPersonnel} 
                onUpdate={handlePersonnelUpdate} 
              />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Personnel;
