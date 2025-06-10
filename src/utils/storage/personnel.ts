
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

const PERSONNEL_KEY = 'personnel_v1';
const PERSONNEL_RECORDS_KEY = 'personnel_records_v1';

export const getPersonnel = async (): Promise<Personnel[]> => {
  try {
    const personnel = await getFromStorage<Personnel>(PERSONNEL_KEY);
    return personnel;
  } catch (error) {
    console.error('Error getting personnel:', error);
    return [];
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
  await setToStorage(PERSONNEL_KEY, updatedPersonnel);
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
    
    await setToStorage(PERSONNEL_KEY, personnel);
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
    await setToStorage(PERSONNEL_KEY, filteredPersonnel);
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

export const addPersonnelRecord = async (record: Omit<PersonnelRecord, 'id' | 'createdAt'>): Promise<PersonnelRecord> => {
  const records = await getPersonnelRecords();
  const newRecord: PersonnelRecord = {
    ...record,
    id: Date.now(),
    createdAt: new Date()
  };
  
  const updatedRecords = [...records, newRecord];
  await setToStorage(PERSONNEL_RECORDS_KEY, updatedRecords);
  return newRecord;
};
