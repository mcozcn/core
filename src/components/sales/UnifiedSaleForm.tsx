
import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, ShoppingCart, X, Save } from "lucide-react";
import SaleFormHeader from './SaleFormHeader';
import SaleItemSelector from './SaleItemSelector';
import { useSaleSubmit } from './hooks/useSaleSubmit';
import { SaleFormProps, UnifiedSaleFormData } from './types';
import { useQuery } from "@tanstack/react-query";
import { getStock, getServices } from "@/utils/localStorage";

const UnifiedSaleForm = ({ showForm, setShowForm }: SaleFormProps) => {
  const [formData, setFormData] = useState<UnifiedSaleFormData>({
    customerId: '',
    items: [{ type: 'product', itemId: '', quantity: 1, discount: 0 }]
  });

  const { data: stock = [] } = useQuery({
    queryKey: ['stock'],
    queryFn: getStock,
  });

  const { data: services = [] } = useQuery({
    queryKey: ['services'],
    queryFn: getServices,
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

  // Calculate summary data
  const calculateSummary = () => {
    let totalAmount = 0;
    let totalDiscount = 0;

    formData.items.forEach(item => {
      if (!item.itemId) return;
      
      if (item.type === 'product') {
        const product = stock.find(p => p.productId.toString() === item.itemId);
        if (product) {
          totalAmount += product.price * (item.quantity || 1);
          totalDiscount += item.discount || 0;
        }
      } else {
        const service = services.find(s => s.id.toString() === item.itemId);
        if (service) {
          totalAmount += service.price;
          totalDiscount += item.discount || 0;
        }
      }
    });

    return {
      subtotal: totalAmount,
      discount: totalDiscount,
      total: totalAmount - totalDiscount
    };
  };

  const summary = calculateSummary();

  if (!showForm) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <Card className="w-full max-w-2xl bg-white shadow-lg max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 z-10 bg-white border-b p-4 flex justify-between items-center">
          <h3 className="text-xl font-semibold flex items-center">
            <ShoppingCart className="mr-2 h-5 w-5" />
            Yeni Satış Oluştur
          </h3>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setShowForm(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="p-4">
          <form onSubmit={(e) => { e.preventDefault(); handleSubmit(formData); }} className="space-y-4">
            <div className="bg-accent/30 p-4 rounded-lg">
              <SaleFormHeader
                customerId={formData.customerId}
                onCustomerChange={(value) => setFormData(prev => ({ ...prev, customerId: value }))}
              />
            </div>

            <div className="space-y-2 max-h-[40vh] overflow-y-auto p-1">
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
              className="w-full border-dashed"
            >
              <Plus className="mr-2 h-4 w-4" /> Yeni Ürün/Hizmet Ekle
            </Button>

            {/* Summary Card - Fixed at bottom */}
            <div className="bg-accent/20 p-4 rounded-lg">
              <div className="grid grid-cols-2 gap-2">
                <div className="text-sm">Ara Toplam:</div>
                <div className="text-sm font-medium text-right">
                  ₺{summary.subtotal.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                </div>
                
                <div className="text-sm">Toplam İndirim:</div>
                <div className="text-sm font-medium text-right text-green-600">
                  -₺{summary.discount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                </div>
                
                <div className="font-semibold border-t pt-2 mt-1">Genel Toplam:</div>
                <div className="font-bold text-right border-t pt-2 mt-1 text-primary">
                  ₺{summary.total.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button 
                type="submit" 
                className="flex-1" 
                disabled={isSubmitting || !formData.customerId || formData.items.some(item => !item.itemId)}
              >
                {isSubmitting ? "İşleniyor..." : <><Save className="mr-2 h-4 w-4" /> Satışı Tamamla</>}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowForm(false)}
              >
                <X className="mr-2 h-4 w-4" /> İptal
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
};

export default UnifiedSaleForm;
