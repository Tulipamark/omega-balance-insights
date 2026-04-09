import { CheckCircle2 } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import gutBalanceHeroImage from "@/assets/gutbalance-hero.png";
import FooterSection from "@/components/FooterSection";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import TrackedOutboundButton from "@/components/TrackedOutboundButton";
import { Lang, defaultLang, isSupportedLang } from "@/lib/i18n";
import { getZinzinoGutTestUrl } from "@/lib/zinzino";

type GutBalancePageProps = {
  lang?: Lang;
};

type PlaceholderCopy = {
  eyebrow: string;
  title: string;
  body: string;
  primary: string;
  secondary: string;
};

const placeholderByLang: Record<Lang, PlaceholderCopy> = {
  sv: {
    eyebrow: "GutBalance",
    title: "GutBalance är nästa testområde",
    body: "Vi bygger nu GutBalance som nästa tydliga testområde inom InsideBalance. Den svenska produktsidan är först ut och följs av fler språk senare.",
    primary: "Beställ GutBalance",
    secondary: "InsideBalance",
  },
  no: {
    eyebrow: "GutBalance",
    title: "GutBalance er neste testområde",
    body: "Vi bygger nå GutBalance som neste tydelige testområde i InsideBalance. Flere språk følger senere.",
    primary: "GutBalance",
    secondary: "InsideBalance",
  },
  da: {
    eyebrow: "GutBalance",
    title: "GutBalance er næste testområde",
    body: "Vi bygger nu GutBalance som næste tydelige testområde i InsideBalance. Flere sprog følger senere.",
    primary: "GutBalance",
    secondary: "InsideBalance",
  },
  fi: {
    eyebrow: "GutBalance",
    title: "GutBalance on seuraava testialue",
    body: "Rakennamme nyt GutBalancea seuraavaksi selkeäksi testialueeksi InsideBalanceen. Lisää kieliä tulee myöhemmin.",
    primary: "GutBalance",
    secondary: "InsideBalance",
  },
  en: {
    eyebrow: "GutBalance",
    title: "GutBalance is the next test area",
    body: "We are now building GutBalance as the next clear test area within InsideBalance. More languages will follow later.",
    primary: "GutBalance",
    secondary: "InsideBalance",
  },
  de: {
    eyebrow: "GutBalance",
    title: "GutBalance ist der nächste Testbereich",
    body: "Wir bauen GutBalance jetzt als nächsten klaren Testbereich innerhalb von InsideBalance auf. Weitere Sprachen folgen später.",
    primary: "GutBalance",
    secondary: "InsideBalance",
  },
  fr: {
    eyebrow: "GutBalance",
    title: "GutBalance est le prochain domaine de test",
    body: "Nous construisons maintenant GutBalance comme prochain domaine de test clair au sein de InsideBalance. D'autres langues suivront plus tard.",
    primary: "GutBalance",
    secondary: "InsideBalance",
  },
  it: {
    eyebrow: "GutBalance",
    title: "GutBalance è la prossima area di test",
    body: "Stiamo costruendo GutBalance come prossima area di test chiara all'interno di InsideBalance. Altre lingue seguiranno più avanti.",
    primary: "GutBalance",
    secondary: "InsideBalance",
  },
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
};

const gutFooterTaglineByLang: Record<Lang, string> = {
  sv: "Forskningsbaserad analys av tarmhälsa",
  no: "Forskningsbasert analyse av tarmhelse",
  da: "Forskningsbaseret analyse af tarmhelbred",
  fi: "Tutkimukseen perustuva suoliston terveyden analyysi",
  en: "Research-based gut health analysis",
  de: "Forschungsbasierte Analyse der Darmgesundheit",
  fr: "Analyse de la santé intestinale fondée sur la recherche",
  it: "Analisi della salute intestinale basata sulla ricerca",
};

