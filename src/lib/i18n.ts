import { Copy, Lang } from "./i18n-types";
import { da } from "./locales/da";
import { de } from "./locales/de";
import { en } from "./locales/en";
import { fi } from "./locales/fi";
import { fr } from "./locales/fr";
import { it } from "./locales/it";
import { no } from "./locales/no";
import { sv } from "./locales/sv";
import { ar } from "./locales/ar";

export type { Copy, Lang } from "./i18n-types";

export const defaultLang: Lang = "sv";

export const supportedLangs: Lang[] = ["sv", "no", "da", "fi", "en", "de", "fr", "it", "ar"];

export const languages: { code: Lang; label: string; flag: string }[] = [
  { code: "sv", label: "Svenska", flag: "\uD83C\uDDF8\uD83C\uDDEA" },
  { code: "no", label: "Norsk", flag: "\uD83C\uDDF3\uD83C\uDDF4" },
  { code: "da", label: "Dansk", flag: "\uD83C\uDDE9\uD83C\uDDF0" },
  { code: "fi", label: "Suomi", flag: "\uD83C\uDDEB\uD83C\uDDEE" },
  { code: "en", label: "English", flag: "\uD83C\uDDEC\uD83C\uDDE7" },
  { code: "de", label: "Deutsch", flag: "\uD83C\uDDE9\uD83C\uDDEA" },
  { code: "fr", label: "Fran\u00e7ais", flag: "\uD83C\uDDEB\uD83C\uDDF7" },
  { code: "it", label: "Italiano", flag: "\uD83C\uDDEE\uD83C\uDDF9" },
  { code: "ar", label: "\u0627\u0644\u0639\u0631\u0628\u064a\u0629", flag: "\uD83C\uDDF8\uD83C\uDDE6" },
];

const translations: Record<Lang, Copy> = { sv, no, da, fi, en, de, fr, it, ar };

export const rtlLangs: Lang[] = ["ar"];

export function isRtlLang(lang: Lang) {
  return rtlLangs.includes(lang);
}

export function isSupportedLang(value?: string): value is Lang {
  return supportedLangs.includes((value || "") as Lang);
}

export function t(lang: Lang) {
  return translations[lang] || translations[defaultLang];
}
