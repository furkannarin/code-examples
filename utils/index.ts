import PermissionWrapper from './Permissions';
import Language from './Language';
import LocalStorage from './LocalStorage';
import GlobalTheme from './GlobalTheme';
import File from './File';

export default {
  Permission: new PermissionWrapper(),
  Language: new Language(),
  LocalStorage,
  GlobalTheme: new GlobalTheme(),
  File: new File()
};
