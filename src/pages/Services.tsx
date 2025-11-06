
import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getServices, setServices, type Service } from "@/utils/localStorage";
import ServiceList from '@/components/services/ServiceList';
import SearchInput from '@/components/common/SearchInput';
import EditServiceForm from "@/components/services/EditServiceForm";
import { FileText, Trash2, Edit } from "lucide-react";
import AddServiceFormModal from '@/components/services/AddServiceFormModal';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

const Services = () => {
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingService, setEditingService] = useState<Service | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: services = [] } = useQuery({
    queryKey: ['services'],
    queryFn: getServices,
  });

  const filteredServices = services.filter(service =>
    service.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteService = async (serviceId: number) => {
    try {
      const updatedServices = services.filter(s => s.id !== serviceId);
      setServices(updatedServices);
      queryClient.setQueryData(['services'], updatedServices);
      
      toast({
        title: "Hizmet silindi",
        description: "Hizmet başarıyla silindi.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Hizmet silinirken bir hata oluştu.",
      });
    }
  };

  return (
    <div className="p-8 pl-72 animate-fadeIn">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-4xl font-serif">Hizmet Yönetimi</h1>
        <Button onClick={() => setShowForm(true)} className="flex items-center gap-1">
          <FileText className="w-4 h-4 mr-1" />
          Yeni Hizmet Ekle
        </Button>
      </div>

      <div className="mb-6">
        <SearchInput
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Hizmet ara..."
        />
      </div>

      <AddServiceFormModal
        showForm={showForm}
        setShowForm={setShowForm}
        services={services}
      />

      {editingService && (
        <EditServiceForm
          service={editingService}
          showForm={!!editingService}
          setShowForm={(show) => !show && setEditingService(null)}
        />
      )}

      <div className="grid gap-4">
        {filteredServices.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">
              {searchTerm ? 'Arama sonucu bulunamadı' : 'Henüz hizmet eklenmemiş'}
            </p>
          </Card>
        ) : (
          filteredServices.map((service) => (
            <Card key={service.id} className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold">{service.name}</h3>
                  <p className="text-muted-foreground">{service.description}</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setEditingService(service)}
                    className="h-8 w-8"
                    title="Düzenle"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        title="Sil"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Hizmeti Sil</AlertDialogTitle>
                        <AlertDialogDescription>
                          Bu işlem geri alınamaz. "{service.name}" adlı hizmeti kalıcı olarak silmek istediğinizden emin misiniz?
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>İptal</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => handleDeleteService(service.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Sil
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
              <div className="flex gap-4 text-sm">
                <span>Fiyat: {service.price} ₺</span>
                {service.duration && <span>Süre: {service.duration} dk</span>}
                <span>Seans: {service.sessionCount}</span>
                <span>Tür: {service.type === 'recurring' ? 'Sürekli' : 'Tek Seferlik'}</span>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default Services;
