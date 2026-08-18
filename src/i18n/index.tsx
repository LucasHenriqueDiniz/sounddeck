import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import de from "./locales/de.json";
import en from "./locales/en.json";
import es from "./locales/es.json";
import fr from "./locales/fr.json";
import pt from "./locales/pt.json";

export const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "pt", label: "Português" },
  { code: "es", label: "Español" },
  { code: "de", label: "Deutsch" },
  { code: "fr", label: "Français" },
] as const;

export type Lang = (typeof LANGUAGES)[number]["code"];

/** English is the source of truth: every other locale must have the same keys. */
export type TranslationKey = keyof typeof en;

const DICTIONARIES: Record<Lang, Partial<Record<TranslationKey, string>>> = { en, pt, es, de, fr };

const STORAGE_KEY = "sounddeck.lang";
const SYSTEM = "system";

/** "system" follows the OS/webview language; anything else pins one locale. */
export type LangPreference = Lang | typeof SYSTEM;

function isLang(value: string): value is Lang {
  return LANGUAGES.some((l) => l.code === value);
}

function readStoredPreference(): LangPreference {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === SYSTEM) return SYSTEM;
  return stored && isLang(stored) ? stored : SYSTEM;
}

/**
 * Inside Tauri the webview reports the OS display language, so navigator is
 * enough — no extra plugin needed. Falls back to English for anything we do
 * not ship, including regional variants we have no dictionary for.
 */
export function detectSystemLang(): Lang {
  for (const tag of navigator.languages ?? [navigator.language]) {
    const base = tag.toLowerCase().split("-")[0];
    if (isLang(base)) return base;
  }
  return "en";
}

interface I18nValue {
  lang: Lang;
  preference: LangPreference;
  setPreference: (preference: LangPreference) => void;
  t: (key: TranslationKey, vars?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [preference, setPreferenceState] = useState<LangPreference>(readStoredPreference);
  const [systemLang, setSystemLang] = useState<Lang>(detectSystemLang);

  const lang = preference === SYSTEM ? systemLang : preference;

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, preference);
  }, [preference]);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  // The webview can report a different language after the OS one changes;
  // re-reading on focus keeps a long-running window in sync.
  useEffect(() => {
    if (preference !== SYSTEM) return;
    const sync = () => setSystemLang(detectSystemLang());
    window.addEventListener("focus", sync);
    return () => window.removeEventListener("focus", sync);
  }, [preference]);

  const setPreference = useCallback((next: LangPreference) => setPreferenceState(next), []);

  const t = useCallback(
    (key: TranslationKey, vars?: Record<string, string | number>) => {
      // Falling back to English rather than showing the raw key: a missing
      // translation should degrade to readable text, not to debug output.
      const template = DICTIONARIES[lang][key] ?? en[key] ?? key;
      if (!vars) return template;
      return template.replace(/\{(\w+)\}/g, (m, name) => String(vars[name] ?? m));
    },
    [lang],
  );

  const value = useMemo<I18nValue>(() => ({ lang, preference, setPreference, t }), [lang, preference, setPreference, t]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used inside I18nProvider");
  return ctx;
}

/** Shorthand for the common case of only needing the translate function. */
export function useT() {
  return useI18n().t;
}
