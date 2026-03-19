import InfoPageLayout from "@/components/InfoPageLayout";

const ContactPage = () => {
  return (
    <InfoPageLayout
      title="Kontakt"
      intro="Har du frågor eller vill komma i kontakt med oss? Vi hjälper dig gärna vidare."
    >
      <section className="rounded-[1.75rem] border border-border/80 bg-card p-7 shadow-card md:p-8">
        <h2 className="text-2xl font-semibold tracking-tight">Kontaktuppgifter</h2>
        <p className="mt-4 text-base leading-8 text-subtle">
          E-post:{" "}
          <a href="mailto:hello@insidebalance.com" className="font-medium text-foreground underline underline-offset-4">
            hello@insidebalance.com
          </a>
        </p>
      </section>

      <section className="rounded-[1.75rem] border border-border/80 bg-card p-7 shadow-card md:p-8">
        <h2 className="text-2xl font-semibold tracking-tight">Svarstid</h2>
        <p className="mt-4 text-base leading-8 text-subtle">
          Vi återkommer normalt inom 24–48 timmar.
        </p>
      </section>
    </InfoPageLayout>
  );
};

export default ContactPage;
