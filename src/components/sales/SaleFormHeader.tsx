import React from 'react';
import CustomerSelect from '../common/CustomerSelect';

interface SaleFormHeaderProps {
  customerId: string;
  onCustomerChange: (value: string) => void;
}

const SaleFormHeader = ({ customerId, onCustomerChange }: SaleFormHeaderProps) => {
  return (
    <div>
      <CustomerSelect
        value={customerId}
        onValueChange={onCustomerChange}
      />
    </div>
  );
};

export default SaleFormHeader;