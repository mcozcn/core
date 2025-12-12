import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LogIn, LogOut, Clock, Users, TrendingUp } from 'lucide-react';
import { checkInMember, checkOutMember, getCurrentCheckIns, getTodayCheckIns } from '@/utils/storage/checkIn';
import { getCustomers } from '@/utils/storage/customers';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const CheckIn = () => {
  const { toast } = useToast();
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [notes, setNotes] = useState('');

  const { data: customers = [], refetch: refetchCustomers } = useQuery({
    queryKey: ['customers'],
    queryFn: getCustomers,
  });

  const { data: currentCheckIns = [], refetch: refetchCurrent } = useQuery({
    queryKey: ['currentCheckIns'],
    queryFn: getCurrentCheckIns,
  });

  const { data: todayCheckIns = [], refetch: refetchToday } = useQuery({
    queryKey: ['todayCheckIns'],
    queryFn: getTodayCheckIns,
  });

  const handleCheckIn = async () => {
    if (!selectedMemberId) {
      toast({
        variant: 'destructive',
        title: 'Hata',
        description: 'Lütfen üye seçin',
      });
      return;
    }

    const member = customers.find(c => c.id === parseInt(selectedMemberId));
    if (!member) return;

    const success = await checkInMember(member.id, member.name, notes);
    
    if (success) {
      toast({
        title: 'Başarılı',
        description: `${member.name} giriş yaptı`,
      });
      setSelectedMemberId('');
      setNotes('');
      refetchCurrent();
      refetchToday();
    } else {
      toast({
        variant: 'destructive',
        title: 'Hata',
        description: 'Üye zaten giriş yapmış',
      });
    }
  };

  const handleCheckOut = async (memberId: number, memberName: string) => {
    const success = await checkOutMember(memberId);
    
    if (success) {
      toast({
        title: 'Başarılı',
        description: `${memberName} çıkış yaptı`,
      });
      refetchCurrent();
      refetchToday();
    } else {
      toast({
        variant: 'destructive',
        title: 'Hata',
        description: 'Çıkış işlemi başarısız',
      });
    }
  };

  const formatDuration = (checkInTime: Date) => {
    const now = new Date();
    const duration = Math.floor((now.getTime() - new Date(checkInTime).getTime()) / 60000);
    const hours = Math.floor(duration / 60);
    const minutes = duration % 60;
    return `${hours}s ${minutes}dk`;
  };

  return (
    <div className="min-h-screen p-4 md:p-6 md:ml-56">
      <div className="max-w-7xl mx-auto space-y-4 md:space-y-6">
        <div>
          <h1 className="text-2xl md:text-4xl font-bold mb-1 md:mb-2">Giriş / Çıkış Sistemi</h1>
          <p className="text-sm md:text-base text-muted-foreground">Üye giriş-çıkış işlemlerini yönetin</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 md:gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 md:p-6">
              <CardTitle className="text-xs md:text-sm font-medium">Şu An İçeride</CardTitle>
              <Users className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="p-3 md:p-6 pt-0">
              <div className="text-lg md:text-2xl font-bold text-primary">{currentCheckIns.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 md:p-6">
              <CardTitle className="text-xs md:text-sm font-medium">Bugün Toplam</CardTitle>
              <TrendingUp className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="p-3 md:p-6 pt-0">
              <div className="text-lg md:text-2xl font-bold text-secondary">{todayCheckIns.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 md:p-6">
              <CardTitle className="text-xs md:text-sm font-medium">Ort. Süre</CardTitle>
              <Clock className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="p-3 md:p-6 pt-0">
              <div className="text-lg md:text-2xl font-bold">
                {todayCheckIns.filter(c => c.duration).length > 0
                  ? Math.round(
                      todayCheckIns
                        .filter(c => c.duration)
                        .reduce((sum, c) => sum + (c.duration || 0), 0) /
                        todayCheckIns.filter(c => c.duration).length
                    ) + ' dk'
                  : '0 dk'}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          {/* Check In Form */}
          <Card>
            <CardHeader className="p-3 md:p-6">
              <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                <LogIn className="h-4 w-4 md:h-5 md:w-5 text-green-500" />
                Giriş Yap
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 md:space-y-4 p-3 md:p-6 pt-0">
              <div>
                <Label htmlFor="member" className="text-sm">Üye Seçin *</Label>
                <Select value={selectedMemberId} onValueChange={setSelectedMemberId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Üye seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map((customer) => (
                      <SelectItem key={customer.id} value={customer.id.toString()}>
                        {customer.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="notes" className="text-sm">Not (Opsiyonel)</Label>
                <Input
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Not ekleyin"
                />
              </div>

              <Button onClick={handleCheckIn} className="w-full gradient-primary" size="sm">
                <LogIn className="mr-2 h-4 w-4" />
                Giriş Yap
              </Button>
            </CardContent>
          </Card>

          {/* Current Check-ins */}
          <Card>
            <CardHeader className="p-3 md:p-6">
              <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                <Users className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                İçeridekiler ({currentCheckIns.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 md:p-6 pt-0">
              <div className="space-y-2 md:space-y-3 max-h-[300px] md:max-h-[400px] overflow-y-auto">
                {currentCheckIns.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-6 md:py-8">
                    Şu an içeride kimse yok
                  </p>
                ) : (
                  currentCheckIns.map((record) => (
                    <div
                      key={record.id}
                      className="flex items-center justify-between p-2 md:p-3 bg-muted rounded-lg"
                    >
                      <div className="min-w-0 flex-1 mr-2">
                        <p className="font-medium text-sm md:text-base truncate">{record.memberName}</p>
                        <p className="text-[10px] md:text-xs text-muted-foreground">
                          Giriş: {format(new Date(record.checkInTime), 'HH:mm', { locale: tr })}
                        </p>
                        <p className="text-[10px] md:text-xs text-primary font-medium">
                          {formatDuration(record.checkInTime)}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCheckOut(record.memberId, record.memberName)}
                        className="text-xs"
                      >
                        <LogOut className="mr-1 md:mr-2 h-3 w-3 md:h-4 md:w-4" />
                        <span className="hidden sm:inline">Çıkış</span>
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Today's History */}
        <Card>
          <CardHeader className="p-3 md:p-6">
            <CardTitle className="text-base md:text-lg">Bugünün Geçmişi ({todayCheckIns.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-3 md:p-6 pt-0">
            <div className="space-y-2">
              {todayCheckIns.slice(0, 10).map((record) => (
                <div
                  key={record.id}
                  className="flex items-center justify-between p-2 md:p-3 border rounded-lg"
                >
                  <div className="flex-1 min-w-0 mr-2">
                    <p className="font-medium text-sm md:text-base truncate">{record.memberName}</p>
                    {record.notes && (
                      <p className="text-[10px] md:text-xs text-muted-foreground truncate">{record.notes}</p>
                    )}
                  </div>
                  <div className="text-right text-xs md:text-sm flex-shrink-0">
                    <p>
                      {format(new Date(record.checkInTime), 'HH:mm', { locale: tr })}
                      {record.checkOutTime && (
                        <> - {format(new Date(record.checkOutTime), 'HH:mm', { locale: tr })}</>
                      )}
                    </p>
                    {record.duration && (
                      <p className="text-[10px] md:text-xs text-muted-foreground">
                        {Math.floor(record.duration / 60)}s {record.duration % 60}dk
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CheckIn;
