import type { Lang } from "@/lib/i18n";

const zinzinoLocaleByLang: Partial<Record<Lang, { market: string; locale: string }>> = {
  sv: { market: "SE", locale: "sv-SE" },
  fi: { market: "FI", locale: "fi-FI" },
  de: { market: "DE", locale: "de-DE" },
  fr: { market: "FR", locale: "fr-FR" },
  it: { market: "IT", locale: "it-IT" },
};

const DEFAULT_INTERNATIONAL_ZINZINO_TEST_URL = "https://www.zinzino.com/shop/2020937624/GB/en-GB/products/shop/309000";
const DEFAULT_INTERNATIONAL_ZINZINO_GUT_TEST_URL =
  "https://www.zinzino.com/shop/2020937624/GB/en-GB/products/shop/309070";

export function getZinzinoTestUrl(lang: Lang) {
  const localizedTarget = zinzinoLocaleByLang[lang];

  if (!localizedTarget) {
    return DEFAULT_INTERNATIONAL_ZINZINO_TEST_URL;
  }

  return `https://www.zinzino.com/shop/2020937624/${localizedTarget.market}/${localizedTarget.locale}/products/shop/309000`;
}

export function getZinzinoGutTestUrl(lang: Lang) {
  const localizedTarget = zinzinoLocaleByLang[lang];

  if (!localizedTarget) {
    return DEFAULT_INTERNATIONAL_ZINZINO_GUT_TEST_URL;
  }

  return `https://www.zinzino.com/shop/2020937624/${localizedTarget.market}/${localizedTarget.locale}/products/shop/309070`;
}
