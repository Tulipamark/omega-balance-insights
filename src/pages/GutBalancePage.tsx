import { Link, useParams } from "react-router-dom";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { Lang, defaultLang, isSupportedLang } from "@/lib/i18n";

type GutBalancePageProps = {
  lang?: Lang;
};

const copyByLang: Record<Lang, { eyebrow: string; title: string; body: string; primary: string; secondary: string }> = {
  sv: {
    eyebrow: "GutBalance",
    title: "GutBalance \u00e4r n\u00e4sta testsp\u00e5r",
    body: "Vi s\u00e4tter just nu grunden f\u00f6r GutBalance som n\u00e4sta produktsida inom InsideBalance. H\u00e4r kommer n\u00e4sta h\u00e4lsoresa f\u00f6r mage, tarm och inre balans att landa.",
    primary: "Till InsideBalance",
    secondary: "Till OmegaBalance",
  },
  no: { eyebrow: "GutBalance", title: "GutBalance er neste testspor", body: "Vi bygger nå grunnlaget for GutBalance som neste produktside innenfor InsideBalance.", primary: "Til InsideBalance", secondary: "Til OmegaBalance" },
  da: { eyebrow: "GutBalance", title: "GutBalance er næste testspor", body: "Vi bygger nu grundlaget for GutBalance som næste produktside i InsideBalance.", primary: "Til InsideBalance", secondary: "Til OmegaBalance" },
  fi: { eyebrow: "GutBalance", title: "GutBalance on seuraava testipolku", body: "Rakennamme nyt perustaa GutBalancelle InsideBalancen seuraavana tuotesivuna.", primary: "InsideBalanceen", secondary: "OmegaBalanceen" },
  en: { eyebrow: "GutBalance", title: "GutBalance is the next test journey", body: "We are now building the foundation for GutBalance as the next product page inside InsideBalance.", primary: "Go to InsideBalance", secondary: "Go to OmegaBalance" },
  de: { eyebrow: "GutBalance", title: "GutBalance ist der nächste Testweg", body: "Wir bauen gerade die Grundlage für GutBalance als nächste Produktseite innerhalb von InsideBalance.", primary: "Zu InsideBalance", secondary: "Zu OmegaBalance" },
  fr: { eyebrow: "GutBalance", title: "GutBalance est le prochain parcours de test", body: "Nous posons actuellement les bases de GutBalance comme prochaine page produit au sein de InsideBalance.", primary: "Vers InsideBalance", secondary: "Vers OmegaBalance" },
  it: { eyebrow: "GutBalance", title: "GutBalance è il prossimo percorso di test", body: "Stiamo costruendo le basi di GutBalance come prossima pagina prodotto dentro InsideBalance.", primary: "Vai a InsideBalance", secondary: "Vai a OmegaBalance" },
};

function resolveLang(param?: string): Lang {
  return (isSupportedLang(param) ? param : defaultLang) as Lang;
}

const localizedPath = (lang: Lang, base: string) => (lang === "sv" ? base : `/${lang}${base}`);

const GutBalancePage = ({ lang: explicitLang }: GutBalancePageProps) => {
  const { lang } = useParams<{ lang: string }>();
  const currentLang = explicitLang ?? resolveLang(lang);
  const copy = copyByLang[currentLang];

  return (
    <main className="min-h-screen bg-[#f7f4ec] px-4 py-8 md:px-6 md:py-12">
      <div className="container-wide mx-auto">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <Link to={localizedPath(currentLang, "/inside-balance")} className="font-serif text-xl font-semibold tracking-tight text-foreground">
            InsideBalance
          </Link>
          <LanguageSwitcher lang={currentLang} />
        </div>

        <section className="mx-auto max-w-4xl rounded-[2rem] border border-border/70 bg-white/90 px-6 py-10 shadow-elevated md:px-10 md:py-14">
          <span className="inline-flex rounded-full border border-border/70 bg-accent px-4 py-1.5 text-sm font-medium tracking-wide text-accent-foreground">
            {copy.eyebrow}
          </span>
          <h1 className="mt-5 font-serif text-4xl font-semibold tracking-tight text-foreground md:text-6xl">{copy.title}</h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-foreground/72">{copy.body}</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link to={localizedPath(currentLang, "/inside-balance")} className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-3.5 text-base font-medium text-primary-foreground shadow-elevated">
              {copy.primary}
            </Link>
            <Link to={currentLang === "sv" ? "/sv" : `/${currentLang}`} className="inline-flex items-center justify-center rounded-full border border-border bg-card px-6 py-3.5 text-base font-medium text-foreground shadow-card">
              {copy.secondary}
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
};

export default GutBalancePage;
