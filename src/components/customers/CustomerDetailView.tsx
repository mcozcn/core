
import React, { useState } from 'react';
import { getCurrentUser, type User } from '@/utils/storage/userManager';
import { type Customer } from '@/utils/storage/customers';
import { useQuery } from '@tanstack/react-query';
import { getAppointments, getCustomerRecords } from '@/utils/storage';
import CustomerInfoHeader from './detail/CustomerInfoHeader';
import CustomerInfoCards from './detail/CustomerInfoCards';
import CustomerNotes from './detail/CustomerNotes';
import CustomerAppointmentsRecords from './detail/CustomerAppointmentsRecords';

interface CustomerDetailViewProps {
  customer: Customer;
  onCustomerUpdated: () => void;
  onCustomerDeleted?: () => void;
}

const CustomerDetailView = ({ customer, onCustomerUpdated, onCustomerDeleted }: CustomerDetailViewProps) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Fetch appointments and records for this customer
  const { data: allAppointments = [] } = useQuery({
    queryKey: ['appointments'],
    queryFn: getAppointments,
  });

  const { data: allRecords = [] } = useQuery({
    queryKey: ['customerRecords'],
    queryFn: getCustomerRecords,
  });

  const customerAppointments = allAppointments.filter(apt => apt.customerId === customer.id);
  const customerRecords = allRecords.filter(record => record.customerId === customer.id);

  React.useEffect(() => {
    loadCurrentUser();
  }, []);

  const loadCurrentUser = async () => {
    const user = await getCurrentUser();
    setCurrentUser(user);
  };

  const isAdmin = currentUser?.role === 'admin';

  return (
    <div className="space-y-6">
      <CustomerInfoHeader
        customer={customer}
        isAdmin={isAdmin}
        onCustomerUpdated={onCustomerUpdated}
        onCustomerDeleted={onCustomerDeleted}
      />

      <CustomerInfoCards
        customer={customer}
        customerAppointments={customerAppointments}
      />

      <CustomerNotes customer={customer} />

      <CustomerAppointmentsRecords
        customerAppointments={customerAppointments}
        customerRecords={customerRecords}
        customerPhone={customer.phone}
      />
    </div>
  );
};

export default CustomerDetailView;
