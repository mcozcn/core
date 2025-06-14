import { getFromStorage, setToStorage } from './core';

export interface Personnel {
  id: number;
  name: string;
  title: string;
  phone: string;
  email?: string;
  color: string;
  commissionRate: number; // Komisyon oranı %
  notes?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface PersonnelRecord {
  id: number;
  personnelId: number;
  type: 'service' | 'product' | 'commission' | 'deduction';
  amount: number;
  description: string;
  date: Date;
  customerId?: number;
  customerName?: string;
  serviceId?: number;
  serviceName?: string;
  productId?: number;
  productName?: string;
  createdAt: Date;
}

const PERSONNEL_KEY = 'personnel_v3'; // Version updated to force refresh
const PERSONNEL_RECORDS_KEY = 'personnel_records_v3'; // Version updated

// Temizlik fonksiyonu - eski demo verileri sil
const clearOldPersonnelData = async (): Promise<void> => {
  try {
    const oldKeys = [
      'personnel_v1', 'personnel_records_v1', 'personnel', 'personnel_records', 
      'personnel_v2', 'personnel_records_v2'
    ];
    
    oldKeys.forEach(key => {
      localStorage.removeItem(key);
    });
  } catch (error) {
    console.log('Error clearing old personnel data:', error);
  }
};

export const getPersonnel = async (): Promise<Personnel[]> => {
  try {
    console.log('🔄 Loading personnel data...');
    
    // İlk çalıştırmada eski verileri temizle
    await clearOldPersonnelData();
    
    // Try to get data with fallback to localStorage
    try {
      const personnel = await getFromStorage<Personnel>(PERSONNEL_KEY);
      console.log('✅ Personnel loaded from storage:', personnel);
      return personnel;
    } catch (storageError) {
      console.warn('⚠️ Storage error, trying localStorage fallback:', storageError);
      
      // Fallback to localStorage
      try {
        const localData = localStorage.getItem(PERSONNEL_KEY);
        if (localData) {
          const personnel = JSON.parse(localData);
          console.log('✅ Personnel loaded from localStorage fallback:', personnel);
          return Array.isArray(personnel) ? personnel : [];
        }
      } catch (localError) {
        console.error('❌ LocalStorage fallback failed:', localError);
      }
      
      // Return empty array if all fails
      console.log('⚠️ No personnel data found, returning empty array');
      return [];
    }
  } catch (error) {
    console.error('❌ Error getting personnel:', error);
    return [];
  }
};

export const setPersonnel = async (personnel: Personnel[]): Promise<void> => {
  try {
    // Try both storage methods for reliability
    await setToStorage(PERSONNEL_KEY, personnel);
    localStorage.setItem(PERSONNEL_KEY, JSON.stringify(personnel));
    console.log('✅ Personnel data saved successfully');
  } catch (error) {
    console.error('❌ Error saving personnel:', error);
    // Try localStorage fallback
    try {
      localStorage.setItem(PERSONNEL_KEY, JSON.stringify(personnel));
      console.log('✅ Personnel saved to localStorage fallback');
    } catch (localError) {
      console.error('❌ LocalStorage fallback failed:', localError);
    }
  }
};

export const addPersonnel = async (personnelData: Omit<Personnel, 'id' | 'createdAt' | 'updatedAt'>): Promise<Personnel> => {
  const personnel = await getPersonnel();
  const newPersonnel: Personnel = {
    ...personnelData,
    id: Date.now(),
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  const updatedPersonnel = [...personnel, newPersonnel];
  await setPersonnel(updatedPersonnel);
  return newPersonnel;
};

export const updatePersonnel = async (id: number, updates: Partial<Personnel>): Promise<boolean> => {
  try {
    const personnel = await getPersonnel();
    const index = personnel.findIndex(p => p.id === id);
    
    if (index === -1) return false;
    
    personnel[index] = {
      ...personnel[index],
      ...updates,
      updatedAt: new Date()
    };
    
    await setPersonnel(personnel);
    return true;
  } catch (error) {
    console.error('Error updating personnel:', error);
    return false;
  }
};

export const deletePersonnel = async (id: number): Promise<boolean> => {
  try {
    const personnel = await getPersonnel();
    const filteredPersonnel = personnel.filter(p => p.id !== id);
    await setPersonnel(filteredPersonnel);
    return true;
  } catch (error) {
    console.error('Error deleting personnel:', error);
    return false;
  }
};

export const getPersonnelRecords = async (personnelId?: number): Promise<PersonnelRecord[]> => {
  try {
    const records = await getFromStorage<PersonnelRecord>(PERSONNEL_RECORDS_KEY);
    if (personnelId) {
      return records.filter(record => record.personnelId === personnelId);
    }
    return records;
  } catch (error) {
    console.error('Error getting personnel records:', error);
    return [];
  }
};

export const setPersonnelRecords = async (records: PersonnelRecord[]): Promise<void> => {
  await setToStorage(PERSONNEL_RECORDS_KEY, records);
};

export const addPersonnelRecord = async (record: Omit<PersonnelRecord, 'id' | 'createdAt'>): Promise<PersonnelRecord> => {
  const records = await getPersonnelRecords();
  const newRecord: PersonnelRecord = {
    ...record,
    id: Date.now(),
    createdAt: new Date()
  };
  
  const updatedRecords = [...records, newRecord];
  await setPersonnelRecords(updatedRecords);
  return newRecord;
};
