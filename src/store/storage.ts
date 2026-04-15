import AsyncStorage from '@react-native-async-storage/async-storage';

/** Async storage adapter for Zustand's createJSONStorage — works in Expo Go */
export const mmkvStorage = AsyncStorage;
