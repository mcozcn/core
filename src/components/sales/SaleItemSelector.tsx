
import React from 'react';
import { useQuery } from "@tanstack/react-query";
import { getStock, getServices } from "@/utils/localStorage";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SaleItemSelectorProps } from './types';
import { X } from "lucide-react";

const SaleItemSelector = ({ item, index, onUpdate, onRemove }: SaleItemSelectorProps) => {
  const { data: stock = [] } = useQuery({
    queryKey: ['stock'],
    queryFn: getStock,
    initialData: [],
  });

  const { data: services = [] } = useQuery({
    queryKey: ['services'],
    queryFn: getServices,
    initialData: [],
  });

  const items = item.type === 'product' ? stock : services;

  // Get selected item details
  const selectedItem = item.type === 'product' 
    ? stock.find(p => p.productId.toString() === item.itemId)
    : services.find(s => s.id.toString() === item.itemId);
  
  const itemPrice = selectedItem 
    ? item.type === 'product' 
      ? (selectedItem.price * (item.quantity || 1)) - (item.discount || 0)
      : selectedItem.price - (item.discount || 0)
    : 0;

  return (
    <div className="p-3 border rounded-lg bg-white hover:bg-gray-50 transition-colors">
      <div className="flex flex-wrap gap-2">
        <div className="flex-1 min-w-[120px]">
          <Select
            value={item.type}
            onValueChange={(value: 'product' | 'service') => 
              onUpdate(index, { ...item, type: value, itemId: '' })
            }
          >
            <SelectTrigger className="h-9 text-xs">
              <SelectValue placeholder="Tür" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="product">Ürün</SelectItem>
              <SelectItem value="service">Hizmet</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex-[3] min-w-[180px]">
          <Select
            value={item.itemId}
            onValueChange={(value) => onUpdate(index, { ...item, itemId: value })}
          >
            <SelectTrigger className="h-9 text-xs">
              <SelectValue placeholder={item.type === 'product' ? 'Ürün seçin' : 'Hizmet seçin'} />
            </SelectTrigger>
            <SelectContent>
              {item.type === 'product' ? (
                stock.map((stockItem) => (
                  <SelectItem key={stockItem.productId} value={stockItem.productId.toString()}>
                    {stockItem.productName} ({stockItem.quantity}) - {stockItem.price} ₺
                  </SelectItem>
                ))
              ) : (
                services.map((service) => (
                  <SelectItem key={service.id} value={service.id.toString()}>
                    {service.name} - {service.price} ₺
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-20">
            {item.type === 'product' && (
              <Input
                type="number"
                value={item.quantity || '1'}
                onChange={(e) => onUpdate(index, { ...item, quantity: Number(e.target.value) })}
                min="1"
                className="h-9 text-xs text-right"
                placeholder="Miktar"
              />
            )}
          </div>

          <div className="w-20">
            <Input
              type="number"
              value={item.discount}
              onChange={(e) => onUpdate(index, { ...item, discount: Number(e.target.value) })}
              min="0"
              className="h-9 text-xs text-right"
              placeholder="İndirim"
            />
          </div>
          
          <div className="w-24 text-right font-medium text-sm">
            {itemPrice > 0 ? `₺${itemPrice.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}` : ''}
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => onRemove(index)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SaleItemSelector;
