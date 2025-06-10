
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, Eye } from "lucide-react";
import { Personnel, deletePersonnel } from "@/utils/storage/personnel";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from "react";

interface PersonnelListProps {
  personnel: Personnel[];
  onUpdate: () => void;
  onPersonnelClick?: (person: Personnel) => void;
  onViewDetails?: (person: Personnel) => void;
}

const PersonnelList = ({ personnel, onUpdate, onPersonnelClick, onViewDetails }: PersonnelListProps) => {
  const { toast } = useToast();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedPersonnel, setSelectedPersonnel] = useState<Personnel | null>(null);

  const handleDeleteClick = (person: Personnel, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedPersonnel(person);
    setShowDeleteDialog(true);
  };

  const handleDelete = async () => {
    if (selectedPersonnel) {
      const success = await deletePersonnel(selectedPersonnel.id);
      if (success) {
        onUpdate();
        setShowDeleteDialog(false);
        setSelectedPersonnel(null);
        
        toast({
          title: "Başarılı",
          description: "Personel silindi",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Hata",
          description: "Personel silinemedi",
        });
      }
    }
  };

  const handlePersonnelClick = (person: Personnel) => {
    if (onPersonnelClick) {
      onPersonnelClick(person);
    } else if (onViewDetails) {
      onViewDetails(person);
    }
  };

  const handleViewDetailsClick = (person: Personnel, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onViewDetails) {
      onViewDetails(person);
    }
  };

  return (
    <div className="space-y-4">
      {personnel.map((person) => (
        <Card 
          key={person.id} 
          className="p-4 cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => handlePersonnelClick(person)}
        >
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <p className="font-medium">{person.name}</p>
                <div 
                  className="w-4 h-4 rounded-full" 
                  style={{ backgroundColor: person.color }}
                />
              </div>
              <p className="text-sm text-muted-foreground">
                {person.title} • %{person.commissionRate} komisyon
              </p>
              <p className="text-xs text-muted-foreground">
                {person.phone}
              </p>
            </div>
            
            <div className="flex gap-2">
              {onViewDetails && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={(e) => handleViewDetailsClick(person, e)}
                >
                  <Eye className="h-4 w-4" />
                </Button>
              )}
              <Button
                variant="destructive"
                size="icon"
                onClick={(e) => handleDeleteClick(person, e)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      ))}

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Personeli Sil</AlertDialogTitle>
            <AlertDialogDescription>
              {selectedPersonnel?.name} isimli personeli silmek istediğinizden emin misiniz?
              Bu işlem geri alınamaz.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>İptal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>
              Sil
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default PersonnelList;
