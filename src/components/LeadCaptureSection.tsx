import { motion } from "framer-motion";
import { useState } from "react";
import { useLocation } from "react-router-dom";
import { upsertLead, trackClickAndGetRedirect } from "@/lib/api";
import { Lang, t } from "@/lib/i18n";
import { getActiveReferralCode, getOrCreateSessionId } from "@/lib/referral";

interface LeadCaptureSectionProps {
  lang: Lang;
}

const LeadCaptureSection = ({ lang }: LeadCaptureSectionProps) => {
  const copy = t(lang).lead;
  const location = useLocation();
  const [formData, setFormData] = useState({ name: "", email: "", phone: "" });
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (submitting) {
      return;
    }

    const referralCode = getActiveReferralCode(location.pathname, location.search);
    if (!referralCode) {
      setErrorMessage(
        lang === "sv"
          ? "Bokningen kan bara fortsätta via en giltig referral-länk."
          : "The booking can only continue from a valid referral link.",
      );
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);

    try {
      const sessionId = getOrCreateSessionId();
      const leadResponse = await upsertLead({
        full_name: formData.name,
        email: formData.email,
        phone: formData.phone,
        ref: referralCode,
        session_id: sessionId,
        lead_type: "customer",
        lead_source: "customer_form",
        source_page: location.pathname,
        details: {
          intent: "consultation",
          landingPage: location.pathname,
        },
      });

      if (!leadResponse.ok) {
        throw new Error("Kunde inte skicka formuläret just nu.");
      }

      const response = await trackClickAndGetRedirect({
        ref: referralCode,
        type: "consultation",
        session_id: sessionId,
      });

      if (!response.ok) {
        throw new Error(response.error.message);
      }

      window.location.assign(response.destination_url);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Kunde inte skicka formuläret just nu.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="lead-capture" className="section-padding bg-section-alt">
      <div className="container-narrow">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-xl"
        >
          <div className="mb-10 text-center">
            <h2 className="mb-4 text-3xl font-semibold tracking-tight md:text-4xl">{copy.title}</h2>
            <p className="text-lg text-subtle">{copy.body}</p>
          </div>

          <form className="space-y-5 rounded-2xl bg-card p-8 text-left shadow-elevated md:p-10" onSubmit={(event) => void handleSubmit(event)}>
            <div>
              <label htmlFor="name" className="mb-2 block text-sm font-medium">
                {copy.nameLabel}
              </label>
              <input
                id="name"
                type="text"
                required
                value={formData.name}
                onChange={(event) => setFormData({ ...formData, name: event.target.value })}
                className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder={copy.namePlaceholder}
              />
            </div>
            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-medium">
                {copy.emailLabel}
              </label>
              <input
                id="email"
                type="email"
                required
                value={formData.email}
                onChange={(event) => setFormData({ ...formData, email: event.target.value })}
                className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder={copy.emailPlaceholder}
              />
            </div>
            <div>
              <label htmlFor="phone" className="mb-2 block text-sm font-medium">
                {copy.phoneLabel}
              </label>
              <input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(event) => setFormData({ ...formData, phone: event.target.value })}
                className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder={copy.phonePlaceholder}
              />
            </div>
            <button type="submit" disabled={submitting} className="btn-primary w-full text-center disabled:opacity-70">
              {submitting ? "Skickar..." : copy.consultationCta}
            </button>
            {errorMessage ? <p className="text-sm text-destructive">{errorMessage}</p> : null}
          </form>
        </motion.div>
      </div>
    </section>
  );
};

export default LeadCaptureSection;
