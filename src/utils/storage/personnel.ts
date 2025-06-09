
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

// Default personnel data
const getDefaultPersonnel = (): Personnel[] => [
  {
    id: 1,
    name: 'Ayşe Yılmaz',
    title: 'Kuaför',
    phone: '0532 123 4567',
    email: 'ayse@salon.com',
    color: '#e11d48',
    commissionRate: 30,
    notes: 'Saç kesimi ve boyama konusunda uzman',
    isActive: true,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15')
  },
  {
    id: 2,
    name: 'Mehmet Demir',
    title: 'Berber',
    phone: '0533 234 5678',
    email: 'mehmet@salon.com',
    color: '#0ea5e9',
    commissionRate: 25,
    notes: 'Erkek saç kesimi uzmanı',
    isActive: true,
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-01-20')
  },
  {
    id: 3,
    name: 'Fatma Özkan',
    title: 'Estetisyen',
    phone: '0534 345 6789',
    email: 'fatma@salon.com',
    color: '#8b5cf6',
    commissionRate: 35,
    notes: 'Cilt bakımı ve makyaj uzmanı',
    isActive: true,
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-02-01')
  }
];

export const getPersonnel = async (): Promise<Personnel[]> => {
  try {
    const personnel = await getFromStorage<Personnel>(PERSONNEL_KEY);
    if (personnel.length === 0) {
      const defaultPersonnel = getDefaultPersonnel();
      await setToStorage(PERSONNEL_KEY, defaultPersonnel);
      return defaultPersonnel;
    }
    return personnel;
  } catch (error) {
    console.error('Error getting personnel:', error);
    const defaultPersonnel = getDefaultPersonnel();
    await setToStorage(PERSONNEL_KEY, defaultPersonnel);
    return defaultPersonnel;
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
