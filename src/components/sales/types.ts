
export interface SaleItem {
  type: 'product' | 'service';
  itemId: string;
  quantity?: number;
  discount: number;
  staffId?: number;
  staffName?: string;
  commissionRate?: number;
}

export interface UnifiedSaleFormData {
  customerId: string;
  items: SaleItem[];
}

export interface SaleFormProps {
  showForm: boolean;
  setShowForm: (show: boolean) => void;
}

export interface SaleItemSelectorProps {
  item: SaleItem;
  index: number;
  onUpdate: (index: number, item: SaleItem) => void;
  onRemove: (index: number) => void;
}
