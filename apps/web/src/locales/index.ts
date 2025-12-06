import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';


import zhCN from './zh-CN.json';
import enUS from './en-US.json';
import { getLanguage } from '@repo/shared/app/index';

const resources = {
  'zh-CN': { translation: zhCN },
  'en-US': { translation: enUS },
};


i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: getLanguage() || 'zh-CN',
    fallbackLng: 'zh-CN',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;