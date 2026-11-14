// localStorage access that never throws: it is unavailable when site data is blocked,
// and the app must then work as for a new user (nothing stored).

export function getStorageItem(key) {
  try {
    return localStorage.getItem(key);
  }
  catch (e) {
    console.error(`Error reading "${key}" from localStorage:`, e);
    return null;
  }
}

export function setStorageItem(key, value) {
  try {
    localStorage.setItem(key, value);
  }
  catch (e) {
    console.error(`Error writing "${key}" to localStorage:`, e);
  }
}

export function removeStorageItem(key) {
  try {
    localStorage.removeItem(key);
  }
  catch (e) {
    console.error(`Error removing "${key}" from localStorage:`, e);
  }
}
