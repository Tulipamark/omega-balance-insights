import { Link } from "react-router-dom";
import { Lang, t } from "@/lib/i18n";

interface FooterSectionProps {
  lang: Lang;
}

function trimTrailingPunctuation(value: string) {
  return value.trim().replace(/[.!?]+$/, "");
}

const FooterSection = ({ lang }: FooterSectionProps) => {
  const copy = t(lang).footer;
  const backofficeLabel = {
    sv: "Backoffice",
    no: "Backoffice",
    da: "Backoffice",
    fi: "Backoffice",
    en: "Backoffice",
    de: "Backoffice",
    fr: "Backoffice",
    it: "Backoffice",
  } satisfies Record<Lang, string>;
  const adminLabel = {
    sv: "Admin",
    no: "Admin",
    da: "Admin",
    fi: "Admin",
    en: "Admin",
    de: "Admin",
    fr: "Admin",
    it: "Admin",
  } satisfies Record<Lang, string>;
  const independentPartnerLabel = {
    sv: "Oberoende Zinzino-partner",
    no: "Uavhengig Zinzino-partner",
    da: "Uafhængig Zinzino-partner",
    fi: "Itsenäinen Zinzino-kumppani",
    en: "Independent Zinzino partner",
    de: "Unabhängiger Zinzino-Partner",
    fr: "Partenaire Zinzino indépendant",
    it: "Partner Zinzino indipendente",
  } satisfies Record<Lang, string>;
  const localizedPath = (basePath: "/integritet" | "/villkor" | "/kontakt") => (lang === "sv" ? basePath : `/${lang}${basePath}`);
  const footerLine = `© OmegaBalance 2026 • ${trimTrailingPunctuation(copy.tagline)} • ${independentPartnerLabel[lang]}`;

  return (
    <footer className="border-t border-border px-6 py-12 md:px-12">
      <div className="container-wide flex flex-col items-center justify-between gap-4 md:flex-row">
        <p className="font-serif text-lg font-semibold tracking-tight">OmegaBalance</p>
        <div className="text-center md:text-left">
          <p className="text-xs text-subtle">{footerLine}</p>
        </div>
        <div className="flex gap-6 text-xs text-subtle">
          <Link to="/dashboard/login" className="transition-colors hover:text-foreground">
            {backofficeLabel[lang]}
          </Link>
          <Link to="/dashboard/admin-login" className="transition-colors hover:text-foreground">
            {adminLabel[lang]}
          </Link>
          <Link to={localizedPath("/integritet")} className="transition-colors hover:text-foreground">
            {copy.privacy}
          </Link>
          <Link to={localizedPath("/villkor")} className="transition-colors hover:text-foreground">
            {copy.terms}
          </Link>
          <Link to={localizedPath("/kontakt")} className="transition-colors hover:text-foreground">
            {copy.contact}
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default FooterSection;
