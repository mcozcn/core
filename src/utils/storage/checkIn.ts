import { getFromStorage, setToStorage } from './core';

export interface CheckInRecord {
  id: number;
  memberId: number;
  memberName: string;
  checkInTime: Date;
  checkOutTime?: Date;
  duration?: number; // in minutes
  notes?: string;
  createdAt: Date;
}

const CHECK_IN_KEY = 'check_in_records';

export const getCheckInRecords = async (): Promise<CheckInRecord[]> => {
  return await getFromStorage<CheckInRecord>(CHECK_IN_KEY);
};

export const checkInMember = async (memberId: number, memberName: string, notes?: string): Promise<boolean> => {
  try {
    const records = await getCheckInRecords();
    
    // Check if member is already checked in
    const existingCheckIn = records.find(r => 
      r.memberId === memberId && !r.checkOutTime
    );
    
    if (existingCheckIn) {
      console.warn('Member is already checked in');
      return false;
    }
    
    const newRecord: CheckInRecord = {
      id: Date.now(),
      memberId,
      memberName,
      checkInTime: new Date(),
      notes,
      createdAt: new Date(),
    };
    
    records.push(newRecord);
    await setToStorage(CHECK_IN_KEY, records);
    return true;
  } catch (error) {
    console.error('Error checking in member:', error);
    return false;
  }
};

export const checkOutMember = async (memberId: number): Promise<boolean> => {
  try {
    const records = await getCheckInRecords();
    const record = records.find(r => 
      r.memberId === memberId && !r.checkOutTime
    );
    
    if (!record) {
      console.warn('No active check-in found for member');
      return false;
    }
    
    const checkOutTime = new Date();
    const duration = Math.floor((checkOutTime.getTime() - new Date(record.checkInTime).getTime()) / 60000);
    
    record.checkOutTime = checkOutTime;
    record.duration = duration;
    
    await setToStorage(CHECK_IN_KEY, records);
    return true;
  } catch (error) {
    console.error('Error checking out member:', error);
    return false;
  }
};

export const getCurrentCheckIns = async (): Promise<CheckInRecord[]> => {
  const records = await getCheckInRecords();
  return records.filter(r => !r.checkOutTime);
};

export const getTodayCheckIns = async (): Promise<CheckInRecord[]> => {
  const records = await getCheckInRecords();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  return records.filter(r => {
    const checkInDate = new Date(r.checkInTime);
    checkInDate.setHours(0, 0, 0, 0);
    return checkInDate.getTime() === today.getTime();
  });
};
