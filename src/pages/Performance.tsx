
import { useState } from "react";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import UserPerformanceComponent from "@/components/users/UserPerformance";
import CommissionReport from "@/components/reports/CommissionReport";
import { TrendingUp, Target, Award, BarChart3, Users, Calendar } from "lucide-react";

const Performance = () => {
  return (
    <div className="p-6 pl-72 animate-fadeIn space-y-6">
      {/* Header Section */}
      <div className="text-center space-y-4">
        <div>
          <h1 className="text-3xl font-serif">Personel Performans İzleme</h1>
          <p className="text-muted-foreground mt-1">Personel performansını detaylı olarak takip edin ve analiz edin</p>
        </div>
      </div>

      {/* Performance Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500 rounded-lg">
                <TrendingUp className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Ortalama Performans</p>
                <p className="text-2xl font-bold text-blue-600">94.2%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500 rounded-lg">
                <Target className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Hedef Tamamlama</p>
                <p className="text-2xl font-bold text-green-600">87%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-500 rounded-lg">
                <Award className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Müşteri Memnuniyeti</p>
                <p className="text-2xl font-bold text-orange-600">4.8/5</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500 rounded-lg">
                <BarChart3 className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Aylık Gelir</p>
                <p className="text-2xl font-bold text-purple-600">₺45,230</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Performans Analizi
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid grid-cols-3 w-full max-w-md">
              <TabsTrigger value="overview" className="gap-2">
                <TrendingUp className="h-4 w-4" />
                Genel Bakış
              </TabsTrigger>
              <TabsTrigger value="commission" className="gap-2">
                <Award className="h-4 w-4" />
                Hakediş
              </TabsTrigger>
              <TabsTrigger value="activity" className="gap-2">
                <Calendar className="h-4 w-4" />
                Aktivite
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <UserPerformanceComponent />
            </TabsContent>

            <TabsContent value="commission" className="space-y-6">
              <CommissionReport />
            </TabsContent>

            <TabsContent value="activity" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="p-6 bg-accent/20">
                  <h4 className="font-medium mb-4 flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Randevu Tamamlama Detayları
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm">Tamamlanan Randevular:</span>
                      <Badge variant="secondary">142</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">İptal Edilen:</span>
                      <Badge variant="destructive">8</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Başarı Oranı:</span>
                      <Badge variant="default">94.7%</Badge>
                    </div>
                  </div>
                </Card>
                
                <Card className="p-6 bg-accent/20">
                  <h4 className="font-medium mb-4 flex items-center gap-2">
                    <Award className="h-4 w-4" />
                    Müşteri Değerlendirmeleri
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm">Ortalama Puan:</span>
                      <Badge variant="secondary">4.8/5</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Toplam Değerlendirme:</span>
                      <Badge variant="outline">89</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Memnuniyet Oranı:</span>
                      <Badge variant="default">96%</Badge>
                    </div>
                  </div>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Performance;
