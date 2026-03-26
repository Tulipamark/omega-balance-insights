import InfoPageLayout from "@/components/InfoPageLayout";
import { portalTermsSections } from "@/content/portal-legal-content";
import { defaultLang, isSupportedLang, Lang } from "@/lib/i18n";
import { useParams } from "react-router-dom";

const termsCopyByLang: Record<Lang, { title: string; intro: string; backLabel: string; notice?: string }> = {
  sv: {
    title: "Villkor",
    intro: "Dessa villkor gäller för användning av OmegaBalance-portalen och dess interna arbetsflöden.",
    backLabel: "Till startsidan",
  },
  no: {
    title: "Vilkår",
    intro: "Disse vilkårene gjelder for bruk av OmegaBalance-portalen og våre interne arbeidsflyter.",
    backLabel: "Til startsiden",
    notice: "Fullstendig vilkårstekst er foreløpig tilgjengelig på svensk.",
  },
  da: {
    title: "Vilkår",
    intro: "Disse vilkår gælder for brug af OmegaBalance-portalen og vores interne arbejdsgange.",
    backLabel: "Til forsiden",
    notice: "Den fulde vilkårstekst er foreløbig kun tilgængelig på svensk.",
  },
  fi: {
    title: "Ehdot",
    intro: "Nämä ehdot koskevat OmegaBalance-portaalin ja sisäisten työnkulkujemme käyttöä.",
    backLabel: "Takaisin etusivulle",
    notice: "Täysi ehtoteksti on toistaiseksi saatavilla vain ruotsiksi.",
  },
  en: {
    title: "Terms",
    intro: "These terms apply to the use of the OmegaBalance portal and its internal workflows.",
    backLabel: "Back to home",
    notice: "The full terms text is currently available in Swedish only.",
  },
  de: {
    title: "Bedingungen",
    intro: "Diese Bedingungen gelten für die Nutzung des OmegaBalance-Portals und seiner internen Abläufe.",
    backLabel: "Zur Startseite",
    notice: "Der vollständige Bedingungstext ist derzeit nur auf Schwedisch verfügbar.",
  },
  fr: {
    title: "Conditions",
    intro: "Ces conditions s'appliquent à l'utilisation du portail OmegaBalance et de ses flux de travail internes.",
    backLabel: "Retour à l'accueil",
    notice: "Le texte complet des conditions est actuellement disponible uniquement en suédois.",
  },
  it: {
    title: "Condizioni",
    intro: "Queste condizioni si applicano all'uso del portale OmegaBalance e dei suoi flussi di lavoro interni.",
    backLabel: "Torna alla home",
    notice: "Il testo completo delle condizioni è attualmente disponibile solo in svedese.",
  },
};

const TermsPage = () => {
  const { lang } = useParams<{ lang?: string }>();
  const currentLang = (isSupportedLang(lang) ? lang : defaultLang) as Lang;
  const copy = termsCopyByLang[currentLang];

  return (
    <InfoPageLayout
      lang={currentLang}
      title={copy.title}
      intro={copy.intro}
      backLabel={copy.backLabel}
    >
      {copy.notice ? (
        <section className="rounded-[1.75rem] border border-border/80 bg-card p-7 shadow-card md:p-8">
          <p className="text-base leading-8 text-subtle">{copy.notice}</p>
        </section>
      ) : null}
      {portalTermsSections.map((section) => (
        <section key={section.title} className="rounded-[1.75rem] border border-border/80 bg-card p-7 shadow-card md:p-8">
          <h2 className="text-2xl font-semibold tracking-tight">{section.title}</h2>
          <p className="mt-4 text-base leading-8 text-subtle">{section.body}</p>
        </section>
      ))}
    </InfoPageLayout>
  );
};

export default TermsPage;
