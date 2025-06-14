
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import CustomerAppointmentsList from '../CustomerAppointmentsList';
import CustomerRecordsList from '../CustomerRecordsList';

interface CustomerAppointmentsRecordsProps {
  customerAppointments: any[];
  customerRecords: any[];
  customerPhone: string;
}

const CustomerAppointmentsRecords = ({ customerAppointments, customerRecords, customerPhone }: CustomerAppointmentsRecordsProps) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Randevular</CardTitle>
        </CardHeader>
        <CardContent>
          <CustomerAppointmentsList 
            appointments={customerAppointments} 
            customerPhone={customerPhone}
          />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Kayıtlar</CardTitle>
        </CardHeader>
        <CardContent>
          <CustomerRecordsList records={customerRecords} />
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomerAppointmentsRecords;
