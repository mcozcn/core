
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Calendar, TrendingUp, Users, DollarSign, Award, Clock } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getStaffPerformance } from '@/utils/storage/staff';
import { User } from '@/utils/storage/userManager';

interface StaffPerformanceDetailProps {
  staff: User;
}

const StaffPerformanceDetail = ({ staff }: StaffPerformanceDetailProps) => {
  const { data: staffPerformance = [], isLoading } = useQuery({
    queryKey: ['staffPerformance'],
    queryFn: () => getStaffPerformance(),
  });

  const staffData = staffPerformance.find(s => s.id === staff.id);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-24 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!staffData) {
    return (
      <Card className="p-8 text-center">
        <div className="space-y-3">
          <Users className="h-12 w-12 text-muted-foreground mx-auto" />
          <h3 className="text-lg font-medium text-muted-foreground">Veri Bulunamadı</h3>
          <p className="text-muted-foreground">Bu personel için performans verisi bulunamadı.</p>
        </div>
      </Card>
    );
  }

  const performanceCards = [
    {
      title: "Toplam Randevu",
      value: staffData.appointmentsCount,
      icon: Calendar,
      color: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-900/20"
    },
    {
      title: "Onaylanan Randevular",
      value: staffData.confirmedAppointments,
      icon: Award,
      color: "text-green-600",
      bgColor: "bg-green-50 dark:bg-green-900/20"
    },
    {
      title: "İptal Edilen Randevular",
      value: staffData.cancelledAppointments,
      icon: Clock,
      color: "text-red-600",
      bgColor: "bg-red-50 dark:bg-red-900/20"
    },
    {
      title: "Bekleyen Randevular",
      value: staffData.pendingAppointments,
      icon: Clock,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50 dark:bg-yellow-900/20"
    },
    {
      title: "Verilen Hizmetler",
      value: staffData.servicesProvided,
      icon: Users,
      color: "text-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-900/20"
    },
    {
      title: "Ürün Satışları",
      value: staffData.productSales,
      icon: TrendingUp,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50 dark:bg-indigo-900/20"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <div 
          className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg"
          style={{ backgroundColor: staff.color }}
        >
          {staff.displayName?.charAt(0).toUpperCase()}
        </div>
        <div>
          <h2 className="text-2xl font-bold">{staff.displayName}</h2>
          <p className="text-muted-foreground">{staff.title}</p>
        </div>
      </div>

      {/* Performance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {performanceCards.map((card, index) => (
          <Card key={index} className={card.bgColor}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">{card.title}</p>
                  <p className={`text-2xl font-bold ${card.color}`}>{card.value}</p>
                </div>
                <card.icon className={`h-8 w-8 ${card.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Separator />

      {/* Financial Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Finansal Özet
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Toplam Gelir:</span>
              <Badge variant="secondary" className="text-lg font-bold">
                ₺{staffData.totalRevenue.toLocaleString('tr-TR')}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Toplam Komisyon:</span>
              <Badge variant="outline" className="text-lg font-bold">
                ₺{staffData.totalCommission.toLocaleString('tr-TR')}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Performans Oranları
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Onay Oranı</span>
                <span className="font-medium">
                  {staffData.appointmentsCount > 0 
                    ? `${Math.round((staffData.confirmedAppointments / staffData.appointmentsCount) * 100)}%`
                    : '0%'
                  }
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full" 
                  style={{ 
                    width: staffData.appointmentsCount > 0 
                      ? `${(staffData.confirmedAppointments / staffData.appointmentsCount) * 100}%`
                      : '0%'
                  }}
                ></div>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>İptal Oranı</span>
                <span className="font-medium">
                  {staffData.appointmentsCount > 0 
                    ? `${Math.round((staffData.cancelledAppointments / staffData.appointmentsCount) * 100)}%`
                    : '0%'
                  }
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-red-500 h-2 rounded-full" 
                  style={{ 
                    width: staffData.appointmentsCount > 0 
                      ? `${(staffData.cancelledAppointments / staffData.appointmentsCount) * 100}%`
                      : '0%'
                  }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StaffPerformanceDetail;
