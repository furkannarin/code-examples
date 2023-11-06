import { makeObservable, observable, action, computed } from 'mobx';
import { EmotionService } from '@/api/services/Emotion';

import { getDateInRange } from '@/components/TerCalendar';
import AppTheme from '@/theme';

import { WeekdaysKeys } from '@/utils/Language';

import {
  EmotionType,
  CalendarData,
  CategoryData,
  ChangeEmotionReqObj,
  MonthlyEmotionData,
  WeeklyEmotionData
} from '@/api/types/Emotion';

class Emotion {
  @observable private emotionData: EmotionType[] | null = null;
  @observable private categoryData: CategoryData[] | null = null;
  @observable private calendarEmotionData: CalendarData[] | null = null;
  @observable private monthlyGraphData: MonthlyEmotionData[] | null = null;
  @observable private emotionSelectedDaily: CalendarData | null = null;
  @observable private emotionSelectedFromCalendar: CalendarData | null = null;

  constructor() {
    makeObservable(this);
  }

  @computed get GetWeeklyEmotionData() {
    if (!this.GetCalendarEmotionData) return null;
    const DEFAULT_COLOR = AppTheme.colors.gray.disabled;

    const today = this.formatDate(new Date());
    const dateData = getDateInRange(6, -6, false);

    const days: string[] = [];
    const dates: string[] = [];

    dateData!.forEach(dd => {
      days?.push(dd.toString().slice(0, 3) as WeekdaysKeys);
      dates.push(this.formatDate(dd as Date));
    });

    const indexOfToday = dates.findIndex(d => d === today);
    const weekData: WeeklyEmotionData[] = [{
      day: days[indexOfToday] as WeekdaysKeys,
      colorCode: this.GetCalendarEmotionData!.find(ce => ce.date === today)?.emotion.color_code || DEFAULT_COLOR
    }];

    let k = indexOfToday;
    for (let i = indexOfToday - 1; i > -1; i--) {
      const queryDateEntity: typeof weekData[0] = { colorCode: '', day: '' as WeekdaysKeys };

      if (k === days.length) {
        // stop iteration here
        break;
      }

      if (i === 0) {
        // start incrementing k until k < days.length;
        i = 1;
        k++;
        queryDateEntity.day = days[k] as WeekdaysKeys;
        const color = this.GetCalendarEmotionData!.find(ce => ce.date === dates[k])?.emotion.color_code;
        queryDateEntity.colorCode = color || DEFAULT_COLOR;

        if (days[k] === 'Sun') {
          weekData.push(queryDateEntity);
          break;
        }
      }
      else {
        queryDateEntity.day = days[i] as WeekdaysKeys;
        const color = this.GetCalendarEmotionData!.find(ce => ce.date === dates[i])?.emotion.color_code;
        queryDateEntity.colorCode = color || DEFAULT_COLOR;

        // skip to days after today after we found the monday
        if (days[i] === 'Mon') {
          i = 1;
          weekData.push(queryDateEntity);
          weekData.reverse();
          continue;
        }
      }

      weekData.push(queryDateEntity);
    }

    return weekData;
  }

  @computed get GetCalendarEmotionData() {
    return this.calendarEmotionData;
  }

  @computed get GetCategoryData() {
    return this.categoryData;
  }

  @computed get GetDailyEmotion() {
    return this.emotionSelectedDaily;
  }

  @computed get GetCalendarEmotion() {
    return this.emotionSelectedFromCalendar;
  }

  @computed get GetEmotionData() {
    if (!this.emotionData) return null;

    return this.emotionData.filter(e => {
      if (e.mode === 'optional') return e.isSelected;
      return true;
    });
  }

  @computed get GetAllEmotionData() {
    return this.emotionData;
  }

  @computed get GetMonthlyData() {
    return this.monthlyGraphData;
  }

  @action addOptionalEmotion = async (id: string) => {
    if (!this.emotionData) return;

    const result = await EmotionService.addOptionalEmotion(id);
    if (!result) return;

    this.setEmotionData(
      this.emotionData.map(e => {
        if (e.id === id) {
          return { ...e, isSelected: true };
        }
        return e;
      })
    );
  };

  @action removeOptionalEmotion = async (deletionId: string, emotionId: string) => {
    if (!this.emotionData) return;

    const result = await EmotionService.removeOptionalEmotion(deletionId);
    if (!result) return;

    this.setEmotionData(
      this.emotionData.map(e => {
        if (e.id === emotionId) {
          return { ...e, isSelected: false };
        }
        return e;
      })
    );
  };

  @action setDailyEmotionSelection = (emotion: CalendarData | null) => {
    this.emotionSelectedDaily = emotion;
  };

