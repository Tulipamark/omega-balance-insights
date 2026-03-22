import { type FormEvent, useState } from "react";
import InfoPageLayout from "@/components/InfoPageLayout";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { upsertLead } from "@/lib/api";

const ContactPage = () => {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const updateField = (field: keyof typeof formData, value: string) => {
    setFormData((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setErrorMessage(null);

    try {
      const response = await upsertLead({
        full_name: formData.name,
        email: formData.email,
        phone: formData.phone || null,
        lead_type: "customer",
        lead_source: "customer_form",
        source_page: "/kontakt",
        details: {
          intent: "contact",
          message: formData.message,
        },
      });

      if (!response.ok) {
        throw new Error("Could not send the contact request right now.");
      }

      setSubmitted(true);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Could not send the contact request right now.");
    } finally {
      setSubmitting(false);
    }
  };

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
          Vi återkommer normalt inom 24-48 timmar.
        </p>
      </section>

      <section className="rounded-[1.75rem] border border-border/80 bg-card p-7 shadow-card md:p-8">
        <h2 className="text-2xl font-semibold tracking-tight">Kontakta oss</h2>
        {submitted ? (
          <p className="mt-4 text-base leading-8 text-subtle">
            Tack, ditt meddelande är skickat. Vi återkommer så snart vi kan.
          </p>
        ) : (
          <form className="mt-6 space-y-5" onSubmit={(event) => void handleSubmit(event)}>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-foreground">Namn</span>
              <Input required value={formData.name} onChange={(event) => updateField("name", event.target.value)} className="h-12 rounded-xl" />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-foreground">E-post</span>
              <Input required type="email" value={formData.email} onChange={(event) => updateField("email", event.target.value)} className="h-12 rounded-xl" />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-foreground">Telefonnummer</span>
              <Input value={formData.phone} onChange={(event) => updateField("phone", event.target.value)} className="h-12 rounded-xl" />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-foreground">Meddelande</span>
              <Textarea required value={formData.message} onChange={(event) => updateField("message", event.target.value)} className="min-h-[144px] rounded-xl" />
            </label>
            <button type="submit" disabled={submitting} className="btn-primary min-w-[220px] text-center disabled:opacity-70">
              {submitting ? "Skickar..." : "Skicka meddelande"}
            </button>
            {errorMessage ? <p className="text-sm text-destructive">{errorMessage}</p> : null}
          </form>
        )}
      </section>
    </InfoPageLayout>
  );
};

export default ContactPage;
