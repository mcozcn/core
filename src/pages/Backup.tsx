
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Download, 
  Upload, 
  Database, 
  Shield, 
  Clock, 
  CheckCircle,
  AlertTriangle,
  FileText,
  HardDrive
} from 'lucide-react';

const Backup = () => {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const { toast } = useToast();

  const handleExport = async () => {
    setIsExporting(true);
    try {
      // Simulate export process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Yedekleme Başarılı",
        description: "Verileriniz başarıyla dışa aktarıldı.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Yedekleme sırasında bir hata oluştu.",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    try {
      // Simulate import process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Geri Yükleme Başarılı",
        description: "Verileriniz başarıyla geri yüklendi.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Geri yükleme sırasında bir hata oluştu.",
      });
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="p-6 pl-72 animate-fadeIn space-y-6">
      {/* Header Section */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3 mb-2">
          <Database className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-serif">Yedekleme ve Geri Yükleme</h1>
        </div>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Verilerinizi güvenli bir şekilde yedekleyin ve gerektiğinde geri yükleyin
        </p>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500 rounded-lg">
                <Database className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Veri Boyutu</p>
                <p className="text-2xl font-bold text-blue-600">2.4 MB</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500 rounded-lg">
                <CheckCircle className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Son Yedekleme</p>
                <p className="text-2xl font-bold text-green-600">Bugün</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-500 rounded-lg">
                <Shield className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Güvenlik</p>
                <p className="text-2xl font-bold text-orange-600">Yüksek</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500 rounded-lg">
                <HardDrive className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Otomatik Yedek</p>
                <p className="text-2xl font-bold text-purple-600">Aktif</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Export Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Veri Dışa Aktarma
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-accent/20 p-4 rounded-lg">
              <div className="flex items-start gap-3">
                <FileText className="h-5 w-5 text-blue-500 mt-0.5" />
                <div>
                  <h4 className="font-medium">Tam Yedekleme</h4>
                  <p className="text-sm text-muted-foreground">
                    Tüm verilerinizi JSON formatında dışa aktarın
                  </p>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span>Müşteriler:</span>
                <Badge variant="outline">125 kayıt</Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Randevular:</span>
                <Badge variant="outline">342 kayıt</Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Satışlar:</span>
                <Badge variant="outline">156 kayıt</Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Stok:</span>
                <Badge variant="outline">89 kayıt</Badge>
              </div>
            </div>

            <Button 
              onClick={handleExport} 
              disabled={isExporting}
              className="w-full"
              size="lg"
            >
              {isExporting ? (
                <>
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                  Dışa Aktarılıyor...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Verileri Dışa Aktar
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Import Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Veri Geri Yükleme
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-yellow-800 dark:text-yellow-200">Dikkat!</h4>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">
                    Geri yükleme işlemi mevcut verileri değiştirecektir
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Desteklenen format: JSON (.json)
              </p>
              <p className="text-sm text-muted-foreground">
                Maksimum dosya boyutu: 10 MB
              </p>
            </div>

            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
              <input
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
                id="backup-file"
                disabled={isImporting}
              />
              <label 
                htmlFor="backup-file" 
                className={`cursor-pointer ${isImporting ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  {isImporting ? 'Geri yükleniyor...' : 'Dosya seçmek için tıklayın'}
                </p>
              </label>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Backup History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Yedekleme Geçmişi
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { date: '9 Haziran 2025, 14:30', size: '2.4 MB', status: 'Başarılı' },
              { date: '8 Haziran 2025, 14:30', size: '2.3 MB', status: 'Başarılı' },
              { date: '7 Haziran 2025, 14:30', size: '2.2 MB', status: 'Başarılı' },
              { date: '6 Haziran 2025, 14:30', size: '2.1 MB', status: 'Başarılı' },
            ].map((backup, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-accent/20 rounded-lg">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <div>
                    <p className="font-medium">{backup.date}</p>
                    <p className="text-sm text-muted-foreground">Boyut: {backup.size}</p>
                  </div>
                </div>
                <Badge variant="secondary">{backup.status}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Backup;
