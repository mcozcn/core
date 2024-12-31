import React from 'react';
import { useQuery } from "@tanstack/react-query";
import { getCustomers } from "@/utils/localStorage";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CustomerSelectProps {
  value: string;
  onValueChange: (value: string) => void;
}

const CustomerSelect = ({ value, onValueChange }: CustomerSelectProps) => {
  const { data: customers = [] } = useQuery({
    queryKey: ['customers'],
    queryFn: () => {
      console.log('Fetching customers for select');
      return getCustomers();
    },
  });

  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Müşteri seçin" />
      </SelectTrigger>
      <SelectContent>
        {customers.map((customer) => (
          <SelectItem key={customer.id} value={customer.id.toString()}>
            {customer.name} - {customer.phone}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default CustomerSelect;