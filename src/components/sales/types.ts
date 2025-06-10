
export interface SaleFormProps {
  showForm: boolean;
  setShowForm: (show: boolean) => void;
}

export interface SaleItem {
  type: 'product' | 'service';
  itemId: string;
  quantity?: number;
  discount: number;
  staffId?: string;
  staffName?: string;
  commissionRate?: number;
}

export interface UnifiedSaleFormData {
  customerId: string;
  items: SaleItem[];
}
