import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import CustomerSelect from '../common/CustomerSelect';
import SaleItemSelector from './SaleItemSelector';
import { useSaleSubmit } from './hooks/useSaleSubmit';
import { SaleFormProps, UnifiedSaleFormData } from './types';

const UnifiedSaleForm = ({ showForm, setShowForm }: SaleFormProps) => {
  const [formData, setFormData] = useState<UnifiedSaleFormData>({
    customerId: '',
    items: [{ type: 'product', itemId: '', quantity: 1, discount: 0 }]
  });

  const { handleSubmit, isSubmitting } = useSaleSubmit(() => {
    setFormData({
      customerId: '',
      items: [{ type: 'product', itemId: '', quantity: 1, discount: 0 }]
    });
    setShowForm(false);
  });

  const handleAddItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { type: 'product', itemId: '', quantity: 1, discount: 0 }]
    }));
  };

  const handleRemoveItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const handleUpdateItem = (index: number, item: UnifiedSaleFormData['items'][0]) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map((oldItem, i) => i === index ? item : oldItem)
    }));
  };

  if (!showForm) return null;

  return (
    <Card className="p-6 mb-8">
      <form onSubmit={(e) => { e.preventDefault(); handleSubmit(formData); }} className="space-y-4">
        <div>
          <CustomerSelect
            value={formData.customerId}
            onValueChange={(value) => setFormData(prev => ({ ...prev, customerId: value }))}
          />
        </div>

        <div className="space-y-4">
          {formData.items.map((item, index) => (
            <SaleItemSelector
              key={index}
              item={item}
              index={index}
              onUpdate={handleUpdateItem}
              onRemove={handleRemoveItem}
            />
          ))}
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={handleAddItem}
          className="w-full"
        >
          <Plus className="mr-2 h-4 w-4" /> Yeni Ürün/Hizmet Ekle
        </Button>

        <div className="flex gap-2">
          <Button type="submit" className="flex-1" disabled={isSubmitting}>
            {isSubmitting ? "İşleniyor..." : "Satışı Tamamla"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowForm(false)}
          >
            İptal
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default UnifiedSaleForm;