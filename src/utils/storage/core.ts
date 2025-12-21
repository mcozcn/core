// Core storage utilities - Supabase-first approach
// Local storage is no longer used as fallback to ensure data consistency across devices

export const getFromStorage = async <T>(key: string): Promise<T[]> => {
  // Return empty array - all data should come from Supabase
  console.warn(`getFromStorage called for ${key} - this should use Supabase directly`);
  return [];
};

export const setToStorage = async <T extends { id: string | number }>(key: string, data: T[]): Promise<void> => {
  // No-op - all data should be saved to Supabase
  console.warn(`setToStorage called for ${key} - this should use Supabase directly`);
};

// Keep these exports for backward compatibility but they're no longer used
export const getAllFromIDB = async <T>(key: string): Promise<T[]> => [];
export const saveToIDB = async <T extends { id: string | number }>(key: string, data: T[]): Promise<void> => {};
