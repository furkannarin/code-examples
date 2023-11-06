import LocalStorage, { LocalStorageKeys } from './LocalStorage';
import weekdays from '../language/weekdays.json';
import { makeObservable, observable, action } from 'mobx';

import langFiles from '@/language';

export enum AvailableLanguages { TR = 'TR', EN = 'EN' }
export type WeekdaysKeys = keyof typeof weekdays['EN']

class Language {
  @observable language: AvailableLanguages = AvailableLanguages.TR;

  constructor() {
    makeObservable(this);
  }

  t = (key: keyof typeof langFiles.EN) => {
    return langFiles[this.language][key];
  };

  @action changeLang = (newLang: AvailableLanguages) => {
    this.language = newLang;
  };

  @action reset = (): void => {
    return;
  };

  @action getLangFromStorage = async () => {
    const savedLang = await LocalStorage.getItem<AvailableLanguages>(LocalStorageKeys.UserLanguage);
    if (savedLang) {
      this.language = savedLang;
      return true;
    }
    return false;
  };

  getWeekDayName = (day: WeekdaysKeys) => {
    return weekdays[this.language][day];
  };

}

export default Language;
