
import React from 'react';
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import { Service } from '@/utils/localStorage';

interface ServiceListProps {
  services: Service[];
  onEditService?: (service: Service) => void;
}

const ServiceList = ({ services, onEditService }: ServiceListProps) => {
  return (
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>İsim</TableHead>
            <TableHead>Fiyat</TableHead>
            <TableHead>Süre</TableHead>
            <TableHead>Seans Sayısı</TableHead>
            <TableHead>Tür</TableHead>
            <TableHead>Açıklama</TableHead>
            {onEditService && <TableHead className="w-[80px]">İşlem</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {services.length === 0 ? (
            <TableRow>
              <TableCell colSpan={onEditService ? 7 : 6} className="text-center text-muted-foreground">
                Henüz hizmet kaydı bulunmamaktadır.
              </TableCell>
            </TableRow>
          ) : (
            services.map((service) => (
              <TableRow key={service.id}>
                <TableCell>{service.name}</TableCell>
                <TableCell>{service.price} ₺</TableCell>
                <TableCell>{service.duration || '-'}</TableCell>
                <TableCell>{service.sessionCount || 1}</TableCell>
                <TableCell>{service.type === 'recurring' ? 'Sürekli' : 'Tek Seferlik'}</TableCell>
                <TableCell>{service.description}</TableCell>
                {onEditService && (
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEditService(service)}
                      className="h-8 w-8"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </TableCell>
                )}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </Card>
  );
};

export default ServiceList;