const swedishGutSections = {
  hero: {
    eyebrow: "GutBalance",
    title: "Få en tydligare bild av din tarmhälsa",
    body:
      "GutBalance hjälper dig att förstå hur tarm, immunförsvar och metabolism hänger ihop. Testet fokuserar på funktion och ger dig en enklare väg till konkreta insikter.",
    primary: "Beställ GutBalance",
    secondary: "InsideBalance",
  },
  why: {
    title: "Tarmen påverkar mer än magen",
    body:
      "Din tarmmikrobiota är kopplad till långt mer än matsmältning. Den påverkar också immunförsvar, ämnesomsättning och kroppens förmåga att hitta balans.",
  },
  markers: {
    title: "Tre markörer som ger riktning",
    items: [
      {
        title: "Indol-3-propionsyra (IPA)",
        body: "En skyddande metabolit som bildas av tarmbakterier och som kopplas till tarmbarriär och motståndskraft.",
      },
      {
        title: "Tryptofan (TRP)",
        body: "En essentiell aminosyra från kosten som fungerar som utgångspunkt för flera viktiga processer i kroppen.",
      },
      {
        title: "Kynurenin (KYN)",
        body: "En metabolit kopplad till immunaktivering och kroppens stressrespons som hjälper till att visa hur tryptofan omsätts.",
      },
    ],
  },
  benefits: {
    title: "Mer än bara siffror",
    items: [
      "Ett tydligt tarmhälsoindex som sammanfattar balansen i dina resultat.",
      "Insikter om balansen mellan skyddande och belastande signalvägar.",
      "Personliga kost- och livsstilsrekommendationer utifrån dina resultat.",
      "Ett hemmatest på torrt blod, utan avföringsprov.",
    ],
  },
  support: {
    eyebrow: "Hemmatest",
    title: "Enklare än du tror",
    body:
      "GutBalance görs hemma med ett litet blodprov. Du får sedan en tydlig rapport med insikter om tarm, immunförsvar och metabolism.",
    detail:
      "Det ger dig en lugnare start och en tydligare bild av vad som är relevant för dig.",
  },
  metabolism: {
    title: "Därför är tryptofanmetabolism viktigt",
    body:
      "Testet fokuserar på hur kroppen och tarmbakterierna tillsammans omsätter tryptofan. Det ger en tydligare bild av hur tarmen fungerar i relation till immunförsvar och metabolism.",
  },
  process: {
    title: "Enkelt test hemma",
    steps: [
      {
        title: "Ta provet på morgonen",
        body: "För bästa noggrannhet tas provet fastande på morgonen, efter minst tio timmars nattfasta.",
      },
      {
        title: "Droppa blod på kortet",
        body: "Provtagningen görs med ett enkelt stick i fingret och samlas upp på provkortet hemma.",
      },
      {
        title: "Skicka in provet",
        body: "När kortet har torkat skickar du det vidare till laboratoriet i det medföljande kuvertet.",
      },
      {
        title: "Se ditt resultat online",
        body: "Du registrerar provkoden och får senare tillgång till ditt resultat och din rapport digitalt.",
      },
    ],
  },
  closing: {
    title: "Redo att beställa testet?",
    body:
      "Beställ GutBalance och få en rapport som hjälper dig att förstå balansen mellan tarm, immunförsvar och metabolism.",
    primary: "Beställ GutBalance",
  },
};

function resolveLang(param?: string): Lang {
  return (isSupportedLang(param) ? param : defaultLang) as Lang;
}

const platformHomePath = (lang: Lang) => (lang === "sv" ? "/" : `/${lang}`);

