import InfoPageLayout from "@/components/InfoPageLayout";
import { portalTermsSections } from "@/content/portal-legal-content";

const TermsPage = () => {
  return (
    <InfoPageLayout
      title="Villkor"
      intro="Dessa villkor gäller för användning av OmegaBalance-portalen och dess interna arbetsflöden."
    >
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
