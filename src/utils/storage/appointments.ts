
import { getFromStorage, setToStorage } from './core';
import { STORAGE_KEYS } from './storageKeys';
import type { Appointment } from './types';

export const getAppointments = async (): Promise<Appointment[]> => 
  await getFromStorage<Appointment>(STORAGE_KEYS.APPOINTMENTS);

export const setAppointments = async (appointments: Appointment[]): Promise<void> =>
  await setToStorage(STORAGE_KEYS.APPOINTMENTS, appointments);
