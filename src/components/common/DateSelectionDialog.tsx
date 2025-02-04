import React from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react";

interface DateSelectionDialogProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
}

const DateSelectionDialog = ({
  selectedDate,
  onDateSelect,
}: DateSelectionDialogProps) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [tempSelectedDate, setTempSelectedDate] = React.useState<Date>(selectedDate);

  const handleConfirm = () => {
    onDateSelect(tempSelectedDate);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-between bg-white hover:bg-gray-50 border-2 border-gray-200"
          type="button"
        >
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-4 w-4 text-primary" />
            <span>{format(selectedDate, 'd MMMM yyyy', { locale: tr })}</span>
          </div>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-serif">Tarih Seç</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <Calendar
            mode="single"
            selected={tempSelectedDate}
            onSelect={(date) => date && setTempSelectedDate(date)}
            className="rounded-md mx-auto"
          />
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setIsOpen(false);
              setTempSelectedDate(selectedDate);
            }}
          >
            İptal
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
          >
            Tamam
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DateSelectionDialog;