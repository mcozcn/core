import { supabase } from "@/integrations/supabase/client";
import { ensureWriteAllowed } from '@/utils/guestGuard';
import { getFromStorage, setToStorage } from './core';
import { STORAGE_KEYS } from './storageKeys';

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
  // Convert stored days to months for UI (round to nearest month)
  duration: Math.max(1, Math.round((row.duration_days || 30) / 30)),
  price: row.price,
  features: Array.isArray(row.features) ? row.features : [],
  type: 'standard', // Default type
  isActive: row.is_active,
  createdAt: new Date(row.created_at),
});

const transformToDbPackage = (pkg: Partial<MembershipPackage>) => ({
  name: pkg.name,
  description: pkg.description || null,
  // Convert months to days for DB
  duration_days: (pkg.duration || 1) * 30,
  price: pkg.price,
  features: pkg.features || [],
  is_active: pkg.isActive ?? true,
});

export const getMembershipPackages = async (): Promise<MembershipPackage[]> => {
  // Try server first
  let serverPackages: MembershipPackage[] = [];
  try {
    const { data, error } = await supabase
      .from('membership_packages')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    serverPackages = (data || []).map(transformDbPackage);
  } catch (err) {
    console.warn("Couldn't fetch membership packages from server, will merge with local storage:", err);
  }

  // Always read local storage and merge local-only packages into the result
  let localPackages: MembershipPackage[] = [];
  try {
    const local = await getFromStorage<any>(STORAGE_KEYS.MEMBERSHIP_PACKAGES);
    localPackages = (local || []).map((row: any) => ({
      id: row.id,
      name: row.name,
      description: row.description || '',
      duration: row.duration || 30,
      price: row.price || 0,
      features: Array.isArray(row.features) ? row.features : [],
      type: row.type || 'standard',
      isActive: row.isActive ?? true,
      createdAt: row.createdAt ? new Date(row.createdAt) : new Date(),
    }));
  } catch (e) {
    console.warn('Failed reading local membership packages:', e);
  }

  const mergedMap = new Map<string, MembershipPackage>();
  const put = (p: MembershipPackage) => mergedMap.set(String(p.id), p);

  // Server packages take precedence
  for (const p of serverPackages) put(p);
  for (const p of localPackages) {
    if (!mergedMap.has(String(p.id))) put(p);
  }

  return Array.from(mergedMap.values()).sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
};

export const saveMembershipPackage = async (pkg: Omit<MembershipPackage, 'id' | 'createdAt'>): Promise<{ success: boolean; error?: any; status?: number; fallback?: boolean }> => {
  if (!(await ensureWriteAllowed())) {
    console.warn('Write blocked: write access not allowed in current configuration');
    return { success: false, error: 'Write access not allowed in current configuration' };
  }
  const dbPackage = transformToDbPackage(pkg);
  
  const { data, error, status } = await supabase
    .from('membership_packages')
    .insert(dbPackage);

  if (error) {
    console.error('Error saving membership package:', error);
    // Fallback to localStorage when server write is blocked (RLS/401) or in public mode
    try {
      const existing = await getFromStorage<any>(STORAGE_KEYS.MEMBERSHIP_PACKAGES);
      const localId = Date.now();
      const localPkg = {
        id: localId,
        name: pkg.name,
        description: pkg.description || '',
        // duration stored as months in local fallback
        duration: pkg.duration || 1,
        price: pkg.price || 0,
        features: pkg.features || [],
        type: pkg.type || 'standard',
        isActive: pkg.isActive ?? true,
        createdAt: new Date(),
      };
        await setToStorage(STORAGE_KEYS.MEMBERSHIP_PACKAGES, [...existing, localPkg]);
        console.warn('Saved membership package to localStorage as fallback');
        return { success: true, fallback: true };
    } catch (e) {
      console.warn('Local fallback failed for membership package save:', e);
    }
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      console.debug('Supabase session at save time:', sessionData?.session ?? null);
    } catch (e) {
      console.warn('Failed to read supabase session while handling save error', e);
    }
    return { success: false, error, status };
  }

  return { success: true };
};

export const updateMembershipPackage = async (id: number | string, updates: Partial<MembershipPackage>): Promise<{ success: boolean; error?: any; status?: number; fallback?: boolean }> => {
  if (!(await ensureWriteAllowed())) {
    console.warn('Write blocked: write access not allowed in current configuration');
    return { success: false, error: 'Write access not allowed in current configuration' };
  }
  const dbUpdates: Record<string, any> = {};
  
  if (updates.name !== undefined) dbUpdates.name = updates.name;
  if (updates.description !== undefined) dbUpdates.description = updates.description;
  if (updates.duration !== undefined) dbUpdates.duration_days = updates.duration;
  if (updates.price !== undefined) dbUpdates.price = updates.price;
  if (updates.features !== undefined) dbUpdates.features = updates.features;
  if (updates.isActive !== undefined) dbUpdates.is_active = updates.isActive;
  
  const { data, error, status } = await supabase
    .from('membership_packages')
    .update(dbUpdates)
    .eq('id', String(id));

  if (error) {
    console.error('Error updating membership package:', error);
    // Fallback to localStorage update
    try {
      const existing = await getFromStorage<any>(STORAGE_KEYS.MEMBERSHIP_PACKAGES);
      const updated = existing.map((p: any) => p.id === id ? { ...p, ...updates, duration: updates.duration ?? p.duration, isActive: updates.isActive ?? p.isActive } : p);
      await setToStorage(STORAGE_KEYS.MEMBERSHIP_PACKAGES, updated);
      console.warn('Updated membership package in localStorage as fallback');
      return { success: true, fallback: true };
    } catch (e) {
      console.warn('Local fallback failed for membership package update:', e);
    }
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      console.debug('Supabase session at update time:', sessionData?.session ?? null);
    } catch (e) {
      console.warn('Failed to read supabase session while handling update error', e);
    }
    return { success: false, error, status };
  }

  return { success: true };
};

export const deleteMembershipPackage = async (id: number | string): Promise<{ success: boolean; error?: any; status?: number; fallback?: boolean }> => {
  if (!(await ensureWriteAllowed())) {
    console.warn('Write blocked: write access not allowed in current configuration');
    return { success: false, error: 'Write access not allowed in current configuration' };
  }
  const { data, error, status } = await supabase
    .from('membership_packages')
    .delete()
    .eq('id', String(id));

  if (error) {
    console.error('Error deleting membership package:', error);
    // Fallback: delete from localStorage
    try {
      const existing = await getFromStorage<any>(STORAGE_KEYS.MEMBERSHIP_PACKAGES);
      const filtered = existing.filter((p: any) => String(p.id) !== String(id));
      await setToStorage(STORAGE_KEYS.MEMBERSHIP_PACKAGES, filtered);
      console.warn('Deleted membership package from localStorage as fallback');
      return { success: true, fallback: true };
    } catch (e) {
      console.warn('Local fallback failed for membership package delete:', e);
    }
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      console.debug('Supabase session at delete time:', sessionData?.session ?? null);
    } catch (e) {
      console.warn('Failed to read supabase session while handling delete error', e);
    }
    return { success: false, error, status };
  }

  return { success: true };
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
