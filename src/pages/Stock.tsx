import React, { useState } from 'react';
import AddProductForm from '@/components/stock/AddProductForm';
import StockTable from '@/components/stock/StockTable';
import SearchInput from '@/components/common/SearchInput';

const Stock = () => {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="p-8 pl-72 animate-fadeIn">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-4xl font-serif">Stok Yönetimi</h1>
      </div>

      <div className="mb-6">
        <SearchInput
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Ürün ara..."
        />
      </div>

      <div className="space-y-6">
        <AddProductForm />
        <StockTable searchTerm={searchTerm} />
      </div>
    </div>
  );
};

export default Stock;