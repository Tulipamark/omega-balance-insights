import { Facebook, Instagram } from "lucide-react";
import { Link } from "react-router-dom";
import { Lang, t } from "@/lib/i18n";

interface FooterSectionProps {
  lang: Lang;
  brandName?: string;
  taglineOverride?: string;
}

function trimTrailingPunctuation(value: string) {
  return value.trim().replace(/[.!?]+$/, "");
}

const legalLabel = {
  sv: "Juridiskt",
  no: "Juridisk",
  da: "Juridisk",
  fi: "Juridinen",
  en: "Legal",
  de: "Rechtliches",
  fr: "Juridique",
  it: "Legale",
} satisfies Record<Lang, string>;

const accessLabel = {
  sv: "Inloggning",
  no: "Innlogging",
  da: "Login",
  fi: "Kirjautuminen",
  en: "Access",
  de: "Login",
  fr: "Acces",
  it: "Accesso",
} satisfies Record<Lang, string>;

const backofficeLabel = {
  sv: "Partnerportal",
  no: "Partnerportal",
  da: "Partnerportal",
  fi: "Partneriportaali",
  en: "Partner portal",
  de: "Partnerportal",
  fr: "Portail partenaire",
  it: "Portale partner",
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

const operatedByLabel = {
  sv: "Drivs av Per Lundstr\u00f6m",
  no: "Drives av Per Lundstr\u00f6m",
  da: "Drives af Per Lundstr\u00f6m",
  fi: "Yll\u00e4pit\u00e4j\u00e4 Per Lundstr\u00f6m",
  en: "Operated by Per Lundstr\u00f6m",
  de: "Betrieben von Per Lundstr\u00f6m",
  fr: "Exploite par Per Lundstr\u00f6m",
  it: "Gestito da Per Lundstr\u00f6m",
} satisfies Record<Lang, string>;

const independentPartnerLabel = {
  sv: "Oberoende partner till Zinzino",
  no: "Uavhengig partner til Zinzino",
  da: "Uafhaengig partner til Zinzino",
  fi: "Itsen\u00e4inen Zinzino-kumppani",
  en: "Independent partner to Zinzino",
  de: "Unabh\u00e4ngiger Partner von Zinzino",
  fr: "Partenaire independant de Zinzino",
  it: "Partner indipendente di Zinzino",
} satisfies Record<Lang, string>;

const swedishFooterLineByBrand: Partial<Record<string, string>> = {
  OmegaBalance:
    "\u00a9 2026 OmegaBalance. Vetenskapligt baserad fettsyreanalys. Drivs av Per Lundstr\u00f6m. Oberoende partner till Zinzino.",
  GutBalance:
    "\u00a9 2026 GutBalance. Forskningsbaserad analys av tarmh\u00e4lsa. Drivs av Per Lundstr\u00f6m. Oberoende partner till Zinzino.",
};

const brandIntroByLang = {
  sv: "En lugnare, mer f\u00f6rtroendeingivande v\u00e4g in i testbaserad h\u00e4lsa.",
  no: "En roligere og mer tillitsvekkende vei inn i testbasert helse.",
  da: "En roligere og mere tillidsv\u00e6kkende vej ind i testbaseret sundhed.",
  fi: "Rauhallisempi ja luotettavampi tapa l\u00e4hesty\u00e4 testipohjaista hyvinvointia.",
  en: "A calmer, more credible way into test-based health.",
  de: "Ein ruhigerer und vertrauensw\u00fcrdigerer Weg in testbasierte Gesundheit.",
  fr: "Une approche plus sereine et plus credible de la sante basee sur les tests.",
  it: "Un approccio pi\u00f9 calmo e credibile alla salute basata sui test.",
} satisfies Record<Lang, string>;

const socialLinks = {
  instagram: "https://www.instagram.com/insidebalance.eu",
  facebook: "https://www.facebook.com/profile.php?id=61574295346336&sk=about",
} as const;

const FooterSection = ({ lang, brandName = "OmegaBalance", taglineOverride }: FooterSectionProps) => {
  const copy = t(lang).footer;
  const localizedPath = (basePath: "/integritet" | "/villkor" | "/kontakt") =>
    lang === "sv" ? basePath : `/${lang}${basePath}`;
  const resolvedTagline = trimTrailingPunctuation(taglineOverride ?? copy.tagline);
  const taglineSegment = resolvedTagline ? ` ${resolvedTagline}.` : "";
  const footerLine =
    lang === "sv" && swedishFooterLineByBrand[brandName]
      ? swedishFooterLineByBrand[brandName]!
      : `\u00a9 2026 ${brandName}.${taglineSegment} ${operatedByLabel[lang]}. ${independentPartnerLabel[lang]}.`;

  return (
    <footer className="border-t border-black/5 bg-[#f3ecdf] px-4 py-14 md:px-6 md:py-16">
      <div className="container-wide mx-auto">
        <div className="grid gap-10 md:grid-cols-[1.2fr_0.8fr_0.8fr]">
          <div className="max-w-xl">
            <p className="font-serif text-2xl font-semibold tracking-tight text-foreground">{brandName}</p>
            <p className="mt-4 text-sm leading-7 text-foreground/64">{brandIntroByLang[lang]}</p>
            <div className="mt-5 flex items-center gap-3">
              <a
                href={socialLinks.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="InsideBalance on Instagram"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-foreground/10 bg-white/35 text-foreground/52 transition hover:border-foreground/20 hover:bg-white/55 hover:text-foreground/72"
              >
                <Instagram className="h-4 w-4" />
              </a>
              <a
                href={socialLinks.facebook}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="InsideBalance on Facebook"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-foreground/10 bg-white/35 text-foreground/52 transition hover:border-foreground/20 hover:bg-white/55 hover:text-foreground/72"
              >
                <Facebook className="h-4 w-4" />
              </a>
            </div>
            <p className="mt-6 text-xs leading-6 text-foreground/52">{footerLine}</p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-foreground/40">{legalLabel[lang]}</p>
            <div className="mt-4 flex flex-col gap-2.5 text-sm text-foreground/70">
              <Link to={localizedPath("/kontakt")} className="transition hover:text-foreground">
                {copy.contact}
              </Link>
              <Link to={localizedPath("/integritet")} className="transition hover:text-foreground">
                {copy.privacy}
              </Link>
              <Link to={localizedPath("/villkor")} className="transition hover:text-foreground">
                {copy.terms}
              </Link>
            </div>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-foreground/40">{accessLabel[lang]}</p>
            <div className="mt-4 flex flex-col gap-2.5 text-sm text-foreground/70">
              <Link to="/dashboard/login" className="transition hover:text-foreground">
                {backofficeLabel[lang]}
              </Link>
              <Link to="/dashboard/admin-login" className="transition hover:text-foreground">
                {adminLabel[lang]}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default FooterSection;
