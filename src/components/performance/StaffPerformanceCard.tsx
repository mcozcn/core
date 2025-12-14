
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { formatCurrency } from '@/utils/format';
import { 
  Calendar, 
  CheckCircle, 
  XCircle, 
  Clock, 
  TrendingUp, 
  DollarSign,
  Package 
} from 'lucide-react';

interface StaffPerformanceCardProps {
  staff: {
    id: string | number;
    name: string;
    role: string;
    servicesProvided: number;
    totalRevenue: number;
    appointmentsCount: number;
    confirmedAppointments: number;
    cancelledAppointments: number;
    pendingAppointments: number;
    productSales: number;
    totalCommission: number;
  };
}

const StaffPerformanceCard = ({ staff }: StaffPerformanceCardProps) => {
  const successRate = staff.appointmentsCount > 0 
    ? Math.round((staff.confirmedAppointments / staff.appointmentsCount) * 100) 
    : 0;
  
  const cancelRate = staff.appointmentsCount > 0 
    ? Math.round((staff.cancelledAppointments / staff.appointmentsCount) * 100) 
    : 0;

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3 md:pb-4 p-3 md:p-6">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <CardTitle className="text-base md:text-lg truncate">{staff.name}</CardTitle>
            <Badge variant="outline" className="mt-1 text-xs">{staff.role}</Badge>
          </div>
          <div className="text-right flex-shrink-0">
            <div className="text-lg md:text-2xl font-bold text-primary">
              {formatCurrency(staff.totalRevenue)}
            </div>
            <div className="text-xs md:text-sm text-muted-foreground">Toplam Gelir</div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3 md:space-y-4 p-3 md:p-6 pt-0">
        {/* Appointment Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Calendar className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
              <span className="text-xs md:text-sm font-medium">Randevular</span>
            </div>
            <div className="grid grid-cols-3 gap-1 md:gap-2 text-xs md:text-sm">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1">
                  <CheckCircle className="h-3 w-3 text-green-500" />
                  <span className="font-semibold text-green-600">{staff.confirmedAppointments}</span>
                </div>
                <div className="text-[10px] md:text-xs text-muted-foreground">Onay</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1">
                  <XCircle className="h-3 w-3 text-red-500" />
                  <span className="font-semibold text-red-600">{staff.cancelledAppointments}</span>
                </div>
                <div className="text-[10px] md:text-xs text-muted-foreground">İptal</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1">
                  <Clock className="h-3 w-3 text-orange-500" />
                  <span className="font-semibold text-orange-600">{staff.pendingAppointments}</span>
                </div>
                <div className="text-[10px] md:text-xs text-muted-foreground">Bekleyen</div>
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
              <span className="text-xs md:text-sm font-medium">Başarı Oranı</span>
            </div>
            <div className="space-y-1">
              <Progress value={successRate} className="h-2" />
              <div className="text-xs md:text-sm text-center font-semibold">{successRate}%</div>
            </div>
          </div>
        </div>

        {/* Sales Metrics */}
        <div className="grid grid-cols-2 gap-3 md:gap-4 pt-2 border-t">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 md:gap-2 mb-1">
              <Package className="h-3 w-3 md:h-4 md:w-4 text-blue-500" />
              <span className="text-xs md:text-sm font-medium">Hizmet</span>
            </div>
            <div className="text-base md:text-xl font-bold text-blue-600">{staff.servicesProvided}</div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 md:gap-2 mb-1">
              <DollarSign className="h-3 w-3 md:h-4 md:w-4 text-green-500" />
              <span className="text-xs md:text-sm font-medium">Hakediş</span>
            </div>
            <div className="text-base md:text-xl font-bold text-green-600">
              {formatCurrency(staff.totalCommission)}
            </div>
          </div>
        </div>

        {/* Additional Metrics */}
        <div className="flex justify-between items-center pt-2 border-t text-xs md:text-sm">
          <span className="text-muted-foreground">Ürün Satışı:</span>
          <Badge variant="secondary" className="text-xs">{staff.productSales}</Badge>
        </div>
      </CardContent>
    </Card>
  );
};

export default StaffPerformanceCard;
