import { ArrowRight, CheckCircle2, Menu } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import FooterSection from "@/components/FooterSection";
import FaqDetails from "@/components/funnel/FaqDetails";
import InsideBalanceLogo from "@/components/InsideBalanceLogo";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { Sheet, SheetClose, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import zinzinoLoveImage from "@/assets/zinzino-love-D01jEncW.png";
import { insideBalanceV4Content } from "@/content/inside-balance-v4";
import { resolveContent } from "@/content/v4-types";
import { Lang, defaultLang, isSupportedLang, t } from "@/lib/i18n";

type InsideBalancePageProps = {
  lang?: Lang;
};

function resolveLang(param?: string): Lang {
  return (isSupportedLang(param) ? param : defaultLang) as Lang;
}

const localizedPath = (lang: Lang, path: string) => (lang === "sv" ? path : `/${lang}${path}`);
const platformHomePath = (lang: Lang) => (lang === "sv" ? "/" : `/${lang}`);
const omegaBalancePath = (lang: Lang) => localizedPath(lang, "/omega-balance");
const gutBalancePath = (lang: Lang) => localizedPath(lang, "/gut-balance");
const partnerPath = (lang: Lang) => localizedPath(lang, "/partners");
const sectionPath = (lang: Lang, sectionId: string) => `${platformHomePath(lang)}#${sectionId}`;

const heroSupportByLang: Record<Lang, { eyebrow: string; omegaBody: string; gutBody: string }> = {
  sv: { eyebrow: "Mät först", omegaBody: "är den tydligaste startpunkten.", gutBody: "fungerar som ett kompletterande spår senare." },
  no: { eyebrow: "Mål først", omegaBody: "er det tydeligste startpunktet.", gutBody: "fungerer som et komplementært spor senere." },
  da: { eyebrow: "Mål først", omegaBody: "er det tydeligste startpunkt.", gutBody: "fungerer som et supplerende spor senere." },
  fi: { eyebrow: "Mittaa ensin", omegaBody: "on selkein aloituspiste.", gutBody: "toimii täydentävänä polkuna myöhemmin." },
  en: { eyebrow: "Measure first", omegaBody: "is the clearest place to begin.", gutBody: "works as a complementary path later on." },
  de: { eyebrow: "Zuerst messen", omegaBody: "ist der klarste Startpunkt.", gutBody: "funktioniert später als ergänzender Weg." },
  fr: { eyebrow: "Mesurez d'abord", omegaBody: "est le point de départ le plus clair.", gutBody: "fonctionne ensuite comme un parcours complémentaire." },
  it: { eyebrow: "Misura prima", omegaBody: "è il punto di partenza più chiaro.", gutBody: "funziona poi come percorso complementare." },
};

const nextStepPreviewByLang: Record<Lang, { eyebrow: string; cards: { title: string; body: string }[] }> = {
  sv: { eyebrow: "Vad nästa steg innehåller", cards: [{ title: "Test", body: "Ett konkret utgångsvärde i stället för gissning." }, { title: "Rapport", body: "Tydligare sammanhang kring det du faktiskt mäter." }, { title: "Vägledning", body: "En lugnare väg vidare när du vet mer om nuläget." }, { title: "Uppföljning", body: "Möjlighet att följa förändring i siffror över tid." }] },
  no: { eyebrow: "Hva neste steg inneholder", cards: [{ title: "Test", body: "En konkret startverdi i stedet for gjetting." }, { title: "Rapport", body: "Tydeligere sammenheng rundt det du faktisk måler." }, { title: "Veiledning", body: "En roligere vei videre når du vet mer om utgangspunktet." }, { title: "Oppfølging", body: "Mulighet til å følge endring i tall over tid." }] },
  da: { eyebrow: "Hvad næste skridt indeholder", cards: [{ title: "Test", body: "En konkret startværdi i stedet for gætteri." }, { title: "Rapport", body: "Tydeligere sammenhæng omkring det, du faktisk måler." }, { title: "Vejledning", body: "En roligere vej videre, når du ved mere om udgangspunktet." }, { title: "Opfølgning", body: "Mulighed for at følge ændringer i tal over tid." }] },
  fi: { eyebrow: "Mitä seuraava vaihe sisältää", cards: [{ title: "Testi", body: "Konkreettinen lähtöarvo arvailun sijaan." }, { title: "Raportti", body: "Selkeämpi kokonaiskuva siitä, mitä todella mittaat." }, { title: "Ohjaus", body: "Rauhallisempi seuraava askel, kun tiedät enemmän lähtötilanteesta." }, { title: "Seuranta", body: "Mahdollisuus seurata muutosta numeroina ajan mittaan." }] },
  en: { eyebrow: "What the next step includes", cards: [{ title: "Test", body: "A concrete starting value instead of guesswork." }, { title: "Report", body: "Clearer context around what you are actually measuring." }, { title: "Guidance", body: "A calmer next step once you understand the current picture." }, { title: "Follow-up", body: "A way to track change in numbers over time." }] },
  de: { eyebrow: "Was der nächste Schritt umfasst", cards: [{ title: "Test", body: "Ein konkreter Ausgangswert statt Vermutungen." }, { title: "Bericht", body: "Mehr Klarheit über das, was du tatsächlich misst." }, { title: "Orientierung", body: "Ein ruhigerer nächster Schritt, wenn du die Ausgangslage besser kennst." }, { title: "Follow-up", body: "Die Möglichkeit, Veränderungen über Zahlen im Zeitverlauf zu verfolgen." }] },
  fr: { eyebrow: "Ce que comprend l'étape suivante", cards: [{ title: "Test", body: "Une valeur de départ concrète au lieu d'hypothèses." }, { title: "Rapport", body: "Un contexte plus clair autour de ce que vous mesurez réellement." }, { title: "Orientation", body: "Une suite plus sereine lorsque vous comprenez mieux votre point de départ." }, { title: "Suivi", body: "La possibilité de suivre l'évolution en chiffres dans le temps." }] },
  it: { eyebrow: "Cosa comprende il passo successivo", cards: [{ title: "Test", body: "Un valore iniziale concreto invece di supposizioni." }, { title: "Report", body: "Un contesto più chiaro su ciò che stai realmente misurando." }, { title: "Guida", body: "Un passo successivo più tranquillo quando capisci meglio il punto di partenza." }, { title: "Follow-up", body: "La possibilità di seguire il cambiamento in numeri nel tempo." }] },
};

const primaryCtaClass =
  "inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 text-base font-medium text-primary-foreground shadow-[0_18px_38px_hsl(var(--primary)/0.18)] transition hover:-translate-y-0.5 hover:opacity-95";

const secondaryLinkClass =
  "inline-flex min-h-12 items-center justify-center gap-2 text-sm font-medium text-foreground/72 transition hover:text-foreground";

const InsideBalancePage = ({ lang: explicitLang }: InsideBalancePageProps) => {
  const { lang } = useParams<{ lang: string }>();
  const currentLang = explicitLang ?? resolveLang(lang);
  const copy = resolveContent(insideBalanceV4Content, currentLang);
  const omegaPath = omegaBalancePath(currentLang);
  const gutPath = gutBalancePath(currentLang);
  const partnersPath = partnerPath(currentLang);
  const heroSupport = heroSupportByLang[currentLang];
  const nextStepPreview = nextStepPreviewByLang[currentLang];
  const partnerLabel = t(currentLang).partner.navLabel;

  return (
    <main className="min-h-screen bg-[#f7f3eb] text-foreground">
      <header className="border-b border-black/5 bg-[#f7f3eb] px-4 py-5 md:px-6">
        <div className="container-wide mx-auto flex items-center justify-between gap-6">
          <Link to={platformHomePath(currentLang)} className="min-w-0 flex-1" aria-label={copy.nav.home}>
            <InsideBalanceLogo alt={copy.nav.home} variant="full" className="h-12 sm:h-14 md:h-16" imageClassName="scale-[2] origin-left" />
          </Link>
          <nav className="hidden items-center gap-6 text-[0.95rem] text-foreground/72 xl:flex">
            <Link to={omegaPath} className="transition hover:text-foreground">{copy.nav.omega}</Link>
            <Link to={gutPath} className="transition hover:text-foreground">{copy.nav.gut}</Link>
            <Link to={partnersPath} className="transition hover:text-foreground">{partnerLabel}</Link>
            <Link to={sectionPath(currentLang, "process")} className="transition hover:text-foreground">{copy.nav.process}</Link>
            <Link to={sectionPath(currentLang, "trust")} className="transition hover:text-foreground">{copy.nav.trust}</Link>
            <Link to={sectionPath(currentLang, "faq")} className="transition hover:text-foreground">{copy.nav.faq}</Link>
            <Link to={localizedPath(currentLang, "/kontakt")} className="transition hover:text-foreground">{copy.nav.contact}</Link>
          </nav>
          <div className="flex items-center gap-2 sm:gap-3">
            <Sheet>
              <SheetTrigger asChild>
                <button
                  type="button"
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-black/8 bg-white text-foreground shadow-[0_10px_24px_rgba(31,41,55,0.06)] transition hover:bg-white/90 xl:hidden"
                  aria-label="Open navigation"
                >
                  <Menu className="h-5 w-5" />
                </button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[88vw] max-w-sm border-l border-black/5 bg-[#f7f3eb] px-6 py-8">
                <SheetTitle className="sr-only">{copy.nav.home}</SheetTitle>
                <div className="mt-8 flex flex-col gap-6">
                  <div className="border-b border-black/5 pb-5">
                    <InsideBalanceLogo alt={copy.nav.home} variant="full" className="h-12" imageClassName="scale-[1.65] origin-left" />
                  </div>
                  <div className="flex flex-col gap-3 text-base text-foreground/78">
                    <SheetClose asChild><Link to={platformHomePath(currentLang)} className="rounded-2xl px-3 py-3 transition hover:bg-black/3 hover:text-foreground">{copy.nav.home}</Link></SheetClose>
                    <SheetClose asChild><Link to={omegaPath} className="rounded-2xl px-3 py-3 transition hover:bg-black/3 hover:text-foreground">{copy.nav.omega}</Link></SheetClose>
                    <SheetClose asChild><Link to={gutPath} className="rounded-2xl px-3 py-3 transition hover:bg-black/3 hover:text-foreground">{copy.nav.gut}</Link></SheetClose>
                    <SheetClose asChild><Link to={partnersPath} className="rounded-2xl px-3 py-3 transition hover:bg-black/3 hover:text-foreground">{partnerLabel}</Link></SheetClose>
                    <SheetClose asChild><Link to={sectionPath(currentLang, "process")} className="rounded-2xl px-3 py-3 transition hover:bg-black/3 hover:text-foreground">{copy.nav.process}</Link></SheetClose>
                    <SheetClose asChild><Link to={sectionPath(currentLang, "trust")} className="rounded-2xl px-3 py-3 transition hover:bg-black/3 hover:text-foreground">{copy.nav.trust}</Link></SheetClose>
                    <SheetClose asChild><Link to={sectionPath(currentLang, "faq")} className="rounded-2xl px-3 py-3 transition hover:bg-black/3 hover:text-foreground">{copy.nav.faq}</Link></SheetClose>
                    <SheetClose asChild><Link to={localizedPath(currentLang, "/kontakt")} className="rounded-2xl px-3 py-3 transition hover:bg-black/3 hover:text-foreground">{copy.nav.contact}</Link></SheetClose>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
            <LanguageSwitcher lang={currentLang} />
          </div>
        </div>
      </header>

      <section className="overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(230,243,235,0.95),rgba(247,243,235,0.98)_42%,rgba(242,235,223,1)_100%)] px-4 pb-20 pt-10 md:px-6 md:pb-24 md:pt-16">
        <div className="container-wide mx-auto grid items-start gap-12 lg:grid-cols-[0.94fr_1.06fr] lg:gap-16">
          <div className="text-center lg:pt-4 lg:text-left">
            <span className="inline-flex rounded-full border border-[rgba(70,99,80,0.12)] bg-white/80 px-4 py-2 text-sm font-medium text-primary shadow-[0_12px_30px_rgba(31,41,55,0.05)]">
              {copy.hero.eyebrow}
            </span>
            <h1 className="mt-6 max-w-4xl font-serif text-4xl font-semibold leading-[1.02] tracking-tight sm:text-5xl lg:text-6xl">
              {copy.hero.title}
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-foreground/70 lg:mx-0">
              {copy.hero.body}
            </p>
            <div className="mt-8 flex flex-col items-center gap-3 lg:items-start">
              <Link to={omegaPath} className={primaryCtaClass}>
                {copy.hero.primaryCta}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to={sectionPath(currentLang, "process")} className={secondaryLinkClass}>
                {copy.hero.secondaryCta}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap justify-center gap-3 text-sm text-foreground/70 lg:justify-start">
              {copy.hero.trustRow.map((item) => (
                <span key={item.text} className="inline-flex items-center gap-2 rounded-full bg-white/78 px-4 py-2 shadow-[0_10px_24px_rgba(31,41,55,0.04)]">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  {item.text}
                </span>
              ))}
            </div>
          </div>

          <div className="grid gap-5">
            <div className="overflow-hidden rounded-[1.55rem] border border-[rgba(70,99,80,0.08)] bg-white/82 shadow-[0_18px_42px_rgba(31,70,55,0.08)]">
              <div className="h-[270px] overflow-hidden sm:h-[290px]">
                <img
                  src={zinzinoLoveImage}
                  alt={copy.hero.title}
                  className="h-full w-full scale-[1.0] object-cover object-[20%_53%]"
                />
              </div>
              <div className="px-5 py-4">
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-primary">{heroSupport.eyebrow}</p>
                <p className="mt-2 max-w-none text-sm leading-6 text-foreground/68">
                  <span className="font-semibold text-foreground">OmegaBalance</span> {heroSupport.omegaBody}
                  <span className="mx-2 text-foreground/28">•</span>
                  <span className="font-semibold text-foreground">GutBalance</span> {heroSupport.gutBody}
                </p>
              </div>
            </div>
            <div className="rounded-[2rem] border border-[rgba(70,99,80,0.08)] bg-white/82 p-6 shadow-[0_18px_40px_rgba(31,41,55,0.06)]">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-primary">{nextStepPreview.eyebrow}</p>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                {nextStepPreview.cards.map((card) => (
                  <div key={card.title} className="rounded-[1.3rem] bg-[rgba(247,243,235,0.92)] px-5 py-4">
                    <p className="text-sm font-semibold text-foreground">{card.title}</p>
                    <p className="mt-2 text-sm leading-7 text-foreground/68">{card.body}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="process" className="px-4 pt-24 pb-18 md:px-6 md:py-24">
        <div className="container-wide mx-auto">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-primary">{copy.process.eyebrow}</p>
            <h2 className="mt-5 font-serif text-3xl font-semibold tracking-tight md:text-5xl">{copy.process.title}</h2>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-foreground/68">{copy.process.body}</p>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-foreground/58">{copy.normalizingBand.text}</p>
          </div>
          <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {copy.process.steps.map((step, index) => (
              <article key={step.title} className="rounded-[1.8rem] border border-[rgba(70,99,80,0.1)] bg-white px-6 py-7 shadow-[0_18px_40px_rgba(31,41,55,0.04)]">
                <p className="text-sm font-semibold tracking-[0.16em] text-primary">{String(index + 1).padStart(2, "0")}</p>
                <h3 className="mt-4 text-xl font-semibold tracking-tight">{step.title}</h3>
                <p className="mt-4 text-sm leading-7 text-foreground/68">{step.body.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="trust" className="bg-[#efe7d8] px-4 pt-24 pb-18 md:px-6 md:py-24">
        <div className="container-wide mx-auto">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-primary">{copy.trust.eyebrow}</p>
            <h2 className="mt-5 font-serif text-3xl font-semibold tracking-tight md:text-5xl">{copy.trust.title}</h2>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-foreground/68">{copy.trust.body}</p>
          </div>
          <div className="mt-12 grid gap-5 md:grid-cols-2">
            {copy.trust.items.map((item) => (
              <article key={item.title} className="rounded-[1.8rem] bg-white px-6 py-7 shadow-[0_18px_38px_rgba(31,41,55,0.05)]">
                <h3 className="text-xl font-semibold tracking-tight">{item.title}</h3>
                <p className="mt-4 text-sm leading-7 text-foreground/68">{item.body.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 pt-24 pb-18 md:px-6 md:py-24">
        <div className="container-wide mx-auto">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-primary">{copy.nextStep.eyebrow}</p>
            <h2 className="mt-5 font-serif text-3xl font-semibold tracking-tight md:text-5xl">{copy.nextStep.title}</h2>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-foreground/68">{copy.nextStep.body}</p>
          </div>
          <div className="mt-12 grid gap-6 lg:grid-cols-2">
            {copy.nextStep.cards.map((card) => (
              <article key={card.title} className="rounded-[2rem] border border-[rgba(70,99,80,0.1)] bg-white px-7 py-8 shadow-[0_20px_45px_rgba(31,41,55,0.05)]">
                <p className="text-sm font-medium uppercase tracking-[0.18em] text-primary">{card.label}</p>
                <h3 className="mt-4 text-2xl font-semibold tracking-tight">{card.title}</h3>
                <p className="mt-4 text-base leading-8 text-foreground/72">{card.body}</p>
                <div className="mt-7">
                  <Link to={card.href} className={primaryCtaClass}>
                    {card.cta}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-12 md:px-6 md:py-14">
        <div className="container-wide mx-auto">
          <div className="relative overflow-hidden rounded-3xl bg-primary px-8 py-10 text-center text-primary-foreground shadow-[0_28px_70px_hsl(var(--primary)/0.22)] md:px-12 md:py-14">
            <div className="absolute -left-14 bottom-0 h-36 w-36 rounded-full bg-white/5" />
            <div className="absolute -right-10 top-0 h-32 w-32 rounded-full bg-white/5" />
            <div className="relative mx-auto max-w-3xl">
              <h2 className="font-serif text-3xl font-semibold tracking-tight md:text-5xl">{copy.closing.title}</h2>
              <p className="mt-5 text-lg leading-8 text-primary-foreground/86">{copy.closing.body}</p>
            </div>
            <div className="relative mt-8 flex justify-center">
              <Link to={copy.closing.href} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-white px-6 py-3.5 text-base font-medium text-primary transition hover:opacity-95">
                {copy.closing.cta}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div id="faq">
        <FaqDetails title={copy.faqTitle} items={copy.faq} className="bg-[#f7f3eb]" />
      </div>

      <FooterSection lang={currentLang} brandName="InsideBalance" />
    </main>
  );
};

export default InsideBalancePage;
