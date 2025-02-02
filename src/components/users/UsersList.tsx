import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Trash2 } from "lucide-react";
import { User, updateUserPermissions } from "@/utils/auth";
import { useToast } from "@/components/ui/use-toast";

interface UsersListProps {
  users: User[];
  onDeleteUser: (userId: number) => void;
}

const UsersList = ({ users, onDeleteUser }: UsersListProps) => {
  const { toast } = useToast();

  const handlePermissionUpdate = (userId: number, type: 'edit' | 'delete', value: boolean) => {
    updateUserPermissions(userId, { [type === 'edit' ? 'canEdit' : 'canDelete']: value });
    
    toast({
      title: "Başarılı",
      description: "Kullanıcı yetkileri güncellendi",
    });
  };

  return (
    <div className="space-y-4">
      {users.map((user) => (
        <div
          key={user.id}
          className="flex items-center justify-between p-4 border rounded-lg"
        >
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <p className="font-medium">{user.displayName || user.username}</p>
              {user.color && (
                <div 
                  className="w-4 h-4 rounded-full" 
                  style={{ backgroundColor: user.color }}
                />
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              Rol: {user.role}
            </p>
            <p className="text-sm text-muted-foreground">
              İzinli Sayfalar: {user.allowedPages?.join(", ") || "Tümü"}
            </p>
          </div>
          
          {user.role !== "admin" && (
            <div className="flex items-center space-x-4">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={`edit-${user.id}`}
                    checked={user.canEdit}
                    onCheckedChange={(checked) => 
                      handlePermissionUpdate(user.id, 'edit', checked as boolean)
                    }
                  />
                  <Label htmlFor={`edit-${user.id}`}>Düzenleme</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={`delete-${user.id}`}
                    checked={user.canDelete}
                    onCheckedChange={(checked) => 
                      handlePermissionUpdate(user.id, 'delete', checked as boolean)
                    }
                  />
                  <Label htmlFor={`delete-${user.id}`}>Silme</Label>
                </div>
              </div>
              <Button
                variant="destructive"
                size="icon"
                onClick={() => onDeleteUser(user.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default UsersList;