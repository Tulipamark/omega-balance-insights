import { Copy, Lang } from "./i18n-types";
import { da } from "./locales/da";
import { de } from "./locales/de";
import { en } from "./locales/en";
import { fi } from "./locales/fi";
import { fr } from "./locales/fr";
import { it } from "./locales/it";
import { no } from "./locales/no";
import { sv } from "./locales/sv";

export type { Copy, Lang } from "./i18n-types";

export const defaultLang: Lang = "sv";

export const supportedLangs: Lang[] = ["sv", "no", "da", "fi", "en", "de", "fr", "it"];

export const languages: { code: Lang; label: string; flag: string }[] = [
  { code: "sv", label: "Svenska", flag: "🇸🇪" },
  { code: "no", label: "Norsk", flag: "🇳🇴" },
  { code: "da", label: "Dansk", flag: "🇩🇰" },
  { code: "fi", label: "Suomi", flag: "🇫🇮" },
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "de", label: "Deutsch", flag: "🇩🇪" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "it", label: "Italiano", flag: "🇮🇹" },
];

const translations: Record<Lang, Copy> = { sv, no, da, fi, en, de, fr, it };

export function isSupportedLang(value?: string): value is Lang {
  return supportedLangs.includes((value || "") as Lang);
}

export function t(lang: Lang) {
  return translations[lang] || translations[defaultLang];
}
