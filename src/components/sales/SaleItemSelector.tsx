
import React from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getStock, getServices } from "@/utils/localStorage";
import { UnifiedSaleFormData } from './types';

interface SaleItemSelectorProps {
  item: UnifiedSaleFormData['items'][0];
  index: number;
  onUpdate: (index: number, item: UnifiedSaleFormData['items'][0]) => void;
  onRemove: (index: number) => void;
}

const SaleItemSelector = ({ item, index, onUpdate, onRemove }: SaleItemSelectorProps) => {
  const { data: stock = [] } = useQuery({
    queryKey: ['stock'],
    queryFn: getStock,
  });

  const { data: services = [] } = useQuery({
    queryKey: ['services'],
    queryFn: getServices,
  });

  const handleTypeChange = (type: 'product' | 'service') => {
    onUpdate(index, { ...item, type, itemId: '', quantity: type === 'product' ? 1 : 1 });
  };

  const handleItemChange = (itemId: string) => {
    onUpdate(index, { ...item, itemId });
  };

  const handleQuantityChange = (quantity: number) => {
    onUpdate(index, { ...item, quantity });
  };

  const handleDiscountChange = (discount: number) => {
    onUpdate(index, { ...item, discount });
  };

  const currentItem = item.type === 'product' 
    ? stock.find(p => p.productId.toString() === item.itemId)
    : services.find(s => s.id.toString() === item.itemId);

  const itemPrice = currentItem ? (item.type === 'product' ? currentItem.price : currentItem.price) : 0;
  const subtotal = itemPrice * (item.quantity || 1);
  const total = subtotal - (item.discount || 0);

  return (
    <Card className="p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="font-medium">Ürün/Hizmet {index + 1}</h4>
        {index > 0 && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => onRemove(index)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Tür</Label>
          <Select value={item.type} onValueChange={handleTypeChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="product">Ürün</SelectItem>
              <SelectItem value="service">Hizmet</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>{item.type === 'product' ? 'Ürün' : 'Hizmet'}</Label>
          <Select value={item.itemId} onValueChange={handleItemChange}>
            <SelectTrigger>
              <SelectValue placeholder="Seçin..." />
            </SelectTrigger>
            <SelectContent>
              {item.type === 'product' 
                ? stock.map(product => (
                    <SelectItem key={product.productId} value={product.productId.toString()}>
                      {product.name} - ₺{product.price}
                    </SelectItem>
                  ))
                : services.map(service => (
                    <SelectItem key={service.id} value={service.id.toString()}>
                      {service.name} - ₺{service.price}
                    </SelectItem>
                  ))
              }
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Miktar</Label>
          <p className="text-xs text-muted-foreground mb-1">Satılan adet sayısı</p>
          <Input
            type="number"
            min="1"
            value={item.quantity || 1}
            onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
          />
        </div>

        <div>
          <Label>İndirim (₺)</Label>
          <p className="text-xs text-muted-foreground mb-1">Toplam tutardan düşülecek</p>
          <Input
            type="number"
            min="0"
            step="0.01"
            value={item.discount || 0}
            onChange={(e) => handleDiscountChange(parseFloat(e.target.value) || 0)}
          />
        </div>
      </div>

      {currentItem && (
        <div className="bg-accent/20 p-3 rounded text-sm">
          <div className="flex justify-between">
            <span>Birim Fiyat:</span>
            <span>₺{itemPrice.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="flex justify-between">
            <span>Ara Toplam:</span>
            <span>₺{subtotal.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</span>
          </div>
          {(item.discount || 0) > 0 && (
            <div className="flex justify-between text-green-600">
              <span>İndirim:</span>
              <span>-₺{(item.discount || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</span>
            </div>
          )}
          <div className="flex justify-between font-medium border-t pt-1 mt-1">
            <span>Toplam:</span>
            <span>₺{total.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</span>
          </div>
        </div>
      )}
    </Card>
  );
};

export default SaleItemSelector;
