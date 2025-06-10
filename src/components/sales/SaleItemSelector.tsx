
import React from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, Package, Scissors, Percent, Users } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getStock, getServices, getUsers } from "@/utils/localStorage";
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

  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: getUsers,
  });

  // Filter staff users
  const staffUsers = users.filter(user => user.role === 'staff');

  const selectedItem = item.type === 'product' 
    ? stock.find(p => p.id.toString() === item.itemId || p.productId?.toString() === item.itemId)
    : services.find(s => s.id.toString() === item.itemId);

  const selectedStaff = staffUsers.find(staff => staff.id.toString() === item.staffId);

  const calculateTotal = () => {
    if (!selectedItem) return 0;
    const basePrice = selectedItem.price * (item.type === 'product' ? (item.quantity || 1) : 1);
    return basePrice - (item.discount || 0);
  };

  const calculateCommission = () => {
    if (!item.commissionRate) return 0;
    const total = calculateTotal();
    return (total * item.commissionRate) / 100;
  };

  return (
    <Card className="p-4 border-l-4 border-l-primary/30">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-2">
          {item.type === 'product' ? <Package className="h-4 w-4 text-blue-500" /> : <Scissors className="h-4 w-4 text-purple-500" />}
          <span className="text-sm font-medium">
            {item.type === 'product' ? 'Ürün' : 'Hizmet'} #{index + 1}
          </span>
        </div>
        {index > 0 && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onRemove(index)}
            className="text-red-500 hover:text-red-700 hover:bg-red-50"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Item Type Selection */}
        <div>
          <Label className="text-xs font-medium">Tür</Label>
          <Select
            value={item.type}
            onValueChange={(value: 'product' | 'service') => {
              onUpdate(index, { ...item, type: value, itemId: '', quantity: value === 'product' ? 1 : undefined });
            }}
          >
            <SelectTrigger className="h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="product">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-blue-500" />
                  Ürün
                </div>
              </SelectItem>
              <SelectItem value="service">
                <div className="flex items-center gap-2">
                  <Scissors className="h-4 w-4 text-purple-500" />
                  Hizmet
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Item Selection */}
        <div>
          <Label className="text-xs font-medium">
            {item.type === 'product' ? 'Ürün' : 'Hizmet'} Seç
          </Label>
          <Select
            value={item.itemId}
            onValueChange={(value) => onUpdate(index, { ...item, itemId: value })}
          >
            <SelectTrigger className="h-9">
              <SelectValue placeholder={`${item.type === 'product' ? 'Ürün' : 'Hizmet'} seçin`} />
            </SelectTrigger>
            <SelectContent>
              {item.type === 'product' 
                ? stock.map((product) => (
                    <SelectItem key={product.id} value={product.id.toString()}>
                      {product.name || product.productName} - ₺{product.price}
                      {product.quantity <= 5 && <span className="text-red-500 ml-1">(Stok az: {product.quantity})</span>}
                    </SelectItem>
                  ))
                : services.map((service) => (
                    <SelectItem key={service.id} value={service.id.toString()}>
                      {service.name} - ₺{service.price}
                    </SelectItem>
                  ))
              }
            </SelectContent>
          </Select>
        </div>

        {/* Quantity (only for products) */}
        {item.type === 'product' && (
          <div>
            <Label className="text-xs font-medium">Miktar</Label>
            <Input
              type="number"
              min="1"
              value={item.quantity || 1}
              onChange={(e) => onUpdate(index, { ...item, quantity: parseInt(e.target.value) || 1 })}
              className="h-9"
            />
          </div>
        )}

        {/* Discount */}
        <div>
          <Label className="text-xs font-medium">İndirim (₺)</Label>
          <Input
            type="number"
            min="0"
            step="0.01"
            value={item.discount || 0}
            onChange={(e) => onUpdate(index, { ...item, discount: parseFloat(e.target.value) || 0 })}
            className="h-9"
          />
        </div>

        {/* Staff Selection */}
        <div>
          <Label className="text-xs font-medium flex items-center gap-1">
            <Users className="h-3 w-3" />
            Personel
          </Label>
          <Select
            value={item.staffId || ''}
            onValueChange={(value) => onUpdate(index, { ...item, staffId: value, staffName: staffUsers.find(s => s.id.toString() === value)?.displayName || staffUsers.find(s => s.id.toString() === value)?.username })}
          >
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Personel seçin" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Personel Yok</SelectItem>
              {staffUsers.map((staff) => (
                <SelectItem key={staff.id} value={staff.id.toString()}>
                  {staff.displayName || staff.username}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Commission Rate */}
        <div>
          <Label className="text-xs font-medium flex items-center gap-1">
            <Percent className="h-3 w-3" />
            Prim Oranı (%)
          </Label>
          <Input
            type="number"
            min="0"
            max="100"
            step="0.5"
            value={item.commissionRate || 0}
            onChange={(e) => onUpdate(index, { ...item, commissionRate: parseFloat(e.target.value) || 0 })}
            className="h-9"
            placeholder="0"
          />
        </div>
      </div>

      {/* Summary Row */}
      {selectedItem && (
        <div className="mt-4 pt-3 border-t bg-accent/10 rounded p-2">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
            <div>
              <span className="text-muted-foreground">Birim Fiyat:</span>
              <p className="font-medium">₺{selectedItem.price}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Toplam:</span>
              <p className="font-medium">₺{calculateTotal().toFixed(2)}</p>
            </div>
            {selectedStaff && (
              <div>
                <span className="text-muted-foreground">Personel:</span>
                <p className="font-medium">{selectedStaff.displayName || selectedStaff.username}</p>
              </div>
            )}
            {item.commissionRate && (
              <div>
                <span className="text-muted-foreground">Prim:</span>
                <p className="font-medium text-green-600">₺{calculateCommission().toFixed(2)}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </Card>
  );
};

export default SaleItemSelector;
