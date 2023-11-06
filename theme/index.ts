import { Dimensions, Platform, StatusBar } from 'react-native';

export const OS = Platform.OS === 'android' ? 'android' : 'ios';
const { width, height } = Dimensions.get('screen');
const wWidth = Dimensions.get('window').width;
const wHeight = Dimensions.get('window').height;

const fontTypes = {
  ios: {
    bold: 'BrandonText-Bold',
    light: 'BrandonText-Light',
    regular: 'BrandonText-Regular',
    thin: 'BrandonText-Thin'
  },
  android: {
    bold: 'Roboto-Bold',
    light: 'Roboto-Light',
    regular: 'Roboto-Regular',
    thin: 'Roboto-Thin'
  }
};

const AppTheme = {
  device: {
    width,
    height,
    wWidth,
    wHeight
  },
  defaultOpacity: 0.9,
  font: {
    types: fontTypes[OS],
    size: {
      header: 20,
      subheader: 18,
      text: 14,
      error: 10,
      extraLarge: 48
    }
  },
  colors: {
    purple: {
      light: '#ABAAF9',
      dark: '#1D0055',
      regular: '#4318BE',
      transparentRGB: 'rgba(171, 170, 249, 0.3)'
    },
    gray: {
      light: '#9F9F9F',
      dark: '#151515',
      regular: '#303030',
      disabled: '#F0F0F0',
      btnTextDisabled: '#9F9F9F'
    },
    cyan: {
      light: '#E6FCFF',
      dark: '#A5D5DB',
      regular: '#D3EAED',
      disabled: '#82A4A8'
    },
    green: {
      dark: '#064A52',
      light: '#29A513',
      regular: '#00464E'
    },
    white: '#FFFFFF',
    black: '#000000',
    errorRed: '#DC3333',
    transparent: 'rgba(0, 0, 0, 0.7)'
  },
  borders: {
    width: {
      narrow: 0.3,
      thin: 0.7,
      regular: 1,
      thick: 1.5
    },
    radius: {
      circle: 100,
      button: 20,
      inputORcard: 14,
      sqBtn: 7
    }
  }
};

export default AppTheme;
