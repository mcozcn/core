import { getFromStorage, setToStorage } from './core';
import { STORAGE_KEYS } from './storageKeys';
import type { Appointment } from './types';

export const getAppointments = (): Appointment[] => 
  getFromStorage<Appointment>(STORAGE_KEYS.APPOINTMENTS);

export const setAppointments = (appointments: Appointment[]): void =>
  setToStorage(STORAGE_KEYS.APPOINTMENTS, appointments);