import { getCurrentUser } from '@/utils/storage/userManager';
import { getAllowGuestWrites } from './appSettings';

export const isGuestUser = async (): Promise<boolean> => {
  try {
    const user = await getCurrentUser();
    return !!user && (user.role === 'guest' || user.username === 'guest');
  } catch (error) {
    console.error('isGuestUser error:', error);
    return false;
  }
};

export const ensureWriteAllowed = async (): Promise<boolean> => {
  // If app configured to allow guest writes (public mode), permit writes
  try {
    if (getAllowGuestWrites()) return true;
  } catch (err) {
    console.warn('allowGuestWrites check failed, continuing to guest check', err);
  }

  const guest = await isGuestUser();
  if (guest) return false;
  return true;
};

export default {
  isGuestUser,
  ensureWriteAllowed,
};
