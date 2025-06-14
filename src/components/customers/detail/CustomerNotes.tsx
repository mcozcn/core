
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { type Customer } from '@/utils/storage';

interface CustomerNotesProps {
  customer: Customer;
}

const CustomerNotes = ({ customer }: CustomerNotesProps) => {
  if (!customer.notes) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notlar</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
          {customer.notes}
        </p>
      </CardContent>
    </Card>
  );
};

export default CustomerNotes;
