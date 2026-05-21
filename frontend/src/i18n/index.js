import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import enTranslation from "./en/translation.json";
import faTranslation from "./fa/translation.json";
import psTranslation from "./ps/translation.json";

const savedLanguage = localStorage.getItem("lang") || "fa";

i18n.use(initReactI18next).init({
  resources: {
    en: {
      translation: enTranslation,
    },

    fa: {
      translation: faTranslation,
    },

    ps: {
      translation: psTranslation,
    },
  },

  lng: savedLanguage,

  fallbackLng: "en",

  interpolation: {
    escapeValue: false,
  },
});

i18n.on("languageChanged", (lng) => {
  document.documentElement.dir = lng === "en" ? "ltr" : "rtl";

  document.documentElement.lang = lng;
});

// ✅ Set initial direction on first load
document.documentElement.dir = savedLanguage === "en" ? "ltr" : "rtl";

document.documentElement.lang = savedLanguage;

export default i18n;
