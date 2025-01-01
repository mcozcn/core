import React, { useState } from 'react';
import AddCustomerRecordForm from '@/components/customers/AddCustomerRecordForm';
import CustomerRecordsList from '@/components/customers/CustomerRecordsList';
import SearchInput from '@/components/common/SearchInput';

const Customers = () => {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="p-8 pl-72 animate-fadeIn">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-4xl font-serif">Müşteri Kayıtları</h1>
      </div>

      <div className="mb-6">
        <SearchInput
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Müşteri ara..."
        />
      </div>

      <div className="space-y-6">
        <AddCustomerRecordForm />
        <CustomerRecordsList searchTerm={searchTerm} />
      </div>
    </div>
  );
};

export default Customers;