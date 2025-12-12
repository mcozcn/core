
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
    <div className="p-4 md:p-8 md:pl-72 animate-fadeIn">
      <div className="mb-4 md:mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl md:text-4xl font-serif">Hizmet Yönetimi</h1>
        <Button onClick={() => setShowForm(true)} size="sm" className="flex items-center gap-1 w-full sm:w-auto">
          <FileText className="w-4 h-4 mr-1" />
          Yeni Hizmet Ekle
        </Button>
      </div>

      <div className="mb-4 md:mb-6">
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

      <div className="grid gap-3 md:gap-4">
        {filteredServices.length === 0 ? (
          <Card className="p-6 md:p-8 text-center">
            <p className="text-sm md:text-base text-muted-foreground">
              {searchTerm ? 'Arama sonucu bulunamadı' : 'Henüz hizmet eklenmemiş'}
            </p>
          </Card>
        ) : (
          filteredServices.map((service) => (
            <Card key={service.id} className="p-4 md:p-6">
              <div className="flex justify-between items-start mb-3 md:mb-4">
                <div className="flex-1 min-w-0 mr-2">
                  <h3 className="text-base md:text-lg font-semibold truncate">{service.name}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">{service.description}</p>
                </div>
                <div className="flex gap-1 md:gap-2 flex-shrink-0">
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
                    <AlertDialogContent className="w-[95vw] max-w-md">
                      <AlertDialogHeader>
                        <AlertDialogTitle>Hizmeti Sil</AlertDialogTitle>
                        <AlertDialogDescription>
                          Bu işlem geri alınamaz. "{service.name}" adlı hizmeti kalıcı olarak silmek istediğinizden emin misiniz?
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter className="flex-col sm:flex-row gap-2">
                        <AlertDialogCancel className="w-full sm:w-auto">İptal</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => handleDeleteService(service.id)}
                          className="w-full sm:w-auto bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Sil
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 md:gap-4 text-xs md:text-sm">
                <span className="bg-muted px-2 py-1 rounded">Fiyat: {service.price} ₺</span>
                {service.duration && <span className="bg-muted px-2 py-1 rounded">Süre: {service.duration} dk</span>}
                <span className="bg-muted px-2 py-1 rounded">Seans: {service.sessionCount}</span>
                <span className="bg-muted px-2 py-1 rounded">Tür: {service.type === 'recurring' ? 'Sürekli' : 'Tek Seferlik'}</span>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default Services;