  @action setCalendarEmotionSelection = (emotion: CalendarData | null) => {
    this.emotionSelectedFromCalendar = emotion;
  };

  @action setEmotionData = (val: EmotionType[] | null) => {
    this.emotionData = val;
  };

  @action setCalendarData = (val: CalendarData[] | null) => {
    this.calendarEmotionData = val;
  };

  @action setCategoryData = (val: CategoryData[] | null) => {
    this.categoryData = val;
  };

  @action setMonthlyData = (val: MonthlyEmotionData[] | null) => {
    this.monthlyGraphData = val;
  };

  private getSelectedOptionalEmotions = async () => {
    const response = await EmotionService.getSelectedOptionalEmotions();
    return response;
  };

  @action getAllEmotions = async () => {
    const defaultEmotions = await EmotionService.getEmotions();
    const optional = await EmotionService.getEmotions(false);

    if (!defaultEmotions || !optional) {
      this.setEmotionData(null);
      return;
    }

    const ids = await this.getSelectedOptionalEmotions();

    const extractDeletionIdFromIds = (emotionId: string) => {
      const idObj = ids ? ids.find(e => e.emotionId === emotionId) : null;
      return idObj ? idObj.deletionId : null;
    };

    this.setEmotionData(
      [...defaultEmotions, ...optional].map(e => ({
        ...e,
        isSelected: Boolean(extractDeletionIdFromIds(e.id)),
        deletionId: extractDeletionIdFromIds(e.id)
      }))
    );
  };

  @action getEmotionHistoryData = async (date?: string) => {
    const result = await EmotionService.getEmotionHistoryData(date);
    if (!result) {
      if (this.calendarEmotionData) return;
      this.setCalendarData(null);
      return;
    }

    const today = result.find(ce => ce.date.slice(0, 10) === this.formatDate(new Date()));
    if (today) {
      this.setDailyEmotionSelection({
        categories: today.categories,
        date: today.date.slice(0, 10),
        description: today.description,
        sentimentStateRecordId: today.id,
        emotion: {
          color_code: today.sentimentState.color_code,
          deletionId: today.sentimentState.deletionId,
          description: today.sentimentState.description,
          id: today.sentimentState.id,
          isSelected: false,
          mode: today.sentimentState.mode,
          name: today.sentimentState.name,
          title: today.sentimentState.title
        }
      });
    }

    const newData: CalendarData[] = result.map(ce => ({
      categories: ce.categories,
      date: ce.date.slice(0, 10),
      description: ce.description,
      sentimentStateRecordId: ce.id,
      emotion: {
        color_code: ce.sentimentState.color_code,
        deletionId: ce.sentimentState.deletionId,
        description: ce.sentimentState.description,
        id: ce.sentimentState.id,
        isSelected: false,
        mode: ce.sentimentState.mode,
        name: ce.sentimentState.name,
        title: ce.sentimentState.title
      }
    })
    );

    if (this.calendarEmotionData) {
      const newCalendarData = [...this.calendarEmotionData, ...newData];
      this.setCalendarData(newCalendarData);
    }
    else this.setCalendarData(newData);
  };

  @action getMonthlyEmotionGraphData = async () => {
    const result = await EmotionService.getMonthlyEmotionGraphData();
    this.setMonthlyData(result);
  };

  @action updateLocalCalendarEmotionData = async (data: CalendarData) => {
    if (!this.calendarEmotionData) this.setCalendarData([data]);
    else {
      const itemIdx = this.calendarEmotionData.findIndex(ce => ce.sentimentStateRecordId === data.sentimentStateRecordId);

      if (itemIdx > -1) {
        this.calendarEmotionData[itemIdx] = data;
        if (data.date === this.formatDate(new Date())) this.setDailyEmotionSelection(data);
        this.setCalendarData([...this.calendarEmotionData]); // force update mobx
      }
      else this.setCalendarData([...this.calendarEmotionData, data]);
    }
  };

  @action changeEmotionState = async (isUpdate: boolean, calenderData: CalendarData, data: ChangeEmotionReqObj) => {
    const result = await EmotionService.changeEmotionDetails(data, isUpdate);
    if (!result) return false;

    if (isUpdate) this.updateLocalCalendarEmotionData({ ...calenderData, categories: data.sentimentCategories });
    else this.updateLocalCalendarEmotionData({ ...calenderData, categories: data.sentimentCategories });

    return true;
  };

  @action getCategoryData = async () => {
    const result = await EmotionService.getCategoryData();
    if (!result) {
      this.setCategoryData(null);
      return;
    }

    this.setCategoryData(
      result.map(c => ({
        id: c.id,
        name: c.name
      }))
    );
  };

  formatDate = (date: Date) => `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
}

export default Emotion;
