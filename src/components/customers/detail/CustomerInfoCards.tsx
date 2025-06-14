
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Phone, Mail, Calendar, MapPin, CreditCard, DollarSign, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { type Customer } from '@/utils/storage';

interface CustomerInfoCardsProps {
  customer: Customer;
  customerAppointments: any[];
}

const CustomerInfoCards = ({ customer, customerAppointments }: CustomerInfoCardsProps) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(amount);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Contact Information Card */}
      <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-medium text-blue-700 dark:text-blue-300 flex items-center gap-2">
            <Phone className="h-5 w-5" />
            İletişim Bilgileri
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {customer.phone && (
            <div className="flex items-center gap-3 p-2 bg-white/50 dark:bg-gray-800/50 rounded-md">
              <Phone className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-xs text-muted-foreground">Telefon</p>
                <p className="font-medium">{customer.phone}</p>
              </div>
            </div>
          )}
          {customer.email && (
            <div className="flex items-center gap-3 p-2 bg-white/50 dark:bg-gray-800/50 rounded-md">
              <Mail className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-xs text-muted-foreground">E-posta</p>
                <p className="font-medium text-sm">{customer.email}</p>
              </div>
            </div>
          )}
          {customer.address && (
            <div className="flex items-start gap-3 p-2 bg-white/50 dark:bg-gray-800/50 rounded-md">
              <MapPin className="h-4 w-4 text-blue-600 mt-1" />
              <div>
                <p className="text-xs text-muted-foreground">Adres</p>
                <p className="font-medium text-sm leading-tight">{customer.address}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Financial Information Card */}
      <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-orange-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-medium text-orange-700 dark:text-orange-300 flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Finansal Durum
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="p-3 bg-white/50 dark:bg-gray-800/50 rounded-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-red-600" />
                <span className="text-sm text-muted-foreground">Borç</span>
              </div>
              <span className="font-bold text-red-600">{formatCurrency(customer.debt || 0)}</span>
            </div>
          </div>
          <div className="p-3 bg-white/50 dark:bg-gray-800/50 rounded-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-green-600" />
                <span className="text-sm text-muted-foreground">Toplam Harcama</span>
              </div>
              <span className="font-bold text-green-600">{formatCurrency(customer.totalSpent || 0)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics and Dates Card */}
      <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-medium text-purple-700 dark:text-purple-300 flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            İstatistikler
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="p-3 bg-white/50 dark:bg-gray-800/50 rounded-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-purple-600" />
                <span className="text-sm text-muted-foreground">Randevu Sayısı</span>
              </div>
              <span className="font-bold text-purple-600">{customerAppointments.length}</span>
            </div>
          </div>
          <div className="p-3 bg-white/50 dark:bg-gray-800/50 rounded-md">
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="h-4 w-4 text-purple-600" />
              <span className="text-sm text-muted-foreground">Kayıt Tarihi</span>
            </div>
            <span className="font-medium text-sm">
              {format(new Date(customer.createdAt), 'dd MMMM yyyy', { locale: tr })}
            </span>
          </div>
          {customer.birthDate && (
            <div className="p-3 bg-white/50 dark:bg-gray-800/50 rounded-md">
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="h-4 w-4 text-purple-600" />
                <span className="text-sm text-muted-foreground">Doğum Tarihi</span>
              </div>
              <span className="font-medium text-sm">
                {format(new Date(customer.birthDate), 'dd MMMM yyyy', { locale: tr })}
              </span>
            </div>
          )}
          {customer.lastVisit && (
            <div className="p-3 bg-white/50 dark:bg-gray-800/50 rounded-md">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="h-4 w-4 text-purple-600" />
                <span className="text-sm text-muted-foreground">Son Ziyaret</span>
              </div>
              <span className="font-medium text-sm">
                {format(new Date(customer.lastVisit), 'dd MMMM yyyy', { locale: tr })}
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomerInfoCards;
