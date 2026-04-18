import type { Lang } from "@/lib/i18n";

export type ClaimText = {
  text: string;
  verification: "verified" | "required" | "placeholder";
  note?: string;
};

export type LangRecord<T> = Partial<Record<Lang, T>>;

export function resolveContent<T>(content: LangRecord<T>, lang: Lang, fallbackLang: Lang = "en"): T {
  return content[lang] ?? content[fallbackLang] ?? content.sv ?? Object.values(content)[0]!;
}

