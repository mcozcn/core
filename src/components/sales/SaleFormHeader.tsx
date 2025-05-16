
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { getCustomers } from "@/utils/storage";

interface SaleFormHeaderProps {
  customerId: string;
  onCustomerChange: (value: string) => void;
}

const SaleFormHeader = ({ customerId, onCustomerChange }: SaleFormHeaderProps) => {
  const { data: customers = [] } = useQuery({
    queryKey: ['customers'],
    queryFn: getCustomers,
    initialData: [],
  });

  return (
    <div className="space-y-2">
      <Select value={customerId} onValueChange={onCustomerChange}>
        <SelectTrigger>
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
    </div>
  );
};

export default SaleFormHeader;
