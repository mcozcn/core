
import { getFromStorage, setToStorage } from './core';
import { STORAGE_KEYS } from './storageKeys';
import type { Appointment } from './types';

export const getAppointments = async (): Promise<Appointment[]> => {
  const result = await getFromStorage<Appointment[]>(STORAGE_KEYS.APPOINTMENTS);
  // Ensure we always return an array
  return Array.isArray(result) ? result : [];
};

export const setAppointments = async (appointments: Appointment[]): Promise<void> => {
  await setToStorage(STORAGE_KEYS.APPOINTMENTS, appointments);
};
