// Simple application settings persisted in localStorage
const ALLOW_GUEST_WRITES_KEY = 'allowGuestWrites';

export const getAllowGuestWrites = (): boolean => {
  try {
    const raw = localStorage.getItem(ALLOW_GUEST_WRITES_KEY);
    if (raw === null) return true; // default to true in public mode
    return raw === 'true';
  } catch (e) {
    console.error('getAllowGuestWrites error:', e);
    return true;
  }
};

export const setAllowGuestWrites = (value: boolean): void => {
  try {
    localStorage.setItem(ALLOW_GUEST_WRITES_KEY, value ? 'true' : 'false');
  } catch (e) {
    console.error('setAllowGuestWrites error:', e);
  }
};

export default { getAllowGuestWrites, setAllowGuestWrites };
