import { writeFileSync } from "node:fs";
import { resolve } from "node:path";

const siteUrl = "https://insidebalance.eu";
const supportedLangs = ["sv", "no", "da", "fi", "en", "de", "fr", "it", "ar"];
const localizedRoutes = ["omega-balance", "gut-balance", "partners"];
const SwedishOnlyRoutes = ["kontakt", "integritet", "villkor"];

function localizedPath(lang, route = "") {
  if (lang === "sv") {
    return route ? `/${route}` : "/";
  }

  return route ? `/${lang}/${route}` : `/${lang}`;
}

const paths = [
  ...supportedLangs.map((lang) => localizedPath(lang)),
  ...supportedLangs.flatMap((lang) => localizedRoutes.map((route) => localizedPath(lang, route))),
  ...SwedishOnlyRoutes.map((route) => `/${route}`),
];

const uniquePaths = Array.from(new Set(paths));
const lastmod = new Date().toISOString().slice(0, 10);

const urls = uniquePaths
  .map((path) => {
    const loc = new URL(path, siteUrl).toString();
    return [
      "  <url>",
      `    <loc>${loc}</loc>`,
      `    <lastmod>${lastmod}</lastmod>`,
      "  </url>",
    ].join("\n");
  })
  .join("\n");

const sitemap = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  urls,
  "</urlset>",
  "",
].join("\n");

writeFileSync(resolve("public", "sitemap.xml"), sitemap, "utf8");
