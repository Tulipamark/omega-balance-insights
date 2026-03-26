import InfoPageLayout from "@/components/InfoPageLayout";
import { portalPrivacySections } from "@/content/portal-legal-content";
import { defaultLang, isSupportedLang, Lang } from "@/lib/i18n";
import { useParams } from "react-router-dom";

const privacyCopyByLang: Record<Lang, { title: string; intro: string; backLabel: string; notice?: string }> = {
  sv: {
    title: "Integritetspolicy",
    intro: "Vi värnar om din personliga integritet. Den här policyn beskriver hur vi hanterar personuppgifter i OmegaBalance-portalen.",
    backLabel: "Till startsidan",
  },
  no: {
    title: "Personvern",
    intro: "Vi tar personvernet ditt på alvor. Denne teksten beskriver hvordan vi håndterer personopplysninger i OmegaBalance-portalen.",
    backLabel: "Til startsiden",
    notice: "Fullstendig personverntekst er foreløpig tilgjengelig på svensk.",
  },
  da: {
    title: "Privatlivspolitik",
    intro: "Vi tager dit privatliv alvorligt. Denne tekst beskriver, hvordan vi håndterer personoplysninger i OmegaBalance-portalen.",
    backLabel: "Til forsiden",
    notice: "Den fulde privatlivstekst er foreløbig kun tilgængelig på svensk.",
  },
  fi: {
    title: "Tietosuojakäytäntö",
    intro: "Pidämme yksityisyyttäsi tärkeänä. Tämä teksti kuvaa, miten käsittelemme henkilötietoja OmegaBalance-portaalissa.",
    backLabel: "Takaisin etusivulle",
    notice: "Täysi tietosuojateksti on toistaiseksi saatavilla vain ruotsiksi.",
  },
  en: {
    title: "Privacy policy",
    intro: "We take your privacy seriously. This page describes how we handle personal data in the OmegaBalance portal.",
    backLabel: "Back to home",
    notice: "The full privacy text is currently available in Swedish only.",
  },
  de: {
    title: "Datenschutz",
    intro: "Wir nehmen deine Privatsphäre ernst. Diese Seite beschreibt, wie wir personenbezogene Daten im OmegaBalance-Portal verarbeiten.",
    backLabel: "Zur Startseite",
    notice: "Der vollständige Datenschutztext ist derzeit nur auf Schwedisch verfügbar.",
  },
  fr: {
    title: "Politique de confidentialité",
    intro: "Nous prenons votre vie privée au sérieux. Cette page décrit comment nous traitons les données personnelles dans le portail OmegaBalance.",
    backLabel: "Retour à l'accueil",
    notice: "Le texte complet de confidentialité est actuellement disponible uniquement en suédois.",
  },
  it: {
    title: "Informativa sulla privacy",
    intro: "Prendiamo sul serio la tua privacy. Questa pagina descrive come trattiamo i dati personali nel portale OmegaBalance.",
    backLabel: "Torna alla home",
    notice: "Il testo completo sulla privacy è attualmente disponibile solo in svedese.",
  },
};

const PrivacyPage = () => {
  const { lang } = useParams<{ lang?: string }>();
  const currentLang = (isSupportedLang(lang) ? lang : defaultLang) as Lang;
  const copy = privacyCopyByLang[currentLang];

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
      {portalPrivacySections.map((section) => (
        <section key={section.title} className="rounded-[1.75rem] border border-border/80 bg-card p-7 shadow-card md:p-8">
          <h2 className="text-2xl font-semibold tracking-tight">{section.title}</h2>
          <p className="mt-4 text-base leading-8 text-subtle">{section.body}</p>
        </section>
      ))}
    </InfoPageLayout>
  );
};

export default PrivacyPage;
