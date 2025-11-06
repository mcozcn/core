import { getFromStorage, setToStorage } from './core';

export interface MembershipPackage {
  id: number;
  name: string;
  description?: string;
  duration: number; // in months
  price: number;
  features: string[];
  type: 'standard' | 'premium' | 'vip';
  isActive: boolean;
  createdAt: Date;
}

export interface MemberSubscription {
  id: number;
  memberId: number;
  memberName: string;
  packageId: number;
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

const PACKAGES_KEY = 'membership_packages';
const SUBSCRIPTIONS_KEY = 'member_subscriptions';

export const getMembershipPackages = async (): Promise<MembershipPackage[]> => {
  return await getFromStorage<MembershipPackage>(PACKAGES_KEY);
};

export const saveMembershipPackage = async (pkg: Omit<MembershipPackage, 'id' | 'createdAt'>): Promise<boolean> => {
  try {
    const packages = await getMembershipPackages();
    const newPackage: MembershipPackage = {
      ...pkg,
      id: Date.now(),
      createdAt: new Date(),
    };
    packages.push(newPackage);
    await setToStorage(PACKAGES_KEY, packages);
    return true;
  } catch (error) {
    console.error('Error saving membership package:', error);
    return false;
  }
};

export const updateMembershipPackage = async (id: number, updates: Partial<MembershipPackage>): Promise<boolean> => {
  try {
    const packages = await getMembershipPackages();
    const index = packages.findIndex(p => p.id === id);
    if (index !== -1) {
      packages[index] = { ...packages[index], ...updates };
      await setToStorage(PACKAGES_KEY, packages);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error updating membership package:', error);
    return false;
  }
};

export const deleteMembershipPackage = async (id: number): Promise<boolean> => {
  try {
    const packages = await getMembershipPackages();
    const filtered = packages.filter(p => p.id !== id);
    await setToStorage(PACKAGES_KEY, filtered);
    return true;
  } catch (error) {
    console.error('Error deleting membership package:', error);
    return false;
  }
};

// Subscription functions
export const getMemberSubscriptions = async (): Promise<MemberSubscription[]> => {
  return await getFromStorage<MemberSubscription>(SUBSCRIPTIONS_KEY);
};

export const saveMemberSubscription = async (subscription: Omit<MemberSubscription, 'id' | 'createdAt'>): Promise<boolean> => {
  try {
    const subscriptions = await getMemberSubscriptions();
    const newSubscription: MemberSubscription = {
      ...subscription,
      id: Date.now(),
      createdAt: new Date(),
    };
    subscriptions.push(newSubscription);
    await setToStorage(SUBSCRIPTIONS_KEY, subscriptions);
    return true;
  } catch (error) {
    console.error('Error saving member subscription:', error);
    return false;
  }
};

export const updateMemberSubscription = async (id: number, updates: Partial<MemberSubscription>): Promise<boolean> => {
  try {
    const subscriptions = await getMemberSubscriptions();
    const index = subscriptions.findIndex(s => s.id === id);
    if (index !== -1) {
      subscriptions[index] = { ...subscriptions[index], ...updates };
      await setToStorage(SUBSCRIPTIONS_KEY, subscriptions);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error updating member subscription:', error);
    return false;
  }
};

export const getActiveMemberSubscription = async (memberId: number): Promise<MemberSubscription | null> => {
  const subscriptions = await getMemberSubscriptions();
  const now = new Date();
  return subscriptions.find(s => 
    s.memberId === memberId && 
    s.isActive && 
    new Date(s.endDate) > now
  ) || null;
};
