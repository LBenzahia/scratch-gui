import localeDataAr from 'react-intl/locale-data/ar';
import localeDataEn from 'react-intl/locale-data/en';
import localeDataEs from 'react-intl/locale-data/es';
import localeDataFr from 'react-intl/locale-data/fr';

import messages from '../locale/messages.json'; // eslint-disable-line import/no-unresolved

export default {
    ar: {
      name: 'الْعَرَبِيَّة',
      localeData: localeDataAr,
      messages: messages.ar
    },
    en: {
        name: 'English',
        localeData: localeDataEn,
        messages: messages.en
    },
    es: {
        name: 'Español',
        localeData: localeDataEs,
        messages: messages.es
    },
    fr: {
        name: 'Français',
        localeData: localeDataFr,
        messages: messages.fr
    }
};
