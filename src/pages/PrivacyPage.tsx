import InfoPageLayout from "@/components/InfoPageLayout";
import { portalPrivacySections } from "@/content/portal-legal-content";

const PrivacyPage = () => {
  return (
    <InfoPageLayout
      title="Integritetspolicy"
      intro="Vi värnar om din personliga integritet. Den här policyn beskriver hur vi hanterar personuppgifter i OmegaBalance-portalen."
    >
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
