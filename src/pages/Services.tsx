
import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { getServices, type Service } from "@/utils/localStorage";
import ServiceList from '@/components/services/ServiceList';
import SearchInput from '@/components/common/SearchInput';
import EditServiceForm from "@/components/services/EditServiceForm";
import { FileText } from "lucide-react";
import AddServiceFormModal from '@/components/services/AddServiceFormModal';

const Services = () => {
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingService, setEditingService] = useState<Service | null>(null);

  const { data: services = [] } = useQuery({
    queryKey: ['services'],
    queryFn: getServices,
  });

  const filteredServices = services.filter(service =>
    service.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        {filteredServices.map((service) => (
          <Card key={service.id} className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold">{service.name}</h3>
                <p className="text-muted-foreground">{service.description}</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setEditingService(service)}
                className="h-8 w-8"
              >
                <FileText className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex gap-4 text-sm">
              <span>Fiyat: {service.price} ₺</span>
              {service.duration && <span>Süre: {service.duration}</span>}
              <span>Seans: {service.sessionCount}</span>
              <span>Tür: {service.type === 'recurring' ? 'Sürekli' : 'Tek Seferlik'}</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Services;
