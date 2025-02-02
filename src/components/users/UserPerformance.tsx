import React from 'react';
import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { 
  getUserPerformance, 
  getUserActivities,
  getCurrentUser,
  type UserPerformance,
  type UserActivity
} from "@/utils/localStorage";
import { formatCurrency } from "@/utils/format";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const UserPerformanceComponent = () => {
  const currentUser = getCurrentUser();
  const isAdmin = currentUser?.role === 'admin';

  const { data: performances = [] } = useQuery({
    queryKey: ['userPerformance'],
    queryFn: getUserPerformance
  });

  const { data: activities = [] } = useQuery({
    queryKey: ['userActivities'],
    queryFn: getUserActivities
  });

  // Sadece mevcut kullanıcının veya admin ise tüm kullanıcıların performansını filtrele
  const filteredPerformances = isAdmin 
    ? performances 
    : performances.filter(p => p.userId === currentUser?.id);

  const filteredActivities = isAdmin
    ? activities
    : activities.filter(a => a.userId === currentUser?.id);

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-2xl font-serif mb-4">Performans Özeti</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {filteredPerformances.map((performance) => (
            <div key={performance.userId} className="p-4 bg-accent rounded-lg">
              <div className="text-sm text-muted-foreground">
                {isAdmin ? `Kullanıcı ID: ${performance.userId}` : 'Performansınız'}
              </div>
              <div className="mt-2 space-y-2">
                <div className="flex justify-between">
                  <span>Randevu Sayısı:</span>
                  <span className="font-semibold">{performance.appointmentCount}</span>
                </div>
                <div className="flex justify-between">
                  <span>Satış Sayısı:</span>
                  <span className="font-semibold">{performance.salesCount}</span>
                </div>
                <div className="flex justify-between">
                  <span>Toplam Satış:</span>
                  <span className="font-semibold">{formatCurrency(performance.totalSales)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-2xl font-serif mb-4">Son Aktiviteler</h2>
        <Table>
          <TableHeader>
            <TableRow>
              {isAdmin && <TableHead>Kullanıcı</TableHead>}
              <TableHead>İşlem</TableHead>
              <TableHead>Detay</TableHead>
              <TableHead>Tarih</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredActivities.length === 0 ? (
              <TableRow>
                <TableCell colSpan={isAdmin ? 4 : 3} className="text-center text-muted-foreground">
                  Henüz aktivite bulunmamaktadır.
                </TableCell>
              </TableRow>
            ) : (
              filteredActivities.map((activity) => (
                <TableRow key={activity.id}>
                  {isAdmin && <TableCell>{activity.username}</TableCell>}
                  <TableCell>{activity.action}</TableCell>
                  <TableCell>{activity.details}</TableCell>
                  <TableCell>
                    {new Date(activity.timestamp).toLocaleDateString('tr-TR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default UserPerformanceComponent;