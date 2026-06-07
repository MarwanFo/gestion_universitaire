import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import translationFR from './locales/fr.json';
import translationEN from './locales/en.json';
import translationAR from './locales/ar.json';

const resources = {
  fr: { translation: { ...translationFR, ...translationFR.translation } },
  en: { translation: { ...translationEN, ...translationEN.translation } },
  ar: { translation: { ...translationAR, ...translationAR.translation } },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: localStorage.getItem('lng') || 'fr',
    fallbackLng: 'fr',
    interpolation: {
      escapeValue: false,
    },
  });

// Set direction based on language
const updateDirection = (lng) => {
  const isRtl = lng === 'ar';
  document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
  document.documentElement.lang = lng;
  
  if (isRtl) {
    document.documentElement.classList.add('arabic-font');
  } else {
    document.documentElement.classList.remove('arabic-font');
  }
};

updateDirection(i18n.language || 'fr');

i18n.on('languageChanged', (lng) => {
  localStorage.setItem('lng', lng);
  updateDirection(lng);
});

export default i18n;
