import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SaleItem } from './types';
import { StockItem, Service } from '@/utils/localStorage';

interface SaleItemSelectorProps {
  item: SaleItem;
  index: number;
  stock: StockItem[];
  services: Service[];
  onUpdate: (index: number, item: SaleItem) => void;
  onRemove: (index: number) => void;
}

const SaleItemSelector = ({
  item,
  index,
  stock,
  services,
  onUpdate,
  onRemove
}: SaleItemSelectorProps) => {
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