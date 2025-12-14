import { getCurrentUser } from '@/utils/storage/userManager';

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
  const guest = await isGuestUser();
  if (guest) return false;
  return true;
};

export default {
  isGuestUser,
  ensureWriteAllowed,
};
