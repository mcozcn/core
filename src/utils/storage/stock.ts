import { supabase } from "@/integrations/supabase/client";
import { ensureWriteAllowed } from '@/utils/guestGuard';
import type { StockItem, Sale } from './types';

const transformDbProduct = (row: any): StockItem => ({
  id: row.id,
  name: row.name,
  description: row.description || '',
  category: row.category || '',
  purchasePrice: row.purchase_price,
  salePrice: row.sale_price,
  stockQuantity: row.stock_quantity,
  minStockLevel: row.min_stock_level || 5,
  isActive: row.is_active,
  createdAt: new Date(row.created_at),
  updatedAt: new Date(row.updated_at),
});

const transformToDbProduct = (item: Partial<StockItem>) => ({
  name: item.name,
  description: item.description || null,
  category: item.category || null,
  purchase_price: item.purchasePrice,
  sale_price: item.salePrice,
  stock_quantity: item.stockQuantity || 0,
  min_stock_level: item.minStockLevel || 5,
  is_active: item.isActive ?? true,
});

const transformDbSale = (row: any): Sale => ({
  id: row.id,
  productId: row.product_id,
  customerId: row.customer_id,
  personnelId: row.personnel_id,
  quantity: row.quantity,
  unitPrice: row.unit_price,
  totalPrice: row.total_price,
  saleDate: new Date(row.sale_date),
  notes: row.notes || '',
  createdAt: new Date(row.created_at),
});

const transformToDbSale = (sale: Partial<Sale>) => ({
  product_id: sale.productId ? String(sale.productId) : null,
  customer_id: sale.customerId ? String(sale.customerId) : null,
  personnel_id: sale.personnelId ? String(sale.personnelId) : null,
  quantity: sale.quantity || 1,
  unit_price: sale.unitPrice,
  total_price: sale.totalPrice,
  sale_date: sale.saleDate ? new Date(sale.saleDate).toISOString() : new Date().toISOString(),
  notes: sale.notes || null,
});

export const getStock = async (): Promise<StockItem[]> => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching products:', error);
    return [];
  }
  
  return (data || []).map(transformDbProduct);
};

export const setStock = async (stock: StockItem[]): Promise<void> => {
  console.warn('setStock is deprecated, use individual CRUD operations');
};

export const addProduct = async (product: Omit<StockItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<StockItem | null> => {
  if (!(await ensureWriteAllowed())) {
    console.warn('Add product blocked: guest users cannot modify data');
    return null;
  }
  const dbProduct = transformToDbProduct(product);
  
  const { data, error } = await supabase
    .from('products')
    .insert(dbProduct)
    .select()
    .single();
  
  if (error) {
    console.error('Error adding product:', error);
    return null;
  }
  
  return transformDbProduct(data);
};

export const updateProduct = async (id: string | number, updates: Partial<StockItem>): Promise<boolean> => {
  if (!(await ensureWriteAllowed())) {
    console.warn('Update product blocked: guest users cannot modify data');
    return false;
  }
  const dbUpdates: Record<string, any> = {};
  
  if (updates.name !== undefined) dbUpdates.name = updates.name;
  if (updates.description !== undefined) dbUpdates.description = updates.description;
  if (updates.category !== undefined) dbUpdates.category = updates.category;
  if (updates.purchasePrice !== undefined) dbUpdates.purchase_price = updates.purchasePrice;
  if (updates.salePrice !== undefined) dbUpdates.sale_price = updates.salePrice;
  if (updates.stockQuantity !== undefined) dbUpdates.stock_quantity = updates.stockQuantity;
  if (updates.minStockLevel !== undefined) dbUpdates.min_stock_level = updates.minStockLevel;
  if (updates.isActive !== undefined) dbUpdates.is_active = updates.isActive;
  
  const { error } = await supabase
    .from('products')
    .update(dbUpdates)
    .eq('id', String(id));
  
  if (error) {
    console.error('Error updating product:', error);
    return false;
  }
  
  return true;
};

export const deleteProduct = async (id: string | number): Promise<boolean> => {
  if (!(await ensureWriteAllowed())) {
    console.warn('Delete product blocked: guest users cannot modify data');
    return false;
  }
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', String(id));
  
  if (error) {
    console.error('Error deleting product:', error);
    return false;
  }
  
  return true;
};

export const getSales = async (): Promise<Sale[]> => {
  const { data, error } = await supabase
    .from('sales')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching sales:', error);
    return [];
  }
  
  return (data || []).map(transformDbSale);
};

export const setSales = async (sales: Sale[]): Promise<void> => {
  console.warn('setSales is deprecated, use individual CRUD operations');
};

export const addSale = async (sale: Omit<Sale, 'id' | 'createdAt'>): Promise<Sale | null> => {
  if (!(await ensureWriteAllowed())) {
    console.warn('Add sale blocked: guest users cannot modify data');
    return null;
  }
  const dbSale = transformToDbSale(sale);
  
  const { data, error } = await supabase
    .from('sales')
    .insert(dbSale)
    .select()
    .single();
  
  if (error) {
    console.error('Error adding sale:', error);
    return null;
  }
  
  return transformDbSale(data);
};

// Aliases for compatibility
export const getStockItems = getStock;
export const setStockItems = setStock;
