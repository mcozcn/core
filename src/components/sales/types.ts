export interface SaleItem {
  type: 'product' | 'service';
  itemId: string;
  quantity?: number;
  discount: number;
}

export interface UnifiedSaleFormData {
  customerId: string;
  items: SaleItem[];
}