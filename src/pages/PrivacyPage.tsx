import InfoPageLayout from "@/components/InfoPageLayout";

const sections = [
  {
    title: "Vilka uppgifter vi samlar in",
    body: "När du använder vår webbplats eller fyller i formulär kan vi samla in uppgifter som namn, e-postadress, telefonnummer samt information du själv väljer att dela med oss.",
  },
  {
    title: "Hur vi använder uppgifterna",
    body: "Vi använder dina uppgifter för att kontakta dig efter en förfrågan eller ansökan, ge dig information om våra tjänster samt förbättra vår webbplats och användarupplevelse. Vi delar inte dina uppgifter med tredje part i marknadsföringssyfte.",
  },
  {
    title: "Lagring av uppgifter",
    body: "Vi sparar dina uppgifter endast så länge det är nödvändigt för att uppfylla syftet med behandlingen eller enligt gällande lagkrav.",
  },
  {
    title: "Dina rättigheter",
    body: "Du har rätt att begära utdrag av vilka uppgifter vi har om dig, begära rättelse eller radering samt invända mot eller begränsa behandling. Kontakta oss om du vill utöva någon av dina rättigheter.",
  },
  {
    title: "Kontakt",
    body: "Har du frågor om hur vi hanterar personuppgifter är du välkommen att kontakta oss på: hello@insidebalance.com",
  },
];

const PrivacyPage = () => {
  return (
    <InfoPageLayout
      title="Integritetspolicy"
      intro="Vi värnar om din personliga integritet. Den här policyn beskriver hur vi samlar in, använder och skyddar dina personuppgifter."
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

export default PrivacyPage;
