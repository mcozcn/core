
import React from 'react';
import { useQuery } from "@tanstack/react-query";
import { getStock, getServices, getUsers } from "@/utils/localStorage";
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

  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: getUsers,
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

  // Calculate commission based on rate
  const commissionRate = item.commissionRate || 
    (selectedItem && 'commissionRate' in selectedItem ? selectedItem.commissionRate || 0 : 0);
    
  const commissionAmount = (commissionRate / 100) * itemPrice;

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
            onValueChange={(value) => {
              const selectedItem = item.type === 'product' 
                ? stock.find(p => p.productId.toString() === value)
                : services.find(s => s.id.toString() === value);
              
              const newCommissionRate = selectedItem && 'commissionRate' in selectedItem 
                ? selectedItem.commissionRate || 0
                : 0;
              
              onUpdate(index, { 
                ...item, 
                itemId: value,
                commissionRate: newCommissionRate
              });
            }}
          >
            <SelectTrigger className="h-9 text-xs">
              <SelectValue placeholder={item.type === 'product' ? 'Ürün seçin' : 'Hizmet seçin'} />
            </SelectTrigger>
            <SelectContent>
              {item.type === 'product' ? (
                stock.map((stockItem) => (
                  <SelectItem key={stockItem.productId} value={stockItem.productId.toString()}>
                    {stockItem.productName} ({stockItem.quantity}) - {stockItem.price} ₺
                    {stockItem.commissionRate ? ` - Kom: %${stockItem.commissionRate}` : ''}
                  </SelectItem>
                ))
              ) : (
                services.map((service) => (
                  <SelectItem key={service.id} value={service.id.toString()}>
                    {service.name} - {service.price} ₺
                    {service.commissionRate ? ` - Kom: %${service.commissionRate}` : ''}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
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

          <div className="w-16">
            <Input
              type="number"
              value={item.commissionRate || 0}
              onChange={(e) => onUpdate(index, { 
                ...item, 
                commissionRate: Number(e.target.value),
              })}
              min="0"
              max="100"
              className="h-9 text-xs text-right"
              placeholder="Prim %"
              title="Prim Oranı (%)"
            />
          </div>

          <div className="w-24">
            <Select
              value={item.staffId?.toString() || undefined}
              onValueChange={(value) => {
                const selectedStaff = users.find(u => u.id.toString() === value);
                onUpdate(index, { 
                  ...item, 
                  staffId: Number(value),
                  staffName: selectedStaff?.name || selectedStaff?.displayName || ""
                });
              }}
            >
              <SelectTrigger className="h-9 text-xs">
                <SelectValue placeholder="Personel" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="no-staff">Personel Seçin</SelectItem>
                {users.filter(u => u.role === 'staff').map((user) => (
                  <SelectItem key={user.id} value={user.id.toString()}>
                    {user.name || user.displayName || user.username}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="w-24 text-right font-medium text-sm">
            {itemPrice > 0 ? `₺${itemPrice.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}` : ''}
            {commissionRate > 0 && <div className="text-xs text-green-600">
              Prim: ₺{commissionAmount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
            </div>}
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
