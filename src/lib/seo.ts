import * as React from "react";
import { isRtlLang, type Lang } from "@/lib/i18n";

export const SITE_URL = "https://insidebalance.eu";
export const DEFAULT_OG_IMAGE = `${SITE_URL}/og-insidebalance.png`;
export const SOCIAL_PROFILES = [
  "https://www.instagram.com/insidebalance.eu",
  "https://www.facebook.com/Insidebalance.eu/",
] as const;

type FaqItem = {
  question: string;
  answer: string;
};

type SeoConfig = {
  lang: Lang;
  title: string;
  description: string;
  path: string;
  alternates: Record<string, string>;
  image?: string;
  type?: "website" | "article";
  robots?: string;
  faq?: FaqItem[];
  schema?: Record<string, unknown>[];
};

function upsertMeta(selector: string, attributes: Record<string, string>) {
  let element = document.head.querySelector<HTMLMetaElement>(selector);

  if (!element) {
    element = document.createElement("meta");
    document.head.appendChild(element);
  }

  Object.entries(attributes).forEach(([key, value]) => {
    element!.setAttribute(key, value);
  });
}

function upsertLink(selector: string, attributes: Record<string, string>) {
  let element = document.head.querySelector<HTMLLinkElement>(selector);

  if (!element) {
    element = document.createElement("link");
    document.head.appendChild(element);
  }

  Object.entries(attributes).forEach(([key, value]) => {
    element!.setAttribute(key, value);
  });
}

function upsertStructuredData(data: Record<string, unknown>[]) {
  let script = document.head.querySelector<HTMLScriptElement>('script[data-seo-schema="page"]');

  if (!script) {
    script = document.createElement("script");
    script.type = "application/ld+json";
    script.setAttribute("data-seo-schema", "page");
    document.head.appendChild(script);
  }

  script.textContent = JSON.stringify(data);
}

export function absoluteUrl(path: string) {
  return new URL(path, SITE_URL).toString();
}

export function buildAlternates(resolver: (lang: Lang) => string, langs: readonly Lang[]) {
  const alternates: Record<string, string> = {
    "x-default": absoluteUrl(resolver("sv")),
  };

  langs.forEach((lang) => {
    alternates[lang] = absoluteUrl(resolver(lang));
  });

  return alternates;
}

export function buildWebPageSchema({
  title,
  description,
  path,
  lang,
}: {
  title: string;
  description: string;
  path: string;
  lang: Lang;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: title,
    description,
    url: absoluteUrl(path),
    inLanguage: lang,
  };
}

export function buildOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "InsideBalance",
    url: SITE_URL,
    logo: `${SITE_URL}/insidebalance-logo.png`,
    sameAs: [...SOCIAL_PROFILES],
  };
}

export function buildFaqSchema(path: string, faq: FaqItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
    url: absoluteUrl(path),
  };
}

export function useSeo({
  lang,
  title,
  description,
  path,
  alternates,
  image = DEFAULT_OG_IMAGE,
  type = "website",
  robots = "index, follow",
  faq,
  schema = [],
}: SeoConfig) {
  React.useEffect(() => {
    const canonicalUrl = absoluteUrl(path);
    const pageSchema = [buildWebPageSchema({ title, description, path, lang }), ...schema];

    if (faq?.length) {
      pageSchema.push(buildFaqSchema(path, faq));
    }

    document.documentElement.lang = lang;
    document.documentElement.dir = isRtlLang(lang) ? "rtl" : "ltr";
    document.title = title;

    upsertMeta('meta[name="description"]', { name: "description", content: description });
    upsertMeta('meta[name="robots"]', { name: "robots", content: robots });
    upsertMeta('meta[property="og:type"]', { property: "og:type", content: type });
    upsertMeta('meta[property="og:site_name"]', { property: "og:site_name", content: "InsideBalance" });
    upsertMeta('meta[property="og:title"]', { property: "og:title", content: title });
    upsertMeta('meta[property="og:description"]', { property: "og:description", content: description });
    upsertMeta('meta[property="og:url"]', { property: "og:url", content: canonicalUrl });
    upsertMeta('meta[property="og:image"]', { property: "og:image", content: image });
    upsertMeta('meta[name="twitter:card"]', { name: "twitter:card", content: "summary_large_image" });
    upsertMeta('meta[name="twitter:title"]', { name: "twitter:title", content: title });
    upsertMeta('meta[name="twitter:description"]', { name: "twitter:description", content: description });
    upsertMeta('meta[name="twitter:image"]', { name: "twitter:image", content: image });
    upsertLink('link[rel="canonical"]', { rel: "canonical", href: canonicalUrl });

    document.head.querySelectorAll('link[data-seo-alt="true"]').forEach((node) => node.remove());
    Object.entries(alternates).forEach(([hreflang, href]) => {
      const link = document.createElement("link");
      link.rel = "alternate";
      link.hreflang = hreflang;
      link.href = href;
      link.setAttribute("data-seo-alt", "true");
      document.head.appendChild(link);
    });

    upsertStructuredData(pageSchema);
  }, [alternates, description, faq, image, lang, path, robots, schema, title, type]);
}
