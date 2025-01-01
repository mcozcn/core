import React, { useState } from 'react';
import AddProductForm from '@/components/stock/AddProductForm';
import StockTable from '@/components/stock/StockTable';
import SearchInput from '@/components/common/SearchInput';
import { useQuery } from "@tanstack/react-query";
import { getStock } from "@/utils/localStorage";

const Stock = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  
  const { data: stock = [] } = useQuery({
    queryKey: ['stock'],
    queryFn: getStock,
  });

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
        <AddProductForm 
          showForm={showForm}
          setShowForm={setShowForm}
          stock={stock}
        />
        <StockTable searchTerm={searchTerm} />
      </div>
    </div>
  );
};

export default Stock;