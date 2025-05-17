
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { Download, Upload, Database, RefreshCw, AlertTriangle } from "lucide-react";
import * as localStorage from "@/utils/localStorage";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import axios from "axios";

interface UpdateInfo {
  version: string;
  description: string;
  updateUrl: string;
  releaseDate: string;
  zipballUrl: string;
}

const GITHUB_REPO_URL = "https://api.github.com/repos/mcozcn/glam-appointment-keeper/releases/latest";
const CURRENT_VERSION = "1.0.0"; // Uygulama sürümü

const Backup = () => {
  const [backupData, setBackupData] = useState<string | null>(null);
  const [isCheckingForUpdates, setIsCheckingForUpdates] = useState(false);
  const [isUpdateAvailable, setIsUpdateAvailable] = useState(false);
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);

  useEffect(() => {
    // Uygulama açıldığında güncellemeleri otomatik kontrol et
    checkForUpdates(false);
  }, []);

  const checkForUpdates = async (showToast = true) => {
    setIsCheckingForUpdates(true);
    
    try {
      const response = await axios.get(GITHUB_REPO_URL);
      const latestRelease = response.data;
      
      // Sürüm karşılaştırması (basit string karşılaştırması)
      const latestVersion = latestRelease.tag_name.replace(/^v/, '');
      
      if (latestVersion > CURRENT_VERSION) {
        const newUpdateInfo: UpdateInfo = {
          version: latestVersion,
          description: latestRelease.body || "Yeni özellikler ve hata düzeltmeleri",
          updateUrl: latestRelease.html_url,
          releaseDate: new Date(latestRelease.published_at).toLocaleDateString('tr-TR'),
          zipballUrl: latestRelease.zipball_url,
        };
        
        setUpdateInfo(newUpdateInfo);
        setIsUpdateAvailable(true);
        
        if (showToast) {
          toast({
            title: "Yeni Güncelleme Mevcut",
            description: `Versiyon ${newUpdateInfo.version} kullanıma hazır.`,
          });
        }
      } else if (showToast) {
        toast({
          title: "Güncel",
          description: "En güncel sürümü kullanıyorsunuz.",
        });
      }
    } catch (error) {
      console.error("Güncelleme kontrolü başarısız:", error);
      if (showToast) {
        toast({
          variant: "destructive",
          title: "Güncelleme Kontrolü Başarısız",
          description: "Güncellemeler kontrol edilirken bir hata oluştu.",
        });
      }
    } finally {
      setIsCheckingForUpdates(false);
    }
  };

  const performUpdate = async () => {
    if (!updateInfo) return;
    
    setIsUpdating(true);
    
    try {
      // Bu kısım gerçek bir güncelleme sürecini simüle eder
      // Gerçek bir uygulamada, indirme, kurulum ve yeniden başlatma adımları olacaktır
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simülasyon
      
      setUpdateSuccess(true);
      toast({
        title: "Güncelleme Başarılı",
        description: `Versiyon ${updateInfo.version} başarıyla yüklendi.`,
      });
    } catch (error) {
      console.error("Güncelleme başarısız:", error);
      toast({
        variant: "destructive",
        title: "Güncelleme Başarısız",
        description: "Güncelleme sırasında bir hata oluştu.",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const closeUpdateDialog = () => {
    setIsUpdateDialogOpen(false);
    
    if (updateSuccess) {
      // Başarılı güncellemeden sonra sayfayı yenileyin (gerçek bir uygulamada)
      // window.location.reload();
      setUpdateSuccess(false);
    }
  };

  const createBackup = () => {
    try {
      const data = {
        appointments: localStorage.getAppointments(),
        customers: localStorage.getCustomers(),
        services: localStorage.getServices(),
        stock: localStorage.getStock(),
        sales: localStorage.getSales(),
        serviceSales: localStorage.getServiceSales(),
        customerRecords: localStorage.getCustomerRecords(),
        payments: localStorage.getPayments(),
        costs: localStorage.getCosts(),
      };

      const jsonData = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonData], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      const date = new Date().toISOString().split("T")[0];
      link.download = `salon-yedek-${date}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Yedekleme Başarılı",
        description: "Verileriniz başarıyla yedeklendi.",
      });
    } catch (error) {
      console.error("Yedekleme hatası:", error);
      toast({
        variant: "destructive",
        title: "Yedekleme Hatası",
        description: "Veriler yedeklenirken bir hata oluştu.",
      });
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setBackupData(e.target?.result as string);
      };
      reader.readAsText(file);
    }
  };

  const restoreBackup = () => {
    if (!backupData) return;

    try {
      const data = JSON.parse(backupData);

      // Validate backup data structure
      const requiredKeys = [
        "appointments",
        "customers",
        "services",
        "stock",
        "sales",
        "serviceSales",
        "customerRecords",
        "payments",
        "costs",
      ];

      const hasAllKeys = requiredKeys.every((key) => key in data);
      if (!hasAllKeys) {
        throw new Error("Geçersiz yedek dosyası formatı");
      }

      // Restore all data
      localStorage.setAppointments(data.appointments);
      localStorage.setCustomers(data.customers);
      localStorage.setServices(data.services);
      localStorage.setStock(data.stock);
      localStorage.setSales(data.sales);
      localStorage.setServiceSales(data.serviceSales);
      localStorage.setCustomerRecords(data.customerRecords);
      localStorage.setPayments(data.payments);
      localStorage.setCosts(data.costs);

      toast({
        title: "Geri Yükleme Başarılı",
        description: "Verileriniz başarıyla geri yüklendi.",
      });

      // Clear the selected backup data
      setBackupData(null);
      
      // Reset the file input
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      if (fileInput) fileInput.value = "";
    } catch (error) {
      console.error("Geri yükleme hatası:", error);
      toast({
        variant: "destructive",
        title: "Geri Yükleme Hatası",
        description: "Veriler geri yüklenirken bir hata oluştu.",
      });
    }
  };

  return (
    <div className="p-8 pl-72 animate-fadeIn">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Veri Yedekleme ve Geri Yükleme</h1>
        <p className="text-gray-500">
          Salon verilerinizi yedekleyebilir ve gerektiğinde geri yükleyebilirsiniz.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Card className="p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Download className="w-6 h-6 text-primary" />
            <h2 className="text-xl font-semibold">Veri Yedekleme</h2>
          </div>
          <p className="text-gray-500 mb-6">
            Tüm salon verilerinizi bilgisayarınıza yedekleyin.
          </p>
          <Button onClick={createBackup} className="w-full">
            <Database className="mr-2" />
            Verileri Yedekle
          </Button>
        </Card>

        <Card className="p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Upload className="w-6 h-6 text-primary" />
            <h2 className="text-xl font-semibold">Veri Geri Yükleme</h2>
          </div>
          <p className="text-gray-500 mb-6">
            Daha önce yedeklediğiniz verileri geri yükleyin.
          </p>
          <div className="space-y-4">
            <input
              type="file"
              accept=".json"
              onChange={handleFileSelect}
              className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary/90 cursor-pointer"
            />
            <Button
              onClick={restoreBackup}
              disabled={!backupData}
              className="w-full"
              variant={backupData ? "default" : "secondary"}
            >
              <Database className="mr-2" />
              Verileri Geri Yükle
            </Button>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center space-x-2 mb-4">
            <RefreshCw className="w-6 h-6 text-primary" />
            <h2 className="text-xl font-semibold">Uygulama Güncelleme</h2>
          </div>
          <p className="text-gray-500 mb-6">
            GitHub'dan en son sürümü kontrol edin ve güncellemeleri yükleyin.
          </p>
          <div className="space-y-4">
            <Button 
              onClick={() => checkForUpdates(true)}
              disabled={isCheckingForUpdates}
              className="w-full mb-2"
            >
              <RefreshCw className={`mr-2 ${isCheckingForUpdates ? 'animate-spin' : ''}`} />
              {isCheckingForUpdates ? 'Kontrol Ediliyor...' : 'Güncellemeleri Kontrol Et'}
            </Button>
            
            {isUpdateAvailable && (
              <Button 
                onClick={() => setIsUpdateDialogOpen(true)} 
                variant="outline" 
                className="w-full bg-yellow-50 border-yellow-200 text-yellow-700 hover:bg-yellow-100"
              >
                <AlertTriangle className="mr-2 text-yellow-500" />
                Yeni Sürüm Mevcut: v{updateInfo?.version}
              </Button>
            )}
          </div>
        </Card>
      </div>

      {/* Güncelleme Dialog */}
      <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Uygulama Güncellemesi</DialogTitle>
            <DialogDescription>
              GitHub'dan yeni bir güncelleme mevcut. Güncellemek istiyor musunuz?
            </DialogDescription>
          </DialogHeader>
          
          {updateInfo && !updateSuccess && (
            <div className="py-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium">Sürüm:</span>
                  <span>{updateInfo.version}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Tarih:</span>
                  <span>{updateInfo.releaseDate}</span>
                </div>
                <div className="border-t pt-2 mt-2">
                  <span className="font-medium block mb-1">Değişiklikler:</span>
                  <p className="text-sm text-muted-foreground whitespace-pre-line">{updateInfo.description}</p>
                </div>
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mt-4 text-sm text-yellow-800">
                <p>Güncelleme yapmadan önce verilerinizi yedeklemeniz önerilir.</p>
              </div>
            </div>
          )}
          
          {updateSuccess && (
            <div className="py-6 text-center">
              <div className="flex justify-center mb-4">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                  <RefreshCw className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <h3 className="text-lg font-medium mb-2">Güncelleme Başarılı!</h3>
              <p className="text-muted-foreground">
                Uygulama başarıyla güncellendi. Yeni özellikler için sayfayı yenileyin.
              </p>
            </div>
          )}
          
          <DialogFooter>
            {!updateSuccess ? (
              <>
                <Button 
                  variant="outline" 
                  onClick={closeUpdateDialog} 
                  disabled={isUpdating}
                >
                  İptal
                </Button>
                <Button 
                  onClick={performUpdate} 
                  disabled={isUpdating}
                >
                  {isUpdating ? 'Güncelleniyor...' : 'Güncelle'}
                </Button>
              </>
            ) : (
              <Button onClick={closeUpdateDialog} className="w-full">
                Tamam
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Backup;
