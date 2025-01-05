import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { Download, Upload, Database } from "lucide-react";
import * as localStorage from "@/utils/localStorage";

const Backup = () => {
  const [backupData, setBackupData] = useState<string | null>(null);

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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
      </div>
    </div>
  );
};

export default Backup;