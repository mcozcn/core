
import { useState } from "react";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { getStaffPerformance } from "@/utils/storage/staff";
import StaffPerformanceCard from "@/components/performance/StaffPerformanceCard";
import StaffPerformanceCharts from "@/components/performance/StaffPerformanceCharts";
import { formatCurrency } from "@/utils/format";
import { 
  TrendingUp, 
  Target, 
  Award, 
  BarChart3, 
  Users, 
  Calendar,
  DollarSign 
} from "lucide-react";

const Performance = () => {
  const { data: staffPerformance = [], isLoading } = useQuery({
    queryKey: ['staffPerformance'],
    queryFn: () => getStaffPerformance(),
  });

  // Calculate overall statistics
  const totalRevenue = staffPerformance.reduce((sum, staff) => sum + staff.totalRevenue, 0);
  const totalAppointments = staffPerformance.reduce((sum, staff) => sum + staff.appointmentsCount, 0);
  const totalConfirmed = staffPerformance.reduce((sum, staff) => sum + staff.confirmedAppointments, 0);
  const totalCommission = staffPerformance.reduce((sum, staff) => sum + staff.totalCommission, 0);
  const overallSuccessRate = totalAppointments > 0 ? Math.round((totalConfirmed / totalAppointments) * 100) : 0;

  if (isLoading) {
    return (
      <div className="p-6 pl-72 animate-fadeIn">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
          <span className="ml-3">Performans verileri yükleniyor...</span>
        </div>
      </div>
    );
  }

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
                <p className="text-sm text-muted-foreground">Başarı Oranı</p>
                <p className="text-2xl font-bold text-blue-600">{overallSuccessRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500 rounded-lg">
                <DollarSign className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Toplam Gelir</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(totalRevenue)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-500 rounded-lg">
                <Calendar className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Toplam Randevu</p>
                <p className="text-2xl font-bold text-orange-600">{totalAppointments}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500 rounded-lg">
                <Award className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Toplam Hakediş</p>
                <p className="text-2xl font-bold text-purple-600">{formatCurrency(totalCommission)}</p>
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
          <Tabs defaultValue="cards" className="space-y-6">
            <TabsList className="grid grid-cols-2 w-full max-w-md">
              <TabsTrigger value="cards" className="gap-2">
                <Users className="h-4 w-4" />
                Personel Kartları
              </TabsTrigger>
              <TabsTrigger value="charts" className="gap-2">
                <BarChart3 className="h-4 w-4" />
                Grafikler
              </TabsTrigger>
            </TabsList>

            <TabsContent value="cards" className="space-y-6">
              {staffPerformance.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">Henüz personel verisi yok</h3>
                  <p className="text-muted-foreground">Personel performans verileri görüntülenecek.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {staffPerformance.map((staff) => (
                    <StaffPerformanceCard key={staff.id} staff={staff} />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="charts" className="space-y-6">
              {staffPerformance.length === 0 ? (
                <div className="text-center py-12">
                  <BarChart3 className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">Henüz grafik verisi yok</h3>
                  <p className="text-muted-foreground">Personel performans grafikleri görüntülenecek.</p>
                </div>
              ) : (
                <StaffPerformanceCharts data={staffPerformance} />
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Performance;
