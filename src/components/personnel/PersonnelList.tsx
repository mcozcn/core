
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, Eye } from "lucide-react";
import { User, deleteUser } from "@/utils/storage/userManager";
import { useToast } from "@/components/ui/use-toast";
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
  personnel: User[];
  onUpdate: () => void;
  onViewDetails: (person: User) => void;
}

const PersonnelList = ({ personnel, onUpdate, onViewDetails }: PersonnelListProps) => {
  const { toast } = useToast();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedPersonnel, setSelectedPersonnel] = useState<User | null>(null);

  const handleDeleteClick = (person: User) => {
    setSelectedPersonnel(person);
    setShowDeleteDialog(true);
  };

  const handleDelete = async () => {
    if (selectedPersonnel) {
      const success = await deleteUser(selectedPersonnel.id);
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

  return (
    <div className="space-y-4">
      {personnel.map((person) => (
        <Card key={person.id} className="p-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <p className="font-medium">{person.displayName}</p>
                <div 
                  className="w-4 h-4 rounded-full" 
                  style={{ backgroundColor: person.color }}
                />
              </div>
              <p className="text-sm text-muted-foreground">
                {person.title}
              </p>
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => onViewDetails(person)}
              >
                <Eye className="h-4 w-4" />
              </Button>
              
              <Button
                variant="destructive"
                size="icon"
                onClick={() => handleDeleteClick(person)}
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
              {selectedPersonnel?.displayName} isimli personeli silmek istediğinizden emin misiniz?
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
