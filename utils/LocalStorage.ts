import AsyncStorage from '@react-native-async-storage/async-storage';

export enum LocalStorageKeys {
  UserInfo = 'UserInfo',
  Permissions = 'Permissions',
  NotificationStatus = 'NotificationStatus',
  UserLanguage = 'UserLanguage',
  Token = 'Token',
  OnboardingStatus = 'OnboardingStatus'
}

export type StorageGetterFn = <T>(key: LocalStorageKeys) => Promise<T | null>

class LocalStorage {
  static async getItem<T>(key: LocalStorageKeys): Promise<T | null> {
    const value = await AsyncStorage.getItem(key);
    if (!value) return null;
    return JSON.parse(value);
  }

  static async setItem<T>(key: LocalStorageKeys, value: T): Promise<void> {
    const serializedValue = JSON.stringify(value);
    await AsyncStorage.setItem(key, serializedValue);
  }

  static async removeItem(key: LocalStorageKeys): Promise<void> {
    await AsyncStorage.removeItem(key);
  }
}

export default LocalStorage;
