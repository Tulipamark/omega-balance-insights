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
import { Lang, defaultLang, isSupportedLang } from "@/lib/i18n";

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
            <a href="#process" className="transition hover:text-foreground">{copy.nav.process}</a>
            <a href="#trust" className="transition hover:text-foreground">{copy.nav.trust}</a>
            <a href="#faq" className="transition hover:text-foreground">{copy.nav.faq}</a>
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
                    <SheetClose asChild><a href="#process" className="rounded-2xl px-3 py-3 transition hover:bg-black/3 hover:text-foreground">{copy.nav.process}</a></SheetClose>
                    <SheetClose asChild><a href="#trust" className="rounded-2xl px-3 py-3 transition hover:bg-black/3 hover:text-foreground">{copy.nav.trust}</a></SheetClose>
                    <SheetClose asChild><a href="#faq" className="rounded-2xl px-3 py-3 transition hover:bg-black/3 hover:text-foreground">{copy.nav.faq}</a></SheetClose>
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
              <a href="#process" className={secondaryLinkClass}>
                {copy.hero.secondaryCta}
                <ArrowRight className="h-4 w-4" />
              </a>
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
                  alt="BalanceOil med ros och blad"
                  className="h-full w-full scale-[1.0] object-cover object-[20%_53%]"
                />
              </div>
              <div className="px-5 py-4">
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-primary">Mät först</p>
                <p className="mt-2 max-w-none text-sm leading-6 text-foreground/68">
                  <span className="font-semibold text-foreground">OmegaBalance</span> är den tydligaste startpunkten.
                  <span className="mx-2 text-foreground/28">•</span>
                  <span className="font-semibold text-foreground">GutBalance</span> fungerar som ett kompletterande spår senare.
                </p>
              </div>
            </div>
            <div className="rounded-[2rem] border border-[rgba(70,99,80,0.08)] bg-white/82 p-6 shadow-[0_18px_40px_rgba(31,41,55,0.06)]">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-primary">Vad nästa steg innehåller</p>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div className="rounded-[1.3rem] bg-[rgba(247,243,235,0.92)] px-5 py-4">
                  <p className="text-sm font-semibold text-foreground">Test</p>
                  <p className="mt-2 text-sm leading-7 text-foreground/68">Ett konkret utgångsvärde i stället för gissning.</p>
                </div>
                <div className="rounded-[1.3rem] bg-[rgba(247,243,235,0.92)] px-5 py-4">
                  <p className="text-sm font-semibold text-foreground">Rapport</p>
                  <p className="mt-2 text-sm leading-7 text-foreground/68">Tydligare sammanhang kring det du faktiskt mäter.</p>
                </div>
                <div className="rounded-[1.3rem] bg-[rgba(247,243,235,0.92)] px-5 py-4">
                  <p className="text-sm font-semibold text-foreground">Vägledning</p>
                  <p className="mt-2 text-sm leading-7 text-foreground/68">En lugnare väg vidare när du vet mer om nuläget.</p>
                </div>
                <div className="rounded-[1.3rem] bg-[rgba(247,243,235,0.92)] px-5 py-4">
                  <p className="text-sm font-semibold text-foreground">Uppföljning</p>
                  <p className="mt-2 text-sm leading-7 text-foreground/68">Möjlighet att följa förändring i siffror över tid.</p>
                </div>
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
