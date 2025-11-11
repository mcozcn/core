
import { useQuery } from "@tanstack/react-query";
import { getCustomers, getCustomerRecords } from "@/utils/localStorage";
import { getGroupSchedules } from "@/utils/storage/groupSchedules";
import { getMemberSubscriptions } from "@/utils/storage/membershipPackages";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Calendar, CreditCard, Clock, TrendingUp } from "lucide-react";
import { formatCurrency } from "@/utils/format";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const today = new Date();
  const todayDayOfWeek = today.getDay(); // 0=Pazar, 1=Pazartesi, ..., 6=Cumartesi
  
  // Adjust day of week for our system (1=Pazartesi, ..., 6=Cumartesi, 0=Pazar maps to 7)
  const adjustedDayOfWeek = todayDayOfWeek === 0 ? 7 : todayDayOfWeek;

  const { data: groupSchedules = [] } = useQuery({
    queryKey: ['groupSchedules'],
    queryFn: getGroupSchedules
  });

  const { data: memberSubscriptions = [] } = useQuery({
    queryKey: ['memberSubscriptions'],
    queryFn: getMemberSubscriptions
  });

  const { data: customers = [] } = useQuery({
    queryKey: ['customers'],
    queryFn: getCustomers
  });

  const { data: customerRecords = [] } = useQuery({
    queryKey: ['customerRecords'],
    queryFn: getCustomerRecords
  });

  // Get today's active groups
  const todayGroups = groupSchedules.filter(schedule => {
    if (!schedule.isActive) return false;
    
    const scheduleEndDate = schedule.endDate ? new Date(schedule.endDate) : null;
    const isExpired = scheduleEndDate && scheduleEndDate < today;
    if (isExpired) return false;

    // Group A: Pazartesi(1), Çarşamba(3), Cuma(5)
    // Group B: Salı(2), Perşembe(4), Cumartesi(6)
    const isGroupADay = [1, 3, 5].includes(adjustedDayOfWeek);
    const isGroupBDay = [2, 4, 6].includes(adjustedDayOfWeek);
    
    return (schedule.group === 'A' && isGroupADay) || (schedule.group === 'B' && isGroupBDay);
  });

  // Group by time slot
  const groupedByTime = todayGroups.reduce((acc, schedule) => {
    if (!acc[schedule.timeSlot]) {
      acc[schedule.timeSlot] = [];
    }
    acc[schedule.timeSlot].push(schedule);
    return acc;
  }, {} as Record<string, typeof todayGroups>);

  // Sort time slots
  const sortedTimeSlots = Object.keys(groupedByTime).sort();

  // New memberships this month
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const newMembershipsCount = memberSubscriptions.filter(sub => {
    const subDate = new Date(sub.createdAt);
    return subDate >= startOfMonth;
  }).length;

  // Memberships expiring in next 5 days
  const fiveDaysFromNow = new Date(today);
  fiveDaysFromNow.setDate(today.getDate() + 5);
  
  const expiringMemberships = memberSubscriptions.filter(sub => {
    const endDate = new Date(sub.endDate);
    return endDate >= today && endDate <= fiveDaysFromNow && sub.isActive;
  });

  // Upcoming installment payments (within 1 week)
  const oneWeekFromNow = new Date(today);
  oneWeekFromNow.setDate(today.getDate() + 7);
  
  const upcomingPayments = customerRecords.filter(record => {
    if (record.recordType !== 'installment' || record.isPaid || !record.dueDate) return false;
    const dueDate = new Date(record.dueDate);
    return dueDate >= today && dueDate <= oneWeekFromNow;
  }).sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime());

  const getDayName = (dayNum: number) => {
    const days = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
    return days[dayNum];
  };

  const currentGroup = adjustedDayOfWeek <= 6 ? ([1, 3, 5].includes(adjustedDayOfWeek) ? 'A' : 'B') : null;

  return (
    <div className="p-6 pl-72 animate-fadeIn space-y-8">
      {/* Header Section */}
      <div className="text-center space-y-4">
        <div className="flex justify-center mb-6">
          <img 
            src="/lovable-uploads/core.png" 
            alt="CORE Logo" 
            className="w-80 h-auto" 
          />
        </div>
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-serif text-foreground mb-2">Hoş Geldiniz</h1>
          <p className="text-muted-foreground">Bugün {getDayName(todayDayOfWeek)} - {currentGroup ? `Grup ${currentGroup}` : 'Pazar'}</p>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <Users className="h-4 w-4" />
              Bu Ay Yeni Üyelikler
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{newMembershipsCount}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-orange-200 dark:border-orange-800">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <Clock className="h-4 w-4" />
              Üyeliği Bitenler (5 Gün)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{expiringMemberships.length}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-800">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <CreditCard className="h-4 w-4" />
              Ödemesi Yaklaşan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{upcomingPayments.length}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-800">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <TrendingUp className="h-4 w-4" />
              Bugünkü Gruplar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{todayGroups.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Today's Groups Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Bugünkü Antrenman Grupları {currentGroup && `- Grup ${currentGroup}`}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {sortedTimeSlots.length > 0 ? (
            <div className="space-y-6">
              {sortedTimeSlots.map(timeSlot => (
                <div key={timeSlot} className="space-y-2">
                  <div className="flex items-center gap-2 pb-2 border-b">
                    <Clock className="h-4 w-4 text-primary" />
                    <h3 className="font-semibold text-lg">{timeSlot}</h3>
                    <span className="text-sm text-muted-foreground">
                      ({groupedByTime[timeSlot].length} üye)
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                    {groupedByTime[timeSlot].map(schedule => (
                      <Link
                        key={schedule.id}
                        to={`/customers`}
                        className="p-3 bg-accent/50 rounded-lg hover:bg-accent transition-colors"
                      >
                        <div className="font-medium">{schedule.customerName}</div>
                        <div className="text-xs text-muted-foreground">Grup {schedule.group}</div>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-8">
              Bugün için grup antrenmanı bulunmamaktadır.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Expiring Memberships */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Üyeliği Bitenler (5 Gün İçinde)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {expiringMemberships.length > 0 ? (
                expiringMemberships.map(sub => {
                  const customer = customers.find(c => c.id === sub.memberId);
                  const daysUntilExpiry = Math.ceil((new Date(sub.endDate).getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                  
                  return (
                    <Link
                      key={sub.id}
                      to="/customers"
                      className="flex items-center justify-between p-3 bg-accent/50 rounded-lg hover:bg-accent transition-colors"
                    >
                      <div>
                        <div className="font-medium">{customer?.name || 'Bilinmeyen'}</div>
                        <div className="text-sm text-muted-foreground">
                          {sub.packageName}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-orange-600 dark:text-orange-400">
                          {daysUntilExpiry} gün kaldı
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(sub.endDate).toLocaleDateString('tr-TR')}
                        </div>
                      </div>
                    </Link>
                  );
                })
              ) : (
                <div className="text-center text-muted-foreground py-4">
                  Yakın zamanda biten üyelik bulunmamaktadır.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Payments */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Ödemesi Yaklaşan Üyeler (1 Hafta)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {upcomingPayments.length > 0 ? (
                upcomingPayments.slice(0, 10).map(payment => {
                  const customer = customers.find(c => c.id === payment.customerId);
                  const daysUntilDue = Math.ceil((new Date(payment.dueDate!).getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                  
                  return (
                    <Link
                      key={payment.id}
                      to="/payment-tracking"
                      className="flex items-center justify-between p-3 bg-accent/50 rounded-lg hover:bg-accent transition-colors"
                    >
                      <div>
                        <div className="font-medium">{customer?.name || payment.customerName}</div>
                        <div className="text-sm text-muted-foreground">
                          {payment.itemName}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-primary">
                          {formatCurrency(payment.amount)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {daysUntilDue === 0 ? 'Bugün' : `${daysUntilDue} gün kaldı`}
                        </div>
                      </div>
                    </Link>
                  );
                })
              ) : (
                <div className="text-center text-muted-foreground py-4">
                  Yakın zamanda ödemesi olan üye bulunmamaktadır.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
