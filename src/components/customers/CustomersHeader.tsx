
import React from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import AddCustomerForm from './AddCustomerForm';

interface CustomersHeaderProps {
  showAddDialog: boolean;
  setShowAddDialog: (show: boolean) => void;
  onAddSuccess: () => void;
}

const CustomersHeader = ({ showAddDialog, setShowAddDialog, onAddSuccess }: CustomersHeaderProps) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 className="text-3xl font-serif">Müşteri Yönetimi</h1>
        <p className="text-muted-foreground mt-1">Müşterilerinizi yönetin ve ilişkilerinizi güçlendirin</p>
      </div>
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogTrigger asChild>
          <Button className="bg-primary hover:bg-primary/90 gap-2">
            <Plus className="h-4 w-4" />
            Yeni Müşteri
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Yeni Müşteri Ekle</DialogTitle>
          </DialogHeader>
          <AddCustomerForm onSuccess={onAddSuccess} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CustomersHeader;
