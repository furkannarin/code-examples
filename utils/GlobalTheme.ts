import { makeObservable, observable, action, computed } from 'mobx';

import AppTheme from '@/theme';
// import integrations from '@/integrations';

import { AvailableScreens } from '@/router/Routes';

const { colors } = AppTheme;

class GlobalTheme {
  @observable private globalBGColor = colors.white;
  @observable previousRouteName: AvailableScreens = 'Register';
  @observable currentRouteName: AvailableScreens = 'Login';

  constructor() {
    makeObservable(this);
  }

  @action setRoutes = async (previous: AvailableScreens, current: AvailableScreens) => {
    const prevUnderscorIdx = previous.indexOf('_');
    const currUnderscorIdx = current.indexOf('_');

    if (previous === current) {
      console.warn('PREVIOUS AND CURRENT NAMES CAN NOT BE SAME!');
      return;
    }

    this.previousRouteName = prevUnderscorIdx !== -1 ? previous.slice(0, prevUnderscorIdx) as AvailableScreens : previous;
    this.currentRouteName = currUnderscorIdx !== -1 ? current.slice(0, prevUnderscorIdx) as AvailableScreens : current;
  };

  @computed get getGlobalBGColor() {
    return this.globalBGColor;
  }

  @action setGlobalBGColor = (newColor: string) => {
    this.globalBGColor = newColor;
  };

  @action reset = (): void => {
    return;
  };

}

export default GlobalTheme;
