import { ArrowRight, CheckCircle2, Menu } from "lucide-react";
import { Link, useLocation, useParams } from "react-router-dom";
import gutBalanceHeroImage from "@/assets/gut-balance-test-phone.jpg";
import FooterSection from "@/components/FooterSection";
import FaqDetails from "@/components/funnel/FaqDetails";
import InsideBalanceLogo from "@/components/InsideBalanceLogo";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import TrackedOutboundButton from "@/components/TrackedOutboundButton";
import { Sheet, SheetClose, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { gutBalanceV4Content } from "@/content/gut-balance-v4";
import { resolveContent } from "@/content/v4-types";
import { Lang, defaultLang, isSupportedLang, t } from "@/lib/i18n";
import { buildAlternates, useSeo } from "@/lib/seo";
import { getZinzinoGutTestUrl } from "@/lib/zinzino";

type GutBalancePageProps = {
  lang?: Lang;
};

const pendingLabelByLang: Record<Lang, string> = {
  sv: "Öppnar...",
  no: "Åpner...",
  da: "Åbner...",
  fi: "Avataan...",
  en: "Opening...",
  de: "Wird geöffnet...",
  fr: "Ouverture...",
  it: "Apertura...",
  ar: "جار الفتح...",
};

const genericErrorByLang: Record<Lang, string> = {
  sv: "Länken kunde inte öppnas just nu.",
  no: "Lenken kunne ikke åpnes akkurat nå.",
  da: "Linket kunne ikke åbnes lige nu.",
  fi: "Linkkiä ei voitu avata juuri nyt.",
  en: "The link could not be opened right now.",
  de: "Der Link konnte gerade nicht geöffnet werden.",
  fr: "Le lien n'a pas pu être ouvert pour le moment.",
  it: "Il link non può essere aperto in questo momento.",
  ar: "تعذر فتح الرابط حاليا.",
};

function resolveLang(param?: string): Lang {
  return (isSupportedLang(param) ? param : defaultLang) as Lang;
}

const platformHomePath = (lang: Lang) => (lang === "sv" ? "/" : `/${lang}`);
const omegaBalancePath = (lang: Lang) => (lang === "sv" ? "/omega-balance" : `/${lang}/omega-balance`);
const gutBalancePath = (lang: Lang) => (lang === "sv" ? "/gut-balance" : `/${lang}/gut-balance`);
const partnerPath = (lang: Lang) => (lang === "sv" ? "/partners" : `/${lang}/partners`);
const contactPath = (lang: Lang) => (lang === "sv" ? "/kontakt" : `/${lang}/kontakt`);
const sectionPath = (lang: Lang, sectionId: string) => `${gutBalancePath(lang)}#${sectionId}`;

const confirmCopyByLang: Record<Lang, { title: string; description: string; confirm: string; cancel: string }> = {
  sv: { title: "Du går nu vidare till Zinzino", description: "Nästa steg sker hos Zinzino, där beställning och leverans hanteras.", confirm: "OK, gå vidare", cancel: "Stanna kvar" },
  no: { title: "Du går nå videre til Zinzino", description: "Neste steg skjer hos Zinzino, der bestilling og levering håndteres.", confirm: "OK, gå videre", cancel: "Bli her" },
  da: { title: "Du går nu videre til Zinzino", description: "Næste skridt sker hos Zinzino, hvor bestilling og levering håndteres.", confirm: "OK, gå videre", cancel: "Bliv her" },
  fi: { title: "Siirryt nyt Zinzinoon", description: "Seuraava vaihe tapahtuu Zinzino-sivulla, jossa tilaus ja toimitus hoidetaan.", confirm: "OK, jatka", cancel: "Pysy täällä" },
  en: { title: "You are now continuing to Zinzino", description: "The next step takes place at Zinzino, where ordering and delivery are handled.", confirm: "OK, continue", cancel: "Stay here" },
  de: { title: "Du gehst jetzt zu Zinzino weiter", description: "Der nächste Schritt findet bei Zinzino statt, wo Bestellung und Lieferung abgewickelt werden.", confirm: "OK, weiter", cancel: "Hier bleiben" },
  fr: { title: "Vous allez maintenant continuer vers Zinzino", description: "L'étape suivante se déroule chez Zinzino, où la commande et la livraison sont gérées.", confirm: "OK, continuer", cancel: "Rester ici" },
  it: { title: "Stai per continuare su Zinzino", description: "Il passaggio successivo avviene su Zinzino, dove vengono gestiti ordine e consegna.", confirm: "OK, continua", cancel: "Resta qui" },
  ar: { title: "ستنتقل الآن إلى Zinzino", description: "الخطوة التالية تتم لدى Zinzino، حيث يتم التعامل مع الطلب والتوصيل.", confirm: "حسنا، متابعة", cancel: "البقاء هنا" },
};

const gutTaglineByLang: Record<Lang, string> = {
  sv: "Forskningsbaserad analys av tarmhälsa",
  no: "Forskningsbasert analyse av tarmhelse",
  da: "Forskningsbaseret analyse af tarmsundhed",
  fi: "Tutkimukseen perustuva suolistoterveyden analyysi",
  en: "Research-based gut health analysis",
  de: "Forschungsbasierte Analyse der Darmgesundheit",
  fr: "Analyse de la santé intestinale fondée sur la recherche",
  it: "Analisi della salute intestinale basata sulla ricerca",
  ar: "تحليل لصحة الأمعاء مبني على البحث",
};

const GutBalancePage = ({ lang: explicitLang }: GutBalancePageProps) => {
  const { lang } = useParams<{ lang: string }>();
  const location = useLocation();
  const currentLang = explicitLang ?? resolveLang(lang);
  const copy = resolveContent(gutBalanceV4Content, currentLang);
  const omegaPath = omegaBalancePath(currentLang);
  const partnersPath = partnerPath(currentLang);
  const translation = t(currentLang);
  const confirmCopy = confirmCopyByLang[currentLang];
  const currentPath = gutBalancePath(currentLang);
  useSeo({
    lang: currentLang,
    title: `${copy.hero.title} | GutBalance`,
    description: copy.hero.body,
    path: currentPath,
    alternates: buildAlternates((lang) => gutBalancePath(lang), ["sv", "no", "da", "fi", "en", "de", "fr", "it", "ar"]),
    faq: copy.faq,
  });
  const handleSectionClick = (sectionId: string) => (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (location.pathname !== currentPath) {
      return;
    }

    const target = document.getElementById(sectionId);

    if (!target) {
      return;
    }

    event.preventDefault();
    target.scrollIntoView({ behavior: "smooth", block: "start" });
    window.history.replaceState(null, "", `${currentPath}#${sectionId}`);
  };

  return (
    <main className="min-h-screen bg-[#f7f4ec] text-foreground">
      <section className="bg-[radial-gradient(circle_at_top,rgba(235,244,239,0.9),rgba(247,244,236,0.96)_42%,rgba(238,233,223,1)_100%)] px-4 pb-12 pt-8 md:px-6 md:pb-16 md:pt-10">
        <div className="container-wide mx-auto">
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <Link to={platformHomePath(currentLang)} className="transition-opacity hover:opacity-85" aria-label="InsideBalance">
              <InsideBalanceLogo alt="InsideBalance" variant="full" className="h-12 sm:h-14 md:h-16" imageClassName="scale-[2] origin-left" />
            </Link>
            <nav className="hidden items-center gap-6 text-sm text-foreground/72 xl:flex">
              <Link to={platformHomePath(currentLang)} className="transition hover:text-foreground">InsideBalance</Link>
              <Link to={omegaPath} className="transition hover:text-foreground">OmegaBalance</Link>
              <Link to={partnersPath} className="transition hover:text-foreground">{translation.partner.navLabel}</Link>
              <Link to={sectionPath(currentLang, "faq")} onClick={handleSectionClick("faq")} className="transition hover:text-foreground">{copy.faqTitle}</Link>
              <Link to={contactPath(currentLang)} className="transition hover:text-foreground">{translation.footer.contact}</Link>
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
              <SheetContent side="right" onCloseAutoFocus={(event) => event.preventDefault()} className="w-[88vw] max-w-sm border-l border-black/5 bg-[#f7f3eb] px-6 py-8">
                <SheetTitle className="sr-only">InsideBalance</SheetTitle>
                  <div className="mt-8 flex flex-col gap-6">
                    <div className="border-b border-black/5 pb-5">
                      <InsideBalanceLogo alt="InsideBalance" variant="full" className="h-12" imageClassName="scale-[1.65] origin-left" />
                    </div>
                    <div className="flex flex-col gap-3 text-base text-foreground/78">
                      <SheetClose asChild><Link to={platformHomePath(currentLang)} className="rounded-2xl px-3 py-3 transition hover:bg-black/3 hover:text-foreground">InsideBalance</Link></SheetClose>
                      <SheetClose asChild><Link to={omegaPath} className="rounded-2xl px-3 py-3 transition hover:bg-black/3 hover:text-foreground">OmegaBalance</Link></SheetClose>
                      <SheetClose asChild><Link to={partnersPath} className="rounded-2xl px-3 py-3 transition hover:bg-black/3 hover:text-foreground">{translation.partner.navLabel}</Link></SheetClose>
                      <SheetClose asChild><Link to={sectionPath(currentLang, "faq")} onClick={handleSectionClick("faq")} className="rounded-2xl px-3 py-3 transition hover:bg-black/3 hover:text-foreground">{copy.faqTitle}</Link></SheetClose>
                      <SheetClose asChild><Link to={contactPath(currentLang)} className="rounded-2xl px-3 py-3 transition hover:bg-black/3 hover:text-foreground">{translation.footer.contact}</Link></SheetClose>
                    </div>
                  </div>
              </SheetContent>
              </Sheet>
              <LanguageSwitcher lang={currentLang} />
            </div>
          </div>

          <div className="grid gap-8 lg:grid-cols-[0.92fr_1.08fr] lg:items-start">
            <div className="mx-auto max-w-3xl text-center lg:pt-6 lg:text-left">
              <span className="inline-flex rounded-full border border-black/5 bg-white/84 px-4 py-2 font-serif text-sm font-semibold tracking-tight text-foreground/75 shadow-[0_12px_30px_rgba(31,41,55,0.05)]">
                {copy.hero.eyebrow}
              </span>
              <h1 className="mt-5 max-w-4xl font-serif text-4xl font-semibold leading-[1.02] tracking-tight sm:text-5xl lg:text-6xl">{copy.hero.title}</h1>
              <p className="mx-auto mt-6 max-w-2xl text-[1.0625rem] leading-8 text-foreground/70 md:text-lg lg:mx-0">{copy.hero.body}</p>
              <div className="mt-8 flex flex-wrap justify-center gap-3 text-sm text-foreground/70 lg:justify-start">
                {copy.hero.trustRow.map((item) => (
                  <span key={item.text} className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 shadow-[0_10px_24px_rgba(31,41,55,0.04)]">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    {item.text}
                  </span>
                ))}
              </div>
              <div className="mx-auto mt-8 max-w-sm lg:mx-0">
                <TrackedOutboundButton
                  lang={currentLang}
                  destinationType="gut_test"
                  fallbackHref={getZinzinoGutTestUrl(currentLang)}
                  className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-3.5 text-base font-medium text-primary-foreground shadow-[0_18px_40px_hsl(var(--primary)/0.18)] transition hover:-translate-y-0.5 hover:opacity-95"
                  pendingLabel={pendingLabelByLang[currentLang]}
                  errorMessages={{ generic: genericErrorByLang[currentLang] }}
                  confirmTitle={confirmCopy.title}
                  confirmDescription={confirmCopy.description}
                  confirmConfirmLabel={confirmCopy.confirm}
                  confirmCancelLabel={confirmCopy.cancel}
                >
                  <>
                    {copy.hero.primaryCta}
                    <ArrowRight className="h-4 w-4" />
                  </>
                </TrackedOutboundButton>
              </div>
            </div>

            <div className="overflow-hidden rounded-[2rem] border border-black/5 bg-white/88 shadow-[0_24px_55px_rgba(31,41,55,0.08)]">
              <div className="h-[300px] md:h-full md:min-h-[420px]">
                <img src={gutBalanceHeroImage} alt={copy.hero.title} className="h-full w-full object-cover object-[center_22%]" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-14 md:px-6 md:py-18">
        <div className="container-wide mx-auto grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-[2rem] border border-[#ddd5c7] bg-[linear-gradient(180deg,rgba(238,231,218,1),rgba(244,239,229,1))] p-9 text-center shadow-[0_18px_40px_rgba(31,41,55,0.05)]">
            <h2 className="font-serif text-[2rem] font-semibold tracking-tight md:text-[2.35rem]">{copy.problem.title}</h2>
            <p className="mx-auto mt-5 max-w-2xl text-[1.02rem] leading-8 text-foreground/70">{copy.problem.body.text}</p>
          </div>

          <div className="rounded-[2rem] border border-black/5 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(240,246,242,0.84))] p-8 shadow-[0_20px_50px_rgba(31,41,55,0.06)]">
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{copy.product.eyebrow}</p>
            <h2 className="mt-3 font-serif text-[2rem] font-semibold tracking-tight md:text-[2.3rem]">{copy.product.title}</h2>
            <p className="mt-4 text-[1.02rem] leading-8 text-foreground/70">{copy.product.body.text}</p>
            <div className="mt-6 space-y-3">
              {copy.product.points.map((point) => (
                <div key={point.text} className="flex items-start gap-3 rounded-2xl border border-black/5 bg-white/84 px-5 py-4 shadow-[0_10px_25px_rgba(31,41,55,0.04)]">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <p className="text-[1.01rem] leading-7 text-foreground/78">{point.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[linear-gradient(180deg,rgba(247,244,236,1),rgba(240,246,242,0.7))] px-4 py-14 md:px-6 md:py-18">
        <div className="container-wide mx-auto">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="font-serif text-[2rem] font-semibold tracking-tight md:text-[2.4rem]">{copy.science.title}</h2>
            <p className="mx-auto mt-5 max-w-2xl text-[1.02rem] leading-8 text-foreground/70">{copy.science.body.text}</p>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {copy.science.markers.map((item) => (
              <article key={item.title} className="rounded-[1.75rem] border border-[hsl(var(--primary)/0.08)] bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(244,248,246,0.84))] p-7 shadow-[0_18px_40px_rgba(31,41,55,0.05)]">
                <h3 className="font-serif text-[1.55rem] font-semibold tracking-tight text-foreground">{item.title}</h3>
                <p className="mt-4 text-[1.01rem] leading-7 text-foreground/68">{item.body.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <div id="faq">
        <FaqDetails title={copy.faqTitle} items={copy.faq} className="bg-[#f7f4ec]" />
      </div>

      <section className="px-4 py-12 md:px-6 md:py-14">
        <div className="container-wide mx-auto">
          <div className="relative overflow-hidden rounded-[2.2rem] bg-[linear-gradient(135deg,hsl(var(--primary)),hsl(var(--primary)/0.88))] px-6 py-8 text-center shadow-[0_28px_68px_hsl(var(--primary)/0.22)] md:px-10 md:py-10">
            <div className="absolute -left-14 bottom-0 h-36 w-36 rounded-full bg-white/5" />
            <div className="absolute -right-10 top-0 h-32 w-32 rounded-full bg-white/5" />
            <div className="relative mx-auto max-w-3xl">
              <h2 className="font-serif text-[2rem] font-semibold tracking-tight text-white md:text-[2.35rem]">{copy.omegaLink.title}</h2>
              <p className="mx-auto mt-4 max-w-2xl text-[1.02rem] leading-8 text-white">{copy.omegaLink.body}</p>
            </div>
            <div className="relative mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link to={omegaPath} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-white px-6 py-3.5 text-base font-medium text-primary transition hover:opacity-95">
                {copy.omegaLink.primaryCta}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <TrackedOutboundButton
                lang={currentLang}
                destinationType="gut_test"
                fallbackHref={getZinzinoGutTestUrl(currentLang)}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-white/30 bg-transparent px-6 py-3.5 text-base font-medium text-white transition hover:bg-white/10"
                pendingLabel={pendingLabelByLang[currentLang]}
                errorMessages={{ generic: genericErrorByLang[currentLang] }}
              >
                <>
                  {copy.omegaLink.secondaryCta}
                  <ArrowRight className="h-4 w-4" />
                </>
              </TrackedOutboundButton>
            </div>
          </div>
        </div>
      </section>

      <FooterSection lang={currentLang} brandName="GutBalance" taglineOverride={gutTaglineByLang[currentLang]} />
    </main>
  );
};

export default GutBalancePage;
