import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'tesebook_viewer_id';

const generateId = () => {
  const random = Math.random().toString(36).slice(2, 12);
  const time = Date.now().toString(36);
  return `device_${time}_${random}`;
};

export const getViewerId = async () => {
  try {
    const existing = await AsyncStorage.getItem(STORAGE_KEY);
    if (existing) return existing;
    const cryptoApi = (globalThis as any)?.crypto;
    const generated =
      cryptoApi && typeof cryptoApi.randomUUID === 'function'
        ? `device_${cryptoApi.randomUUID()}`
        : generateId();
    await AsyncStorage.setItem(STORAGE_KEY, generated);
    return generated;
  } catch {
    return generateId();
  }
};
