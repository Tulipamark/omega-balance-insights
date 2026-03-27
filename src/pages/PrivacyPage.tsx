import { useParams } from "react-router-dom";
import InfoPageLayout from "@/components/InfoPageLayout";
import { getPortalPrivacySections } from "@/content/portal-legal-content";
import { defaultLang, isSupportedLang, Lang } from "@/lib/i18n";

const privacyCopyByLang: Record<Lang, { title: string; intro: string; backLabel: string }> = {
  sv: {
    title: "Integritetspolicy",
    intro: "Här beskriver vi hur vi hanterar personuppgifter på webbplatsen och i Omega Balance-portalen med hänsyn till GDPR och lokala kompletterande regler.",
    backLabel: "Till startsidan",
  },
  no: {
    title: "Personvern",
    intro: "Her beskriver vi hvordan vi håndterer personopplysninger på nettstedet og i Omega Balance-portalen med hensyn til GDPR og lokale tilleggsregler.",
    backLabel: "Til startsiden",
  },
  da: {
    title: "Privatlivspolitik",
    intro: "Her beskriver vi, hvordan vi håndterer personoplysninger på websitet og i Omega Balance-portalen med hensyn til GDPR og lokale tillægsregler.",
    backLabel: "Til forsiden",
  },
  fi: {
    title: "Tietosuojakäytäntö",
    intro: "Tällä sivulla kerromme, miten käsittelemme henkilötietoja sivustolla ja Omega Balance -portaalissa GDPR:n ja paikallisten lisäsääntöjen mukaisesti.",
    backLabel: "Takaisin etusivulle",
  },
  en: {
    title: "Privacy policy",
    intro: "This page explains how we handle personal data on the website and in the Omega Balance portal, taking the GDPR and local supplementary rules into account.",
    backLabel: "Back to home",
  },
  de: {
    title: "Datenschutz",
    intro: "Diese Seite beschreibt, wie wir personenbezogene Daten auf der Website und im Omega Balance-Portal unter Berücksichtigung der DSGVO und lokaler Ergänzungsregeln verarbeiten.",
    backLabel: "Zur Startseite",
  },
  fr: {
    title: "Politique de confidentialité",
    intro: "Cette page explique comment nous traitons les données personnelles sur le site et dans le portail Omega Balance, en tenant compte du RGPD et des règles locales complémentaires.",
    backLabel: "Retour à l'accueil",
  },
  it: {
    title: "Informativa sulla privacy",
    intro: "Questa pagina spiega come trattiamo i dati personali sul sito e nel portale Omega Balance, tenendo conto del GDPR e delle regole locali integrative.",
    backLabel: "Torna alla home",
  },
};

const PrivacyPage = () => {
  const { lang } = useParams<{ lang?: string }>();
  const currentLang = (isSupportedLang(lang) ? lang : defaultLang) as Lang;
  const copy = privacyCopyByLang[currentLang];
  const sections = getPortalPrivacySections(currentLang);

  return (
    <InfoPageLayout lang={currentLang} title={copy.title} intro={copy.intro} backLabel={copy.backLabel}>
      {sections.map((section) => (
        <section key={section.title} className="rounded-[1.75rem] border border-border/80 bg-card p-7 shadow-card md:p-8">
          <h2 className="text-2xl font-semibold tracking-tight">{section.title}</h2>
          <p className="mt-4 text-base leading-8 text-subtle">{section.body}</p>
        </section>
      ))}
    </InfoPageLayout>
  );
};

export default PrivacyPage;
