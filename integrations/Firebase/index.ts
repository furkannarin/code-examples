import { FirebaseEventNames } from './firebase.d';
import ENV from '../../../env.json';

import firebase, { ReactNativeFirebase } from '@react-native-firebase/app';
import analytics from '@react-native-firebase/analytics';
import messaging, { FirebaseMessagingTypes } from '@react-native-firebase/messaging';
import notifee, { AndroidImportance, AndroidVisibility, Event, EventType } from '@notifee/react-native';

import { OS } from '@/theme';
import { NotificationService } from '@/api';

const SECRET = true;

class Firebase {
  private app: ReactNativeFirebase.FirebaseApp | null = null;
  private messagingModule: FirebaseMessagingTypes.Module | null = null;
  private push_token: string | null = null;
  private user_topic_name = SECRET;

  constructor() {
    if (this.app) {
      console.warn('FIREBASE IS ALREADY INITIALIZED!');
      return;
    }

    this.app = firebase.app();
    this.messagingModule = messaging();
    this.messagingModule.subscribeToTopic(this.user_topic_name);

    if (OS === 'android') this.createNotificationChannel();
    else notifee.setNotificationCategories([{ id: SECRET }]);
  }

  get GetPushToken() {
    return this.push_token;
  }

  get GetMessagingModule() {
    return this.messagingModule;
  }

  logEvent = async (name: FirebaseEventNames, params?: Record<string, unknown>): Promise<boolean> => {
    if (ENV.IS_DEV_ENV) {
      if (ENV.SUPPRESS_EVENT_LOGS) return false;
      console.warn('Firebase: Event is not sent because you are in DEV environment!');
      return false;
    }

    await analytics().logEvent(name, params);
    return true;
  };

  createPushToken = async () => {
    if (this.push_token) {
      console.warn('FIREBASE PUSH TOKEN ALREADY GENERATED!');
      return false;
    }

    if (!this.messagingModule) {
      console.warn('FIREBASE MESSAGING MODULE IS NULL!');
      return false;
    }

    this.push_token = await this.messagingModule.getToken();
    await NotificationService.sendPushToken(this.push_token);
    return true;
  };

  onFirPushReceived = async (message: FirebaseMessagingTypes.RemoteMessage) => {
    // DO NOT ATTEMPT TO UPDATE ANY UI HERE
    console.warn('RECEIVED NOTIFICATION: \n', message);

    await notifee.displayNotification({
      title: message.notification?.body,
      subtitle: message.notification?.title,
      ios: {
        sound: 'default',
        categoryId: SECRET
      },
      android: {
        localOnly: true,
        channelId: SECRET,
        visibility: AndroidVisibility.PUBLIC,
        importance: AndroidImportance.HIGH,
        sound: 'default'
      },
      remote: {
        contentAvailable: 1,
        mutableContent: 0,
        messageId: message.messageId!,
        senderId: message.from!
      }
    });
  };

  onNotifeeEvent = async (event: Event, isBackground: boolean = true) => {
    const { type } = event;
    console.warn(`${isBackground ? 'BACKGROUND' : 'FOREGROUND'} EVENT ${EventType[type]}`);
  };

  createNotificationChannel = () => {
    notifee.createChannel({
      id: SECRET,
      name: SECRET,
      sound: 'default',
      importance: AndroidImportance.HIGH,
      visibility: AndroidVisibility.PUBLIC,
      vibration: true
    });
  };

}

export default Firebase;
