import type { Lang } from "@/lib/i18n";

const zinzinoTestUrlByLang: Partial<Record<Lang, string>> = {
  sv: "https://www.zinzino.com/shop/2020937624/SE/sv-SE/products/shop/309000",
  de: "https://www.zinzino.com/2020937624/DE/de-DE/",
  fr: "https://www.zinzino.com/2020937624/FR/fr-FR/",
  it: "https://www.zinzino.com/2020937624/IT/it-IT/",
};

const DEFAULT_INTERNATIONAL_ZINZINO_TEST_URL = "https://www.zinzino.com/2020937624/GB/en-GB/";

export function getZinzinoTestUrl(lang: Lang) {
  return zinzinoTestUrlByLang[lang] ?? DEFAULT_INTERNATIONAL_ZINZINO_TEST_URL;
}
