"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { T, type Lang } from "./translations";

type Translations = typeof T[Lang];

type LangCtxType = {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: Translations;
};

const LangCtx = createContext<LangCtxType>({
  lang: "it",
  setLang: () => {},
  t: T.it,
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("it");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("apehour_lang");
      if (saved === "en") setLangState("en");
    } catch {}
  }, []);

  function setLang(l: Lang) {
    setLangState(l);
    try { localStorage.setItem("apehour_lang", l); } catch {}
  }

  return (
    <LangCtx.Provider value={{ lang, setLang, t: T[lang] }}>
      {children}
    </LangCtx.Provider>
  );
}

export function useLang() {
  return useContext(LangCtx);
}
