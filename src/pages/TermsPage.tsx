import InfoPageLayout from "@/components/InfoPageLayout";

const sections = [
  {
    title: "Allmänt",
    body: "Genom att använda webbplatsen godkänner du dessa villkor. Vi förbehåller oss rätten att uppdatera innehållet vid behov.",
  },
  {
    title: "Tjänstebeskrivning",
    body: "Vi erbjuder information och tjänster kopplade till analys av fettsyrebalans och relaterade produkter. Resultat och rekommendationer baseras på tillgänglig data och ska ses som vägledning.",
  },
  {
    title: "Ansvarsbegränsning",
    body: "Informationen på denna webbplats ersätter inte medicinsk rådgivning, diagnos eller behandling. Vid medicinska frågor bör du alltid kontakta vården.",
  },
  {
    title: "Beställning och betalning",
    body: "Vid beställning av test eller tjänst gäller de villkor som anges i samband med köpet. Priser och innehåll kan ändras utan föregående meddelande.",
  },
  {
    title: "Kontakt",
    body: "För frågor kring villkor eller våra tjänster, kontakta oss på: hello@insidebalance.com",
  },
];

const TermsPage = () => {
  return (
    <InfoPageLayout
      title="Villkor"
      intro="Dessa villkor gäller för användning av denna webbplats samt för beställning av våra tjänster."
    >
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
