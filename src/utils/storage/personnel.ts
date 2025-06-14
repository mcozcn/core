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

const PERSONNEL_KEY = 'personnel_v3';
const PERSONNEL_RECORDS_KEY = 'personnel_records_v3';

// Güvenli veri yükleme fonksiyonu
export const getPersonnel = async (): Promise<Personnel[]> => {
  try {
    console.log('🔄 Loading personnel data from storage...');
    
    // Try multiple storage methods for reliability
    let personnel: Personnel[] = [];
    
    try {
      // First try IndexedDB through our storage core
      personnel = await getFromStorage<Personnel>(PERSONNEL_KEY);
      console.log('✅ Personnel loaded from IndexedDB:', personnel.length, 'items');
    } catch (storageError) {
      console.warn('⚠️ IndexedDB failed, trying localStorage:', storageError);
      
      // Fallback to direct localStorage access
      const localData = localStorage.getItem(PERSONNEL_KEY);
      if (localData) {
        try {
          const parsedData = JSON.parse(localData);
          personnel = Array.isArray(parsedData) ? parsedData : [];
          console.log('✅ Personnel loaded from localStorage:', personnel.length, 'items');
        } catch (parseError) {
          console.error('❌ Failed to parse localStorage data:', parseError);
          personnel = [];
        }
      } else {
        console.log('⚠️ No data found in localStorage');
        personnel = [];
      }
    }
    
    // Convert date strings back to Date objects if needed
    personnel = personnel.map(person => ({
      ...person,
      createdAt: person.createdAt ? new Date(person.createdAt) : new Date(),
      updatedAt: person.updatedAt ? new Date(person.updatedAt) : new Date()
    }));
    
    console.log('✅ Final personnel data:', personnel);
    return personnel;
    
  } catch (error) {
    console.error('❌ Critical error in getPersonnel:', error);
    return [];
  }
};

export const setPersonnel = async (personnel: Personnel[]): Promise<void> => {
  try {
    console.log('💾 Saving personnel data:', personnel.length, 'items');
    
    // Save to both IndexedDB and localStorage for reliability
    try {
      await setToStorage(PERSONNEL_KEY, personnel);
      console.log('✅ Personnel saved to IndexedDB');
    } catch (idbError) {
      console.warn('⚠️ IndexedDB save failed:', idbError);
    }
    
    // Always save to localStorage as backup
    localStorage.setItem(PERSONNEL_KEY, JSON.stringify(personnel));
    console.log('✅ Personnel saved to localStorage');
    
  } catch (error) {
    console.error('❌ Error saving personnel:', error);
    throw error; // Re-throw to handle in calling code
  }
};

export const addPersonnel = async (personnelData: Omit<Personnel, 'id' | 'createdAt' | 'updatedAt'>): Promise<Personnel> => {
  try {
    console.log('➕ Adding new personnel:', personnelData.name);
    
    const personnel = await getPersonnel();
    const newPersonnel: Personnel = {
      ...personnelData,
      id: Date.now(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const updatedPersonnel = [...personnel, newPersonnel];
    await setPersonnel(updatedPersonnel);
    
    console.log('✅ Personnel added successfully:', newPersonnel.name);
    return newPersonnel;
    
  } catch (error) {
    console.error('❌ Error adding personnel:', error);
    throw error;
  }
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
