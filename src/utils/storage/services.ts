import { supabase } from "@/integrations/supabase/client";
import type { Service, ServiceSale } from './types';

const transformDbService = (row: any): Service => ({
  id: row.id,
  name: row.name,
  description: row.description || '',
  price: row.price,
  duration: row.duration_minutes || 60,
  category: row.category || '',
  isActive: row.is_active,
  createdAt: new Date(row.created_at),
  updatedAt: new Date(row.updated_at),
});

const transformToDbService = (service: Partial<Service>) => ({
  name: service.name,
  description: service.description || null,
  price: service.price,
  duration_minutes: service.duration || 60,
  category: service.category || null,
  is_active: service.isActive ?? true,
});

const transformDbServiceSale = (row: any): ServiceSale => ({
  id: row.id,
  serviceId: row.service_id,
  customerId: row.customer_id,
  personnelId: row.personnel_id,
  price: row.price,
  saleDate: new Date(row.sale_date),
  notes: row.notes || '',
  createdAt: new Date(row.created_at),
});

const transformToDbServiceSale = (sale: Partial<ServiceSale>) => ({
  service_id: sale.serviceId ? String(sale.serviceId) : null,
  customer_id: sale.customerId ? String(sale.customerId) : null,
  personnel_id: sale.personnelId ? String(sale.personnelId) : null,
  price: sale.price,
  sale_date: sale.saleDate ? new Date(sale.saleDate).toISOString() : new Date().toISOString(),
  notes: sale.notes || null,
});

export const getServices = async (): Promise<Service[]> => {
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching services:', error);
    return [];
  }
  
  return (data || []).map(transformDbService);
};

export const setServices = async (services: Service[]): Promise<void> => {
  console.warn('setServices is deprecated, use individual CRUD operations');
};

export const addService = async (service: Omit<Service, 'id' | 'createdAt' | 'updatedAt'>): Promise<Service | null> => {
  const dbService = transformToDbService(service);
  
  const { data, error } = await supabase
    .from('services')
    .insert(dbService)
    .select()
    .single();
  
  if (error) {
    console.error('Error adding service:', error);
    return null;
  }
  
  return transformDbService(data);
};

export const updateService = async (id: string | number, updates: Partial<Service>): Promise<boolean> => {
  const dbUpdates = transformToDbService(updates);
  
  const { error } = await supabase
    .from('services')
    .update(dbUpdates)
    .eq('id', String(id));
  
  if (error) {
    console.error('Error updating service:', error);
    return false;
  }
  
  return true;
};

export const deleteService = async (id: string | number): Promise<boolean> => {
  const { error } = await supabase
    .from('services')
    .delete()
    .eq('id', String(id));
  
  if (error) {
    console.error('Error deleting service:', error);
    return false;
  }
  
  return true;
};

export const getServiceSales = async (): Promise<ServiceSale[]> => {
  const { data, error } = await supabase
    .from('service_sales')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching service sales:', error);
    return [];
  }
  
  return (data || []).map(transformDbServiceSale);
};

export const setServiceSales = async (sales: ServiceSale[]): Promise<void> => {
  console.warn('setServiceSales is deprecated, use individual CRUD operations');
};

export const addServiceSale = async (sale: Omit<ServiceSale, 'id' | 'createdAt'>): Promise<ServiceSale | null> => {
  const dbSale = transformToDbServiceSale(sale);
  
  const { data, error } = await supabase
    .from('service_sales')
    .insert(dbSale)
    .select()
    .single();
  
  if (error) {
    console.error('Error adding service sale:', error);
    return null;
  }
  
  return transformDbServiceSale(data);
};
