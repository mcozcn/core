import { supabase } from "@/integrations/supabase/client";
import { ensureWriteAllowed } from '@/utils/guestGuard';

export interface Personnel {
  id: string | number;
  name: string;
  title: string;
  phone: string;
  email?: string;
  color: string;
  commissionRate: number;
  notes?: string;
  isActive: boolean;
  salary?: number;
  hireDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface PersonnelRecord {
  id: number;
  personnelId: number | string;
  type: 'service' | 'product' | 'commission' | 'deduction';
  amount: number;
  description: string;
  date: Date;
  customerId?: number | string;
  customerName?: string;
  serviceId?: number | string;
  serviceName?: string;
  productId?: number | string;
  productName?: string;
  createdAt: Date;
}

const transformDbPersonnel = (row: any): Personnel => ({
  id: row.id,
  name: `${row.first_name} ${row.last_name}`,
  title: row.role || 'Personel',
  phone: row.phone || '',
  email: row.email || '',
  color: '#3B82F6', // Default color
  commissionRate: row.commission_rate || 0,
  notes: '',
  isActive: row.is_active,
  salary: row.salary || 0,
  hireDate: row.hire_date ? new Date(row.hire_date) : undefined,
  createdAt: new Date(row.created_at),
  updatedAt: new Date(row.updated_at),
});

const transformToDbPersonnel = (personnel: Partial<Personnel>) => {
  const nameParts = personnel.name?.split(' ') || ['', ''];
  const firstName = nameParts[0] || '';
  const lastName = nameParts.slice(1).join(' ') || '';
  
  return {
    first_name: firstName,
    last_name: lastName,
    phone: personnel.phone || null,
    email: personnel.email || null,
    role: personnel.title || 'Personel',
    commission_rate: personnel.commissionRate || 0,
    is_active: personnel.isActive ?? true,
    salary: personnel.salary || null,
    hire_date: personnel.hireDate ? new Date(personnel.hireDate).toISOString().split('T')[0] : null,
  };
};

export const getPersonnel = async (): Promise<Personnel[]> => {
  const { data, error } = await supabase
    .from('personnel')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching personnel:', error);
    return [];
  }
  
  return (data || []).map(transformDbPersonnel);
};

export const setPersonnel = async (personnel: Personnel[]): Promise<void> => {
  console.warn('setPersonnel is deprecated, use individual CRUD operations');
};

export const addPersonnel = async (personnelData: Omit<Personnel, 'id' | 'createdAt' | 'updatedAt'>): Promise<Personnel | null> => {
  if (!(await ensureWriteAllowed())) {
    console.warn('Write blocked: write access not allowed in current configuration');
    return null;
  }
  const dbPersonnel = transformToDbPersonnel(personnelData);
  
  const { data, error } = await supabase
    .from('personnel')
    .insert(dbPersonnel)
    .select()
    .single();
  
  if (error) {
    console.error('Error adding personnel:', error);
    return null;
  }
  
  return transformDbPersonnel(data);
};

export const updatePersonnel = async (id: number | string, updates: Partial<Personnel>): Promise<boolean> => {
  if (!(await ensureWriteAllowed())) {
    console.warn('Write blocked: write access not allowed in current configuration');
    return false;
  }
  const dbUpdates = transformToDbPersonnel(updates);
  
  const { error } = await supabase
    .from('personnel')
    .update(dbUpdates)
    .eq('id', String(id));
  
  if (error) {
    console.error('Error updating personnel:', error);
    return false;
  }
  
  return true;
};

export const deletePersonnel = async (id: number | string): Promise<boolean> => {
  if (!(await ensureWriteAllowed())) {
    console.warn('Write blocked: write access not allowed in current configuration');
    return false;
  }

  const { error } = await supabase
    .from('personnel')
    .delete()
    .eq('id', String(id));
  
  if (error) {
    console.error('Error deleting personnel:', error);
    return false;
  }
  
  return true;
};

export const getPersonnelRecords = async (personnelId?: number | string): Promise<PersonnelRecord[]> => {
  // Personnel records would need a separate table - for now return empty
  return [];
};

export const setPersonnelRecords = async (records: PersonnelRecord[]): Promise<void> => {
  console.warn('setPersonnelRecords needs separate implementation');
};

export const addPersonnelRecord = async (record: Omit<PersonnelRecord, 'id' | 'createdAt'>): Promise<PersonnelRecord | null> => {
  // Would need a separate table implementation
  return null;
};
