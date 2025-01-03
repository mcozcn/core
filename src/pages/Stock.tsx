import React, { useState } from 'react';
import AddProductForm from '@/components/stock/AddProductForm';
import StockEntryForm from '@/components/stock/StockEntryForm';
import StockTable from '@/components/stock/StockTable';
import SearchInput from '@/components/common/SearchInput';
import { useQuery } from "@tanstack/react-query";
import { getStock } from "@/utils/localStorage";
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

const Stock = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEntryForm, setShowEntryForm] = useState(false);
  
  const { data: stock = [] } = useQuery({
    queryKey: ['stock'],
    queryFn: getStock,
  });

  return (
    <div className="p-8 pl-72 animate-fadeIn">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-4xl font-serif">Stok Yönetimi</h1>
        <div className="space-x-2">
          <Button onClick={() => setShowAddForm(true)} className="gap-2">
            <Plus className="h-4 w-4" /> Yeni Ürün
          </Button>
          <Button onClick={() => setShowEntryForm(true)} variant="secondary" className="gap-2">
            <Plus className="h-4 w-4" /> Stok Girişi
          </Button>
        </div>
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
          showForm={showAddForm}
          setShowForm={setShowAddForm}
          stock={stock}
        />
        <StockEntryForm
          showForm={showEntryForm}
          setShowForm={setShowEntryForm}
          stock={stock}
        />
        <StockTable searchTerm={searchTerm} />
      </div>
    </div>
  );
};

export default Stock;