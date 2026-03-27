import { useParams } from "react-router-dom";
import InfoPageLayout from "@/components/InfoPageLayout";
import { getPortalTermsSections } from "@/content/portal-legal-content";
import { defaultLang, isSupportedLang, Lang } from "@/lib/i18n";

const termsCopyByLang: Record<Lang, { title: string; intro: string; backLabel: string }> = {
  sv: {
    title: "Villkor",
    intro: "Dessa villkor gäller för webbplatsen, formulärflödena och Omega Balance-portalen tillsammans med tvingande lokala regler.",
    backLabel: "Till startsidan",
  },
  no: {
    title: "Vilkår",
    intro: "Disse vilkårene gjelder for nettstedet, skjemaflytene og Omega Balance-portalen sammen med ufravikelige lokale regler.",
    backLabel: "Til startsiden",
  },
  da: {
    title: "Vilkår",
    intro: "Disse vilkår gælder for websitet, formularflows og Omega Balance-portalen sammen med ufravigelige lokale regler.",
    backLabel: "Til forsiden",
  },
  fi: {
    title: "Ehdot",
    intro: "Nämä ehdot koskevat sivustoa, lomakepolkuja ja Omega Balance -portaalia yhdessä pakottavien paikallisten sääntöjen kanssa.",
    backLabel: "Takaisin etusivulle",
  },
  en: {
    title: "Terms",
    intro: "These terms apply to the website, form journeys, and the Omega Balance portal together with any mandatory local rules.",
    backLabel: "Back to home",
  },
  de: {
    title: "Bedingungen",
    intro: "Diese Bedingungen gelten für die Website, die Formularstrecken und das Omega Balance-Portal zusammen mit zwingenden lokalen Regeln.",
    backLabel: "Zur Startseite",
  },
  fr: {
    title: "Conditions",
    intro: "Ces conditions s'appliquent au site, aux parcours de formulaire et au portail Omega Balance avec les règles locales impératives applicables.",
    backLabel: "Retour à l'accueil",
  },
  it: {
    title: "Condizioni",
    intro: "Queste condizioni si applicano al sito, ai flussi dei moduli e al portale Omega Balance insieme alle norme locali imperative applicabili.",
    backLabel: "Torna alla home",
  },
};

const TermsPage = () => {
  const { lang } = useParams<{ lang?: string }>();
  const currentLang = (isSupportedLang(lang) ? lang : defaultLang) as Lang;
  const copy = termsCopyByLang[currentLang];
  const sections = getPortalTermsSections(currentLang);

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

export default TermsPage;
