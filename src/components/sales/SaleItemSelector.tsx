import React from 'react';
import { useQuery } from "@tanstack/react-query";
import { getStock, getServices } from "@/utils/localStorage";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { SaleItemSelectorProps } from './types';

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

  return (
    <div className="space-y-4 p-4 border rounded-lg">
      <div className="flex justify-between items-center">
        <Label>Satış Türü #{index + 1}</Label>
        <Button
          variant="destructive"
          size="sm"
          onClick={() => onRemove(index)}
        >
          Kaldır
        </Button>
      </div>

      <div className="space-y-4">
        <div>
          <Label>Tür</Label>
          <Select
            value={item.type}
            onValueChange={(value: 'product' | 'service') => 
              onUpdate(index, { ...item, type: value, itemId: '' })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Tür seçin" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="product">Ürün</SelectItem>
              <SelectItem value="service">Hizmet</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>{item.type === 'product' ? 'Ürün' : 'Hizmet'}</Label>
          <Select
            value={item.itemId}
            onValueChange={(value) => onUpdate(index, { ...item, itemId: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder={item.type === 'product' ? 'Ürün seçin' : 'Hizmet seçin'} />
            </SelectTrigger>
            <SelectContent>
              {item.type === 'product' ? (
                stock.map((stockItem) => (
                  <SelectItem key={stockItem.productId} value={stockItem.productId.toString()}>
                    {stockItem.productName} - Stok: {stockItem.quantity} - {stockItem.price} ₺
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

        {item.type === 'product' && (
          <div>
            <Label>Miktar</Label>
            <Input
              type="number"
              value={item.quantity || '1'}
              onChange={(e) => onUpdate(index, { ...item, quantity: Number(e.target.value) })}
              min="1"
              required
            />
          </div>
        )}

        <div>
          <Label>İndirim Tutarı (₺)</Label>
          <Input
            type="number"
            value={item.discount}
            onChange={(e) => onUpdate(index, { ...item, discount: Number(e.target.value) })}
            min="0"
          />
        </div>
      </div>
    </div>
  );
};

export default SaleItemSelector;