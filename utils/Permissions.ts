import LocalStorage, { LocalStorageKeys } from './LocalStorage';

import {
  PERMISSIONS, PermissionStatus, AndroidPermission, IOSPermission,
  checkMultiple, requestMultiple, checkNotifications, requestNotifications, NotificationsResponse
} from 'react-native-permissions';

import { makeObservable, observable, action, computed } from 'mobx';

type PermissionKeys = keyof typeof PERMISSIONS.ANDROID | keyof typeof PERMISSIONS.IOS;
export type PermissionType = AndroidPermission | IOSPermission;
type PermissionState = Partial<Record<PermissionKeys, boolean>> | null

class PermissionWrapper {
  @observable private PermissionState: PermissionState = null;
  @observable private NotificationsEnabled: boolean = false;

  constructor() {
    makeObservable(this);
  }

  @computed get GetNotificationState() {
    return this.NotificationsEnabled;
  }

  @computed get GetPermissionState() {
    return this.PermissionState;
  }

  @action getPermissionStateFromStorage = async () => {
    const permissionState = await LocalStorage.getItem<PermissionState>(LocalStorageKeys.Permissions);
    const notificationState = await LocalStorage.getItem<boolean>(LocalStorageKeys.NotificationStatus);

    this.PermissionState = permissionState;
    this.NotificationsEnabled = notificationState || false;

    if (permissionState && notificationState) return true;
    return false;
  };

  checkPermissions = async (keys: PermissionType[]) => {
    if (keys.length < 1) return null;
    const result = await checkMultiple(keys);
    return this.setPermission(result);
  };

  requestPermissions = async (keys: PermissionType[]) => {
    if (keys.length < 1) return null;
    const result = await requestMultiple(keys);
    return this.setPermission(result);
  };

  checkNotifications = async () => {
    const result = await checkNotifications();
    return this.setNotification(result);
  };

  requestNotifications = async () => {
    // arguments only available in ios. better not use them at all
    const result = await requestNotifications([]);
    return this.setNotification(result);
  };

  @action private setNotification = (perm: NotificationsResponse) => {
    this.NotificationsEnabled = perm.status === 'granted' ? true : false;

    LocalStorage.setItem(LocalStorageKeys.NotificationStatus, perm.status);
  };

  @action private setPermission = (perms: Record<PermissionType, PermissionStatus>) => {
    const keys = Object.keys(perms) as PermissionType[];

    keys.forEach(k => {
      const localKey = k.slice(k.lastIndexOf('.') + 1) as PermissionKeys;
      if (!this.PermissionState) this.PermissionState = {};
      this.PermissionState[localKey] = perms[k] === 'granted' ? true : false;
    });

    LocalStorage.setItem(LocalStorageKeys.Permissions, this.PermissionState);
    return this.PermissionState;
  };
}

export default PermissionWrapper;