const GutBalancePage = ({ lang: explicitLang }: GutBalancePageProps) => {
  const { lang } = useParams<{ lang: string }>();
  const currentLang = explicitLang ?? resolveLang(lang);
  const placeholder = placeholderByLang[currentLang];
  const isSwedish = currentLang === "sv";

  if (!isSwedish) {
    return (
      <main className="min-h-screen bg-[#f7f4ec] px-4 py-8 md:px-6 md:py-12">
        <div className="container-wide mx-auto">
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <Link to={platformHomePath(currentLang)} className="font-serif text-xl font-semibold tracking-tight text-foreground">
              InsideBalance
            </Link>
            <LanguageSwitcher lang={currentLang} />
          </div>

          <section className="mx-auto max-w-4xl rounded-[2rem] border border-border/70 bg-white/90 px-6 py-10 shadow-elevated md:px-10 md:py-14">
            <span className="inline-flex rounded-full border border-border/70 bg-accent px-4 py-1.5 text-sm font-medium tracking-wide text-accent-foreground">
              {placeholder.eyebrow}
            </span>
            <h1 className="mt-5 font-serif text-4xl font-semibold tracking-tight text-foreground md:text-6xl">{placeholder.title}</h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-foreground/72">{placeholder.body}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <TrackedOutboundButton
                lang={currentLang}
                destinationType="test"
                fallbackHref={getZinzinoGutTestUrl(currentLang)}
                className="btn-primary min-h-12 text-center"
                pendingLabel={pendingLabelByLang[currentLang]}
                errorMessages={{ generic: genericErrorByLang[currentLang] }}
              >
                {placeholder.primary}
              </TrackedOutboundButton>
              <Link to={platformHomePath(currentLang)} className="inline-flex items-center justify-center rounded-full border border-border bg-card px-6 py-3.5 text-base font-medium text-foreground shadow-card">
                {placeholder.secondary}
              </Link>
            </div>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f4ec] text-foreground">
      <section className="bg-[linear-gradient(180deg,rgba(247,244,236,1),rgba(238,233,223,1))] px-4 pb-12 pt-8 md:px-6 md:pb-16 md:pt-10">
        <div className="container-wide mx-auto">
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <Link to={platformHomePath(currentLang)} className="font-serif text-xl font-semibold tracking-tight text-foreground">
              InsideBalance
            </Link>
            <LanguageSwitcher lang={currentLang} />
          </div>

          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <div className="max-w-3xl">
              <span className="inline-flex rounded-full border border-black/5 bg-white/80 px-4 py-1.5 text-sm font-medium tracking-wide text-foreground/75">
                {swedishGutSections.hero.eyebrow}
              </span>
              <h1 className="mt-5 max-w-4xl font-serif text-4xl font-semibold leading-[1.02] tracking-tight sm:text-5xl md:text-6xl">
                {swedishGutSections.hero.title}
              </h1>
              <p className="mt-6 max-w-2xl text-[1.0625rem] leading-8 text-foreground/70 md:text-lg">
                {swedishGutSections.hero.body}
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <TrackedOutboundButton
                  lang={currentLang}
                  destinationType="test"
                  fallbackHref={getZinzinoGutTestUrl(currentLang)}
                  className="btn-primary min-h-12 text-center"
                  pendingLabel={pendingLabelByLang[currentLang]}
                  errorMessages={{ generic: genericErrorByLang[currentLang] }}
                  confirmTitle="Du går nu vidare till Zinzino"
                  confirmDescription="Nästa steg sker hos Zinzino, där beställning och leverans hanteras."
                  confirmConfirmLabel="OK, gå vidare"
                  confirmCancelLabel="Stanna kvar"
                >
                  {swedishGutSections.hero.primary}
                </TrackedOutboundButton>
                <Link
                  to={platformHomePath(currentLang)}
                  className="inline-flex items-center justify-center rounded-full border border-black/5 bg-white/82 px-6 py-3.5 text-base font-medium text-foreground shadow-[0_12px_30px_rgba(31,41,55,0.05)] transition hover:bg-white"
                >
                  {swedishGutSections.hero.secondary}
                </Link>
              </div>
            </div>

              <div className="grid gap-5 md:grid-cols-2 md:items-stretch">
                <div className="overflow-hidden rounded-[2rem] border border-black/5 bg-white/88 shadow-[0_20px_50px_rgba(31,41,55,0.06)]">
                  <div className="h-[280px] md:h-full md:min-h-[320px]">
                    <img
                      src={gutBalanceHeroImage}
                      alt="Person som sitter hemma och läser sina hälsoresultat i lugn miljö"
                      className="h-full w-full object-cover object-[center_22%]"
                    />
                  </div>
                </div>
                <div className="flex h-full items-center rounded-[1.75rem] border border-black/5 bg-white/86 p-6 shadow-[0_18px_40px_rgba(31,41,55,0.06)]">
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{swedishGutSections.support.eyebrow}</p>
                    <h2 className="mt-3 font-serif text-[1.7rem] font-semibold tracking-tight text-foreground md:text-[1.95rem]">
                      {swedishGutSections.support.title}
                    </h2>
                    <p className="mt-4 text-[1rem] leading-7 text-foreground/70">
                      {swedishGutSections.support.body}
                    </p>
                    <p className="mt-4 text-[0.98rem] leading-7 text-foreground/70">
                      {swedishGutSections.support.detail}
                    </p>
                  </div>
                </div>
              </div>
            </div>
        </div>
      </section>

      <section className="px-4 py-14 md:px-6 md:py-18">
        <div className="container-wide mx-auto grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-[2rem] border border-[#ddd5c7] bg-[#eee7da] p-9 shadow-[0_18px_40px_rgba(31,41,55,0.05)]">
            <h2 className="font-serif text-[2rem] font-semibold tracking-tight md:text-[2.35rem]">
              {swedishGutSections.why.title}
            </h2>
            <p className="mt-5 text-[1.02rem] leading-8 text-foreground/70">
              {swedishGutSections.why.body}
            </p>
          </div>

          <div className="rounded-[2rem] border border-black/5 bg-white/88 p-8 shadow-[0_20px_50px_rgba(31,41,55,0.06)]">
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Vad testet visar</p>
            <h2 className="mt-3 font-serif text-[2rem] font-semibold tracking-tight md:text-[2.3rem]">
              {swedishGutSections.metabolism.title}
            </h2>
            <p className="mt-4 text-[1.02rem] leading-8 text-foreground/70">
              {swedishGutSections.metabolism.body}
            </p>
          </div>
        </div>
      </section>

      <section className="px-4 py-14 md:px-6 md:py-18">
        <div className="container-wide mx-auto">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="font-serif text-[2rem] font-semibold tracking-tight md:text-[2.4rem]">
              {swedishGutSections.markers.title}
            </h2>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {swedishGutSections.markers.items.map((item) => (
              <article key={item.title} className="rounded-[1.75rem] border border-black/5 bg-white/88 p-7 shadow-[0_18px_40px_rgba(31,41,55,0.05)]">
                <h3 className="font-serif text-[1.55rem] font-semibold tracking-tight text-foreground">{item.title}</h3>
                <p className="mt-4 text-[1.01rem] leading-7 text-foreground/68">{item.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-14 md:px-6 md:py-18">
        <div className="container-wide mx-auto rounded-[2rem] border border-black/5 bg-[#ece6da] p-8 md:p-10 shadow-[0_18px_40px_rgba(31,41,55,0.05)]">
          <div className="grid gap-6 md:grid-cols-2">
            {swedishGutSections.benefits.items.map((item) => (
              <div key={item} className="flex items-start gap-3 rounded-2xl border border-black/5 bg-white/78 px-5 py-4">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <p className="text-[1.01rem] leading-7 text-foreground/78">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-14 md:px-6 md:py-18">
        <div className="container-wide mx-auto">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="font-serif text-[2rem] font-semibold tracking-tight md:text-[2.4rem]">
              {swedishGutSections.process.title}
            </h2>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {swedishGutSections.process.steps.map((step, index) => (
              <article key={step.title} className="rounded-[1.75rem] border border-black/5 bg-white/88 p-7 shadow-[0_18px_40px_rgba(31,41,55,0.05)]">
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{index + 1}</p>
                <h3 className="mt-3 text-[1.35rem] font-semibold tracking-tight text-foreground">{step.title}</h3>
                <p className="mt-4 text-[1.01rem] leading-7 text-foreground/68">{step.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-12 md:px-6 md:py-14">
        <div className="container-wide mx-auto rounded-[2rem] border border-black/5 bg-white/90 px-6 py-8 text-center shadow-[0_20px_50px_rgba(31,41,55,0.06)] md:px-10 md:py-10">
          <h2 className="font-serif text-[2rem] font-semibold tracking-tight md:text-[2.35rem]">
            {swedishGutSections.closing.title}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-[1.02rem] leading-8 text-foreground/70">
            {swedishGutSections.closing.body}
          </p>
          <div className="mx-auto mt-6 max-w-sm">
            <TrackedOutboundButton
              lang={currentLang}
              destinationType="test"
              fallbackHref={getZinzinoGutTestUrl(currentLang)}
              className="btn-primary min-h-12 w-full text-center"
              pendingLabel={pendingLabelByLang[currentLang]}
              errorMessages={{ generic: genericErrorByLang[currentLang] }}
              confirmTitle="Du går nu vidare till Zinzino"
              confirmDescription="Nästa steg sker hos Zinzino, där beställning och leverans hanteras."
              confirmConfirmLabel="OK, gå vidare"
              confirmCancelLabel="Stanna kvar"
            >
              {swedishGutSections.closing.primary}
            </TrackedOutboundButton>
          </div>
        </div>
      </section>

      <FooterSection lang={currentLang} brandName="GutBalance" taglineOverride={gutFooterTaglineByLang[currentLang]} />
    </main>
  );
};

export default GutBalancePage;
