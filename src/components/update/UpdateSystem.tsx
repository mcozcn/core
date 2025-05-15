
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "@/components/ui/use-toast";
import { Download, X, CheckCircle } from "lucide-react";

interface UpdateInfo {
  version: string;
  description: string;
  updateUrl: string;
  releaseDate: string;
}

const UpdateSystem = () => {
  const [isUpdateAvailable, setIsUpdateAvailable] = useState(false);
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateComplete, setUpdateComplete] = useState(false);

  // Check for updates when component mounts
  useEffect(() => {
    checkForUpdates();
    
    // Check for updates every hour
    const interval = setInterval(() => {
      checkForUpdates();
    }, 60 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  const checkForUpdates = async () => {
    try {
      // In a real implementation, this would be a call to your update server
      // For now, we'll simulate an available update
      const response = await simulateUpdateCheck();
      
      if (response.updateAvailable) {
        setUpdateInfo(response.updateInfo);
        setIsUpdateAvailable(true);
        setIsDialogOpen(true);
      }
    } catch (error) {
      console.error("Güncellemeleri kontrol ederken hata:", error);
    }
  };

  const simulateUpdateCheck = async (): Promise<{ updateAvailable: boolean; updateInfo: UpdateInfo }> => {
    // This is a simulation, in reality you would fetch from your server
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          updateAvailable: true,
          updateInfo: {
            version: "1.2.0",
            description: "Bu güncelleme yeni hizmet tipleri ve geliştirilmiş stok yönetimi özellikleri içermektedir.",
            updateUrl: "https://your-update-server.com/updates/v1.2.0",
            releaseDate: "2025-05-14"
          }
        });
      }, 1000);
    });
  };

  const handleUpdate = async () => {
    setIsUpdating(true);
    
    try {
      // In a real implementation, this would download and apply the update
      // while preserving user data
      await simulateUpdateProcess();
      
      setUpdateComplete(true);
      toast({
        title: "Güncelleme Başarılı",
        description: "Uygulama başarıyla güncellendi. Tüm verileriniz korundu.",
      });
    } catch (error) {
      console.error("Güncelleme sırasında hata:", error);
      toast({
        variant: "destructive",
        title: "Güncelleme Hatası",
        description: "Güncelleme sırasında bir hata oluştu. Lütfen tekrar deneyin.",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const simulateUpdateProcess = async (): Promise<void> => {
    // This is a simulation, in reality you would download and apply the update
    return new Promise((resolve) => {
      // Simulate a 3 second update process
      setTimeout(resolve, 3000);
    });
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    
    if (updateComplete) {
      // In a real implementation, you might want to refresh the page
      // or restart the application after the update
      window.location.reload();
    }
  };

  return (
    <>
      {isUpdateAvailable && (
        <Button 
          onClick={() => setIsDialogOpen(true)}
          className="fixed bottom-4 right-4 z-50 bg-orange-500 hover:bg-orange-600"
        >
          <Download className="mr-2 h-4 w-4" /> 
          Güncelleme Mevcut
        </Button>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Yeni Güncelleme Mevcut</DialogTitle>
            <DialogDescription>
              {updateInfo && (
                <div className="mt-2 space-y-2">
                  <p><strong>Versiyon:</strong> {updateInfo.version}</p>
                  <p><strong>Yayın Tarihi:</strong> {updateInfo.releaseDate}</p>
                  <p><strong>Açıklama:</strong> {updateInfo.description}</p>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>

          {updateComplete ? (
            <div className="flex flex-col items-center justify-center py-4">
              <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
              <p className="text-center font-medium">Güncelleme başarıyla tamamlandı!</p>
              <p className="text-center text-sm text-muted-foreground mt-1">
                Tüm verileriniz korundu. Yeni özellikleri kullanmak için uygulamayı yenileyin.
              </p>
            </div>
          ) : (
            <div className="py-4">
              <p className="text-center text-sm text-muted-foreground">
                Bu güncelleme tüm verilerinizi koruyarak yeni özellikleri yükleyecektir. 
                Güncelleme sırasında lütfen uygulamayı kapatmayın.
              </p>
            </div>
          )}

          <DialogFooter className="flex sm:justify-between">
            {!updateComplete && (
              <Button
                variant="outline"
                onClick={closeDialog}
                disabled={isUpdating}
              >
                <X className="mr-2 h-4 w-4" /> İptal
              </Button>
            )}
            
            {updateComplete ? (
              <Button onClick={closeDialog} className="w-full">
                Tamam
              </Button>
            ) : (
              <Button 
                onClick={handleUpdate} 
                disabled={isUpdating}
                className={isUpdating ? "animate-pulse" : ""}
              >
                <Download className="mr-2 h-4 w-4" /> 
                {isUpdating ? "Güncelleniyor..." : "Güncelle"}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default UpdateSystem;
