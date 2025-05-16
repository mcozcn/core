
import React from 'react';
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
} from "@/components/ui/alert-dialog"
import StockEntryForm from "@/components/stock/StockEntryForm";
import { addStockMovement } from "@/utils/localStorage";

interface StockEntryFormModalProps {
  showForm: boolean;
  setShowForm: (show: boolean) => void;
  stock: any[];
}

const StockEntryFormModal = ({ showForm, setShowForm, stock }: StockEntryFormModalProps) => {
  return (
    <AlertDialog open={showForm} onOpenChange={setShowForm}>
      <AlertDialogTrigger asChild>
        <div></div>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Stok Girişi Yap</AlertDialogTitle>
          <AlertDialogDescription>
            Lütfen aşağıdaki formu doldurarak stok girişini tamamlayın.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <StockEntryForm showForm={showForm} setShowForm={setShowForm} stock={stock} />
        <AlertDialogFooter>
          <AlertDialogCancel>İptal</AlertDialogCancel>
          <AlertDialogAction>Kaydet</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default StockEntryFormModal;
