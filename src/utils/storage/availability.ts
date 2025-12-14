// Check whether localStorage and IndexedDB are available/allowed in this context
export const checkStorageAllowed = async (): Promise<{ localStorage: boolean; indexedDB: boolean }> => {
  let localStorageAllowed = true;
  let indexedDBAllowed = true;

  try {
    const testKey = '__storage_test__';
    localStorage.setItem(testKey, '1');
    localStorage.removeItem(testKey);
  } catch (err) {
    localStorageAllowed = false;
    console.warn('localStorage not available in this context:', err);
  }

  try {
    if (typeof indexedDB === 'undefined' || indexedDB === null) {
      indexedDBAllowed = false;
    } else {
      // Try opening a temporary DB to confirm access
      await new Promise<void>((resolve, reject) => {
        const req = indexedDB.open('__storage_access_test__');
        let done = false;
        req.onsuccess = () => { try { req.result.close(); } catch(e) {} if (!done) { done = true; resolve(); } };
        req.onerror = () => { if (!done) { done = true; reject(req.error); } };
        // cleanup onupgradeneeded
        req.onupgradeneeded = () => {
          try { req.result.close(); } catch(e) {};
        };
        setTimeout(() => { if (!done) { done = true; resolve(); } }, 1000);
      });
    }
  } catch (err) {
    indexedDBAllowed = false;
    console.warn('IndexedDB not available in this context:', err);
  }

  return { localStorage: localStorageAllowed, indexedDB: indexedDBAllowed };
};

export default checkStorageAllowed;
