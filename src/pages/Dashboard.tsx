import { useQuery } from "@tanstack/react-query";
import { getCustomers } from "@/utils/storage/customers";
import { getPayments } from "@/utils/storage/payments";
import { getGroupSchedules } from "@/utils/storage/groupSchedules";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Calendar, CreditCard, Clock, TrendingUp, AlertCircle } from "lucide-react";
import { formatCurrency } from "@/utils/format";
import { Link } from "react-router-dom";
import { differenceInDays, startOfMonth } from "date-fns";
import { Badge } from "@/components/ui/badge";

const Dashboard = () => {
  const today = new Date();
  const todayDayOfWeek = today.getDay();
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

  const todayGroups = groupSchedules.filter(schedule => {
    if (!schedule.isActive) return false;
    const isGroupADay = [1, 3, 5].includes(adjustedDayOfWeek);
    const isGroupBDay = [2, 4, 6].includes(adjustedDayOfWeek);
    return (schedule.group === 'A' && isGroupADay) || (schedule.group === 'B' && isGroupBDay);
  });

  const groupedByTime = todayGroups.reduce((acc, schedule) => {
    if (!acc[schedule.timeSlot]) acc[schedule.timeSlot] = [];
    acc[schedule.timeSlot].push(schedule);
    return acc;
  }, {} as Record<string, typeof todayGroups>);

  const sortedTimeSlots = Object.keys(groupedByTime).sort();

  const monthStart = startOfMonth(today);
  const newMembershipsCount = customers.filter(c => {
    if (!c.membershipStartDate) return false;
    const startDate = new Date(c.membershipStartDate);
    return startDate >= monthStart && startDate <= today;
  }).length;

  const fiveDaysFromNow = new Date(today);
  fiveDaysFromNow.setDate(today.getDate() + 5);
  
  const expiringMemberships = customers.filter(c => {
    if (!c.membershipEndDate || !c.isActive) return false;
    const endDate = new Date(c.membershipEndDate);
    return endDate >= today && endDate <= fiveDaysFromNow;
  }).sort((a, b) => new Date(a.membershipEndDate!).getTime() - new Date(b.membershipEndDate!).getTime());

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

  const totalDebt = payments.filter(p => !p.isPaid).reduce((sum, p) => sum + Math.abs(p.amount), 0);

  const getDayName = (dayNum: number) => {
    const days = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
    return days[dayNum];
  };

  const currentGroup = adjustedDayOfWeek <= 6 ? ([1, 3, 5].includes(adjustedDayOfWeek) ? 'A' : 'B') : null;

  return (
    <div className="page-container space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <img src="/lovable-uploads/core.png" alt="CORE Logo" className="w-40 md:w-56 h-auto mx-auto" />
        <p className="text-muted-foreground">
          {getDayName(todayDayOfWeek)} - {currentGroup ? `Grup ${currentGroup}` : 'Pazar'}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <div className="stat-card stat-card-info">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-info/20 rounded-xl">
              <Users className="h-5 w-5 text-info" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Bu Ay Yeni</p>
              <p className="text-2xl font-bold">{newMembershipsCount}</p>
            </div>
          </div>
        </div>

        <div className="stat-card stat-card-warning">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-warning/20 rounded-xl">
              <Clock className="h-5 w-5 text-warning" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Biten Üyelik</p>
              <p className="text-2xl font-bold">{expiringMemberships.length}</p>
            </div>
          </div>
        </div>

        <div className="stat-card stat-card-danger">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-destructive/20 rounded-xl">
              <CreditCard className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Bekleyen Ödeme</p>
              <p className="text-2xl font-bold">{upcomingPayments.length}</p>
            </div>
          </div>
        </div>

        <div className="stat-card stat-card-success">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-success/20 rounded-xl">
              <TrendingUp className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Toplam Borç</p>
              <p className="text-2xl font-bold">{formatCurrency(totalDebt)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Today's Groups */}
      <Card className="card-elevated">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Calendar className="h-5 w-5 text-primary" />
            Bugünkü Gruplar {currentGroup && <Badge variant="secondary">Grup {currentGroup}</Badge>}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {sortedTimeSlots.length > 0 ? (
            <div className="space-y-4">
              {sortedTimeSlots.map(timeSlot => (
                <div key={timeSlot} className="space-y-2">
                  <div className="flex items-center gap-2 pb-2 border-b border-border">
                    <Clock className="h-4 w-4 text-primary" />
                    <span className="font-semibold">{timeSlot}</span>
                    <Badge variant="outline">{groupedByTime[timeSlot].length} üye</Badge>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {groupedByTime[timeSlot].map(schedule => (
                      <Link
                        key={schedule.id}
                        to="/customers"
                        className="p-3 bg-accent/50 rounded-xl hover:bg-accent transition-colors"
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
            <div className="text-center text-muted-foreground py-8">Bugün grup antrenmanı yok.</div>
          )}
        </CardContent>
      </Card>

      {/* Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <Card className="card-elevated">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <AlertCircle className="h-5 w-5 text-warning" />
              Üyeliği Bitenler
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {expiringMemberships.length > 0 ? expiringMemberships.slice(0, 5).map(customer => {
                const daysUntil = differenceInDays(new Date(customer.membershipEndDate!), today);
                return (
                  <Link key={customer.id} to="/customers" className="flex items-center justify-between p-3 bg-accent/50 rounded-xl hover:bg-accent transition-colors">
                    <div>
                      <div className="font-medium">{customer.name}</div>
                      <div className="text-xs text-muted-foreground">{customer.phone}</div>
                    </div>
                    <Badge variant={daysUntil <= 1 ? "destructive" : "secondary"}>
                      {daysUntil <= 0 ? 'Bugün' : `${daysUntil} gün`}
                    </Badge>
                  </Link>
                );
              }) : <div className="text-center text-muted-foreground py-4">Yakın zamanda biten üyelik yok.</div>}
            </div>
          </CardContent>
        </Card>

        <Card className="card-elevated">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <CreditCard className="h-5 w-5 text-destructive" />
              Bekleyen Ödemeler
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {upcomingPayments.length > 0 ? upcomingPayments.slice(0, 5).map(payment => {
                const customer = customers.find(c => String(c.id) === String(payment.customerId));
                const dueDate = payment.dueDate || payment.paymentDate || payment.date;
                const daysUntil = dueDate ? differenceInDays(new Date(dueDate), today) : 0;
                return (
                  <Link key={payment.id} to="/payment-tracking" className="flex items-center justify-between p-3 bg-accent/50 rounded-xl hover:bg-accent transition-colors">
                    <div>
                      <div className="font-medium">{customer?.name || 'Bilinmeyen'}</div>
                      <div className="text-xs text-muted-foreground">{payment.notes || payment.paymentType}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-primary">{formatCurrency(payment.amount)}</div>
                      <div className="text-xs text-muted-foreground">{daysUntil === 0 ? 'Bugün' : `${daysUntil} gün`}</div>
                    </div>
                  </Link>
                );
              }) : <div className="text-center text-muted-foreground py-4">Yakın zamanda ödeme yok.</div>}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;