import { supabase } from "@/integrations/supabase/client";

export interface MembershipPackage {
  id: string | number;
  name: string;
  description?: string;
  duration: number; // in days (mapped from duration_days)
  price: number;
  features: string[];
  type: 'standard' | 'premium' | 'vip';
  isActive: boolean;
  createdAt: Date;
}

export interface MemberSubscription {
  id: number;
  memberId: number | string;
  memberName: string;
  packageId: number | string;
  packageName: string;
  packageType: 'standard' | 'premium' | 'vip';
  startDate: Date;
  endDate: Date;
  price: number;
  isPaid: boolean;
  isActive: boolean;
  autoRenew: boolean;
  createdAt: Date;
}

const transformDbPackage = (row: any): MembershipPackage => ({
  id: row.id,
  name: row.name,
  description: row.description || '',
  duration: row.duration_days || 30,
  price: row.price,
  features: Array.isArray(row.features) ? row.features : [],
  type: 'standard', // Default type
  isActive: row.is_active,
  createdAt: new Date(row.created_at),
});

const transformToDbPackage = (pkg: Partial<MembershipPackage>) => ({
  name: pkg.name,
  description: pkg.description || null,
  duration_days: pkg.duration || 30,
  price: pkg.price,
  features: pkg.features || [],
  is_active: pkg.isActive ?? true,
});

export const getMembershipPackages = async (): Promise<MembershipPackage[]> => {
  const { data, error } = await supabase
    .from('membership_packages')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching membership packages:', error);
    return [];
  }
  
  return (data || []).map(transformDbPackage);
};

export const saveMembershipPackage = async (pkg: Omit<MembershipPackage, 'id' | 'createdAt'>): Promise<boolean> => {
  const dbPackage = transformToDbPackage(pkg);
  
  const { error } = await supabase
    .from('membership_packages')
    .insert(dbPackage);
  
  if (error) {
    console.error('Error saving membership package:', error);
    return false;
  }
  
  return true;
};

export const updateMembershipPackage = async (id: number | string, updates: Partial<MembershipPackage>): Promise<boolean> => {
  const dbUpdates: Record<string, any> = {};
  
  if (updates.name !== undefined) dbUpdates.name = updates.name;
  if (updates.description !== undefined) dbUpdates.description = updates.description;
  if (updates.duration !== undefined) dbUpdates.duration_days = updates.duration;
  if (updates.price !== undefined) dbUpdates.price = updates.price;
  if (updates.features !== undefined) dbUpdates.features = updates.features;
  if (updates.isActive !== undefined) dbUpdates.is_active = updates.isActive;
  
  const { error } = await supabase
    .from('membership_packages')
    .update(dbUpdates)
    .eq('id', String(id));
  
  if (error) {
    console.error('Error updating membership package:', error);
    return false;
  }
  
  return true;
};

export const deleteMembershipPackage = async (id: number | string): Promise<boolean> => {
  const { error } = await supabase
    .from('membership_packages')
    .delete()
    .eq('id', String(id));
  
  if (error) {
    console.error('Error deleting membership package:', error);
    return false;
  }
  
  return true;
};

// Subscription functions - these work through customers table membership fields
export const getMemberSubscriptions = async (): Promise<MemberSubscription[]> => {
  // Subscriptions are now tracked via customers table membership_* fields
  return [];
};

export const saveMemberSubscription = async (subscription: Omit<MemberSubscription, 'id' | 'createdAt'>): Promise<boolean> => {
  console.warn('saveMemberSubscription is deprecated, use customer membership fields');
  return false;
};

export const updateMemberSubscription = async (id: number, updates: Partial<MemberSubscription>): Promise<boolean> => {
  console.warn('updateMemberSubscription is deprecated, use customer membership fields');
  return false;
};

export const getActiveMemberSubscription = async (memberId: number | string): Promise<MemberSubscription | null> => {
  // Check customer's membership status directly
  return null;
};
