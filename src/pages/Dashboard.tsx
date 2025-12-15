
import { useQuery } from "@tanstack/react-query";
import { getCustomers } from "@/utils/storage/customers";
import { getPayments } from "@/utils/storage/payments";
import { getGroupSchedules } from "@/utils/storage/groupSchedules";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Calendar, CreditCard, Clock, TrendingUp } from "lucide-react";
import { formatCurrency } from "@/utils/format";
import { Link } from "react-router-dom";
import { differenceInDays, startOfMonth } from "date-fns";

const Dashboard = () => {
  const today = new Date();
  const todayDayOfWeek = today.getDay(); // 0=Pazar, 1=Pazartesi, ..., 6=Cumartesi
  
  // Adjust day of week for our system (1=Pazartesi, ..., 6=Cumartesi, 0=Pazar maps to 7)
  const adjustedDayOfWeek = todayDayOfWeek === 0 ? 7 : todayDayOfWeek;

  const { data: groupSchedules = [] } = useQuery({
    queryKey: ['groupSchedules'],
    queryFn: getGroupSchedules
  });

  const { data: customers = [] } = useQuery({
    queryKey: ['customers'],
    queryFn: getCustomers
  });

  const { data: payments = [] } = useQuery({
    queryKey: ['payments'],
    queryFn: getPayments
  });

  // Get today's active groups
  const todayGroups = groupSchedules.filter(schedule => {
    if (!schedule.isActive) return false;

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

  // New memberships this month (customers with membershipStartDate in current month)
  const monthStart = startOfMonth(today);
  const newMembershipsCount = customers.filter(c => {
    if (!c.membershipStartDate) return false;
    const startDate = new Date(c.membershipStartDate);
    return startDate >= monthStart && startDate <= today;
  }).length;

  // Memberships expiring in next 5 days
  const fiveDaysFromNow = new Date(today);
  fiveDaysFromNow.setDate(today.getDate() + 5);
  
  const expiringMemberships = customers.filter(c => {
    if (!c.membershipEndDate || !c.isActive) return false;
    const endDate = new Date(c.membershipEndDate);
    return endDate >= today && endDate <= fiveDaysFromNow;
  }).sort((a, b) => {
    const dateA = new Date(a.membershipEndDate!);
    const dateB = new Date(b.membershipEndDate!);
    return dateA.getTime() - dateB.getTime();
  });

  // Upcoming payments (within 1 week) - unpaid payments
  const oneWeekFromNow = new Date(today);
  oneWeekFromNow.setDate(today.getDate() + 7);
  
  const upcomingPayments = payments.filter(payment => {
    if (payment.isPaid) return false;
    const dueDate = payment.dueDate ? new Date(payment.dueDate) : new Date(payment.paymentDate || payment.date!);
    return dueDate >= today && dueDate <= oneWeekFromNow;
  }).sort((a, b) => {
    const dateA = new Date(a.dueDate || a.paymentDate || a.date!);
    const dateB = new Date(b.dueDate || b.paymentDate || b.date!);
    return dateA.getTime() - dateB.getTime();
  });

  const getDayName = (dayNum: number) => {
    const days = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
    return days[dayNum];
  };

  const currentGroup = adjustedDayOfWeek <= 6 ? ([1, 3, 5].includes(adjustedDayOfWeek) ? 'A' : 'B') : null;

  return (
    <div className="p-4 md:p-6 md:pl-72 animate-fadeIn space-y-6 md:space-y-8">
      {/* Header Section */}
      <div className="text-center space-y-3 md:space-y-4">
        <div className="flex justify-center mb-4 md:mb-6">
          <img 
            src="/lovable-uploads/core.png" 
            alt="CORE Logo" 
            className="w-48 md:w-80 h-auto" 
          />
        </div>
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl md:text-3xl font-serif text-foreground mb-2">Hoş Geldiniz</h1>
          <p className="text-sm md:text-base text-muted-foreground">Bugün {getDayName(todayDayOfWeek)} - {currentGroup ? `Grup ${currentGroup}` : 'Pazar'}</p>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800">
          <CardHeader className="pb-1 md:pb-2 p-3 md:p-6">
            <CardTitle className="flex items-center gap-1.5 md:gap-2 text-xs md:text-sm font-medium">
              <Users className="h-3.5 w-3.5 md:h-4 md:w-4" />
              <span className="hidden sm:inline">Bu Ay</span> Yeni Üyelik
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0 md:p-6 md:pt-0">
            <div className="text-2xl md:text-3xl font-bold">{newMembershipsCount}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-orange-200 dark:border-orange-800">
          <CardHeader className="pb-1 md:pb-2 p-3 md:p-6">
            <CardTitle className="flex items-center gap-1.5 md:gap-2 text-xs md:text-sm font-medium">
              <Clock className="h-3.5 w-3.5 md:h-4 md:w-4" />
              <span className="hidden sm:inline">Üyeliği</span> Biten (5 Gün)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0 md:p-6 md:pt-0">
            <div className="text-2xl md:text-3xl font-bold">{expiringMemberships.length}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-800">
          <CardHeader className="pb-1 md:pb-2 p-3 md:p-6">
            <CardTitle className="flex items-center gap-1.5 md:gap-2 text-xs md:text-sm font-medium">
              <CreditCard className="h-3.5 w-3.5 md:h-4 md:w-4" />
              Ödemesi Yaklaşan
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0 md:p-6 md:pt-0">
            <div className="text-2xl md:text-3xl font-bold">{upcomingPayments.length}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-800">
          <CardHeader className="pb-1 md:pb-2 p-3 md:p-6">
            <CardTitle className="flex items-center gap-1.5 md:gap-2 text-xs md:text-sm font-medium">
              <TrendingUp className="h-3.5 w-3.5 md:h-4 md:w-4" />
              Bugünkü Gruplar
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0 md:p-6 md:pt-0">
            <div className="text-2xl md:text-3xl font-bold">{todayGroups.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Today's Groups Table */}
      <Card>
        <CardHeader className="p-4 md:p-6">
          <CardTitle className="flex items-center gap-2 text-base md:text-lg">
            <Calendar className="h-4 w-4 md:h-5 md:w-5" />
            Bugünkü Gruplar {currentGroup && `- Grup ${currentGroup}`}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0 md:p-6 md:pt-0">
          {sortedTimeSlots.length > 0 ? (
            <div className="space-y-4 md:space-y-6">
              {sortedTimeSlots.map(timeSlot => (
                <div key={timeSlot} className="space-y-2">
                  <div className="flex items-center gap-2 pb-2 border-b">
                    <Clock className="h-3.5 w-3.5 md:h-4 md:w-4 text-primary" />
                    <h3 className="font-semibold text-base md:text-lg">{timeSlot}</h3>
                    <span className="text-xs md:text-sm text-muted-foreground">
                      ({groupedByTime[timeSlot].length} üye)
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {groupedByTime[timeSlot].map(schedule => (
                      <Link
                        key={schedule.id}
                        to={`/customers`}
                        className="p-2.5 md:p-3 bg-accent/50 rounded-lg hover:bg-accent transition-colors active:scale-[0.98]"
                      >
                        <div className="font-medium text-sm md:text-base">{schedule.customerName}</div>
                        <div className="text-xs text-muted-foreground">Grup {schedule.group}</div>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-6 md:py-8 text-sm md:text-base">
              Bugün için grup antrenmanı bulunmamaktadır.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6">
        {/* Expiring Memberships */}
        <Card>
          <CardHeader className="p-4 md:p-6">
            <CardTitle className="flex items-center gap-2 text-base md:text-lg">
              <Clock className="h-4 w-4 md:h-5 md:w-5" />
              Üyeliği Bitenler (5 Gün)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 md:p-6 md:pt-0">
            <div className="space-y-2">
              {expiringMemberships.length > 0 ? (
                expiringMemberships.map(customer => {
                  const daysUntilExpiry = differenceInDays(new Date(customer.membershipEndDate!), today);
                  
                  return (
                    <Link
                      key={customer.id}
                      to="/customers"
                      className="flex items-center justify-between p-2.5 md:p-3 bg-accent/50 rounded-lg hover:bg-accent transition-colors active:scale-[0.98]"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="font-medium text-sm md:text-base truncate">{customer.name}</div>
                        <div className="text-xs md:text-sm text-muted-foreground truncate">
                          {customer.phone}
                        </div>
                      </div>
                      <div className="text-right ml-2 shrink-0">
                        <div className="text-xs md:text-sm font-medium text-orange-600 dark:text-orange-400">
                          {daysUntilExpiry <= 0 ? 'Bugün' : `${daysUntilExpiry} gün`}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(customer.membershipEndDate!).toLocaleDateString('tr-TR')}
                        </div>
                      </div>
                    </Link>
                  );
                })
              ) : (
                <div className="text-center text-muted-foreground py-4 text-sm md:text-base">
                  Yakın zamanda biten üyelik yok.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Payments */}
        <Card>
          <CardHeader className="p-4 md:p-6">
            <CardTitle className="flex items-center gap-2 text-base md:text-lg">
              <CreditCard className="h-4 w-4 md:h-5 md:w-5" />
              Ödemesi Yaklaşan (1 Hafta)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 md:p-6 md:pt-0">
            <div className="space-y-2">
              {upcomingPayments.length > 0 ? (
                upcomingPayments.slice(0, 10).map(payment => {
                  const customer = customers.find(c => String(c.id) === String(payment.customerId));
                  const dueDate = payment.dueDate || payment.paymentDate || payment.date;
                  const daysUntilDue = dueDate ? differenceInDays(new Date(dueDate), today) : 0;
                  
                  return (
                    <Link
                      key={payment.id}
                      to="/payment-tracking"
                      className="flex items-center justify-between p-2.5 md:p-3 bg-accent/50 rounded-lg hover:bg-accent transition-colors active:scale-[0.98]"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="font-medium text-sm md:text-base truncate">{customer?.name || 'Bilinmeyen'}</div>
                        <div className="text-xs md:text-sm text-muted-foreground truncate">
                          {payment.notes || payment.paymentType}
                        </div>
                      </div>
                      <div className="text-right ml-2 shrink-0">
                        <div className="font-semibold text-primary text-sm md:text-base">
                          {formatCurrency(payment.amount)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {daysUntilDue === 0 ? 'Bugün' : `${daysUntilDue} gün`}
                        </div>
                      </div>
                    </Link>
                  );
                })
              ) : (
                <div className="text-center text-muted-foreground py-4 text-sm md:text-base">
                  Yakın zamanda ödemesi olan üye yok.
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