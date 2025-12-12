import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, TrendingUp, TrendingDown, Scale } from 'lucide-react';
import { getBodyMetrics, getMemberBodyMetrics, saveBodyMetric, BodyMetric } from '@/utils/storage/bodyMetrics';
import { getCustomers } from '@/utils/storage/customers';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const BodyMetrics = () => {
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    memberId: 0,
    memberName: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    weight: 0,
    height: 0,
    bodyFat: 0,
    muscleMass: 0,
    chest: 0,
    waist: 0,
    hips: 0,
    biceps: 0,
    thighs: 0,
    notes: '',
  });

  const { data: customers = [] } = useQuery({
    queryKey: ['customers'],
    queryFn: getCustomers,
  });

  const { data: allMetrics = [], refetch } = useQuery({
    queryKey: ['bodyMetrics'],
    queryFn: getBodyMetrics,
  });

  const selectedMemberMetrics = selectedMemberId
    ? allMetrics.filter(m => m.memberId === selectedMemberId).sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      )
    : [];

  const chartData = selectedMemberMetrics
    .slice()
    .reverse()
    .map(m => ({
      date: format(new Date(m.date), 'dd MMM', { locale: tr }),
      weight: m.weight,
      bodyFat: m.bodyFat,
      muscleMass: m.muscleMass,
    }));

  const handleOpenDialog = () => {
    setFormData({
      memberId: 0,
      memberName: '',
      date: format(new Date(), 'yyyy-MM-dd'),
      weight: 0,
      height: 0,
      bodyFat: 0,
      muscleMass: 0,
      chest: 0,
      waist: 0,
      hips: 0,
      biceps: 0,
      thighs: 0,
      notes: '',
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.memberId || !formData.weight) {
      toast({
        variant: 'destructive',
        title: 'Hata',
        description: 'Lütfen üye ve kilo bilgisi girin',
      });
      return;
    }

    const success = await saveBodyMetric({
      ...formData,
      date: new Date(formData.date),
    });

    if (success) {
      toast({
        title: 'Başarılı',
        description: 'Vücut ölçümü kaydedildi',
      });
      refetch();
      setDialogOpen(false);
    } else {
      toast({
        variant: 'destructive',
        title: 'Hata',
        description: 'Kayıt başarısız',
      });
    }
  };

  const handleMemberChange = (memberId: string) => {
    const member = customers.find(c => c.id === parseInt(memberId));
    if (member) {
      setFormData(prev => ({
        ...prev,
        memberId: member.id,
        memberName: member.name,
      }));
    }
  };

  const getProgressIndicator = (current: number, previous: number) => {
    if (!previous) return null;
    const diff = current - previous;
    const percentage = ((diff / previous) * 100).toFixed(1);
    
    if (diff > 0) {
      return (
        <span className="text-xs text-red-500 flex items-center">
          <TrendingUp className="h-3 w-3 mr-1" />
          +{percentage}%
        </span>
      );
    } else if (diff < 0) {
      return (
        <span className="text-xs text-green-500 flex items-center">
          <TrendingDown className="h-3 w-3 mr-1" />
          {percentage}%
        </span>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen p-4 md:p-6 md:ml-56">
      <div className="max-w-7xl mx-auto space-y-4 md:space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-4xl font-bold mb-1 md:mb-2">Vücut Ölçümleri</h1>
            <p className="text-sm md:text-base text-muted-foreground">Üyelerin ilerleme takibi</p>
          </div>
          <Button onClick={handleOpenDialog} size="sm" className="gradient-primary w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            Yeni Ölçüm
          </Button>
        </div>

        {/* Member Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Üye Seçin</CardTitle>
          </CardHeader>
          <CardContent>
            <Select
              value={selectedMemberId?.toString() || ''}
              onValueChange={(value) => setSelectedMemberId(parseInt(value))}
            >
              <SelectTrigger className="w-full md:w-96">
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
          </CardContent>
        </Card>

        {selectedMemberId && selectedMemberMetrics.length > 0 && (
          <>
            {/* Progress Chart */}
            <Card>
              <CardHeader>
                <CardTitle>İlerleme Grafiği</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="weight" stroke="hsl(var(--primary))" name="Kilo (kg)" />
                      <Line type="monotone" dataKey="bodyFat" stroke="hsl(var(--destructive))" name="Yağ (%)" />
                      <Line type="monotone" dataKey="muscleMass" stroke="hsl(var(--secondary))" name="Kas (kg)" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Latest Measurements */}
            <Card>
              <CardHeader>
                <CardTitle>Ölçüm Geçmişi</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {selectedMemberMetrics.map((metric, index) => {
                    const previous = selectedMemberMetrics[index + 1];
                    return (
                      <div key={metric.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <p className="text-sm text-muted-foreground">
                              {format(new Date(metric.date), 'dd MMMM yyyy', { locale: tr })}
                            </p>
                          </div>
                          {metric.bmi && (
                            <div className="text-right">
                              <p className="text-sm font-medium">BMI: {metric.bmi}</p>
                            </div>
                          )}
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <p className="text-xs text-muted-foreground">Kilo</p>
                            <div className="flex items-center gap-2">
                              <p className="text-lg font-bold">{metric.weight} kg</p>
                              {previous && getProgressIndicator(metric.weight, previous.weight)}
                            </div>
                          </div>
                          {metric.bodyFat > 0 && (
                            <div>
                              <p className="text-xs text-muted-foreground">Vücut Yağı</p>
                              <div className="flex items-center gap-2">
                                <p className="text-lg font-bold">{metric.bodyFat}%</p>
                                {previous && previous.bodyFat && 
                                  getProgressIndicator(metric.bodyFat, previous.bodyFat)}
                              </div>
                            </div>
                          )}
                          {metric.muscleMass > 0 && (
                            <div>
                              <p className="text-xs text-muted-foreground">Kas Kütlesi</p>
                              <div className="flex items-center gap-2">
                                <p className="text-lg font-bold">{metric.muscleMass} kg</p>
                                {previous && previous.muscleMass && 
                                  getProgressIndicator(metric.muscleMass, previous.muscleMass)}
                              </div>
                            </div>
                          )}
                          {metric.waist > 0 && (
                            <div>
                              <p className="text-xs text-muted-foreground">Bel</p>
                              <p className="text-lg font-bold">{metric.waist} cm</p>
                            </div>
                          )}
                        </div>

                        {metric.notes && (
                          <p className="text-sm text-muted-foreground mt-3 p-2 bg-muted rounded">
                            {metric.notes}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* Add Measurement Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Yeni Vücut Ölçümü</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label>Üye *</Label>
                <Select
                  value={formData.memberId.toString()}
                  onValueChange={handleMemberChange}
                >
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
                <Label htmlFor="date">Tarih</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="weight">Kilo (kg) *</Label>
                  <Input
                    id="weight"
                    type="number"
                    step="0.1"
                    value={formData.weight}
                    onChange={(e) => setFormData(prev => ({ ...prev, weight: parseFloat(e.target.value) }))}
                  />
                </div>
                <div>
                  <Label htmlFor="height">Boy (cm)</Label>
                  <Input
                    id="height"
                    type="number"
                    value={formData.height}
                    onChange={(e) => setFormData(prev => ({ ...prev, height: parseInt(e.target.value) }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="bodyFat">Vücut Yağı (%)</Label>
                  <Input
                    id="bodyFat"
                    type="number"
                    step="0.1"
                    value={formData.bodyFat}
                    onChange={(e) => setFormData(prev => ({ ...prev, bodyFat: parseFloat(e.target.value) }))}
                  />
                </div>
                <div>
                  <Label htmlFor="muscleMass">Kas Kütlesi (kg)</Label>
                  <Input
                    id="muscleMass"
                    type="number"
                    step="0.1"
                    value={formData.muscleMass}
                    onChange={(e) => setFormData(prev => ({ ...prev, muscleMass: parseFloat(e.target.value) }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="chest">Göğüs (cm)</Label>
                  <Input
                    id="chest"
                    type="number"
                    value={formData.chest}
                    onChange={(e) => setFormData(prev => ({ ...prev, chest: parseInt(e.target.value) }))}
                  />
                </div>
                <div>
                  <Label htmlFor="waist">Bel (cm)</Label>
                  <Input
                    id="waist"
                    type="number"
                    value={formData.waist}
                    onChange={(e) => setFormData(prev => ({ ...prev, waist: parseInt(e.target.value) }))}
                  />
                </div>
                <div>
                  <Label htmlFor="hips">Kalça (cm)</Label>
                  <Input
                    id="hips"
                    type="number"
                    value={formData.hips}
                    onChange={(e) => setFormData(prev => ({ ...prev, hips: parseInt(e.target.value) }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="biceps">Kol (cm)</Label>
                  <Input
                    id="biceps"
                    type="number"
                    value={formData.biceps}
                    onChange={(e) => setFormData(prev => ({ ...prev, biceps: parseInt(e.target.value) }))}
                  />
                </div>
                <div>
                  <Label htmlFor="thighs">Bacak (cm)</Label>
                  <Input
                    id="thighs"
                    type="number"
                    value={formData.thighs}
                    onChange={(e) => setFormData(prev => ({ ...prev, thighs: parseInt(e.target.value) }))}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="notes">Notlar</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Ölçüm notları"
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  İptal
                </Button>
                <Button onClick={handleSave} className="gradient-primary">
                  Kaydet
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default BodyMetrics;
