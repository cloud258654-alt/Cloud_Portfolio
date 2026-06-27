"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import zhTW from "./translations/zh-TW.json";
import en from "./translations/en.json";

type Lang = "zh" | "en";
type Translations = typeof zhTW;

const translations: Record<Lang, Translations> = { zh: zhTW, en };

const LanguageContext = createContext<{
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: Translations;
}>({
  lang: "zh",
  setLang: () => {},
  t: zhTW,
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("zh");

  useEffect(() => {
    const saved = localStorage.getItem("kts_lang") as Lang | null;
    if (saved && (saved === "zh" || saved === "en")) {
      setLangState(saved);
    }
  }, []);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    localStorage.setItem("kts_lang", l);
  }, []);

  return (
    <LanguageContext.Provider value={{ lang, setLang, t: translations[lang] }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation() {
  return useContext(LanguageContext);
}
