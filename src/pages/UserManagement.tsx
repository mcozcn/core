import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAuthState, setAuthState } from "@/utils/auth";
import CreateUserForm from "@/components/users/CreateUserForm";
import UsersList from "@/components/users/UsersList";

const UserManagement = () => {
  const authState = getAuthState();

  const handleCreateUserSuccess = () => {
    // Yeni state'i al ve sayfayı güncelle
    const updatedState = getAuthState();
    setAuthState(updatedState);
  };

  const handleDeleteUser = (userId: number) => {
    const updatedState = getAuthState();
    updatedState.users = updatedState.users.filter(u => u.id !== userId);
    setAuthState(updatedState);
  };

  return (
    <div className="p-8 pl-72 animate-fadeIn">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Yeni Personel Oluştur</CardTitle>
        </CardHeader>
        <CardContent>
          <CreateUserForm onSuccess={handleCreateUserSuccess} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Mevcut Personeller</CardTitle>
        </CardHeader>
        <CardContent>
          <UsersList 
            users={authState.users}
            onDeleteUser={handleDeleteUser}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default UserManagement;