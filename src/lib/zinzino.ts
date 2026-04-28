import type { Lang } from "@/lib/i18n";

const ZINZINO_REFERRAL_ACCOUNT_ID = "2020937624";

const zinzinoLocaleByLang: Partial<Record<Lang, { market: string; locale: string }>> = {
  sv: { market: "SE", locale: "sv-SE" },
  no: { market: "NO", locale: "no-NO" },
  da: { market: "DK", locale: "da-DK" },
  fi: { market: "FI", locale: "fi-FI" },
  en: { market: "GB", locale: "en-GB" },
  de: { market: "DE", locale: "de-DE" },
  fr: { market: "FR", locale: "fr-FR" },
  it: { market: "IT", locale: "it-IT" },
};

const DEFAULT_INTERNATIONAL_ZINZINO_TARGET = { market: "GB", locale: "en-GB" } as const;

function buildZinzinoHealthTestUrl(
  target: { market: string; locale: string },
  productId: "309000" | "309070",
) {
  return `https://www.zinzino.com/shop/${ZINZINO_REFERRAL_ACCOUNT_ID}/${target.market}/${target.locale}/products/shop/home-health-tests/${productId}`;
}

export function getZinzinoTestUrl(lang: Lang) {
  const localizedTarget = zinzinoLocaleByLang[lang] ?? DEFAULT_INTERNATIONAL_ZINZINO_TARGET;
  return buildZinzinoHealthTestUrl(localizedTarget, "309000");
}

export function getZinzinoGutTestUrl(lang: Lang) {
  const localizedTarget = zinzinoLocaleByLang[lang] ?? DEFAULT_INTERNATIONAL_ZINZINO_TARGET;
  return buildZinzinoHealthTestUrl(localizedTarget, "309070");
}
