import { motion } from "framer-motion";
import { useState } from "react";
import { useLocation } from "react-router-dom";
import { Lang, t } from "@/lib/i18n";
import { submitLead } from "@/lib/omega-data";
import { getReferralAttribution } from "@/lib/referral";

interface LeadCaptureSectionProps {
  lang: Lang;
}

const LeadCaptureSection = ({ lang }: LeadCaptureSectionProps) => {
  const copy = t(lang).lead;
  const location = useLocation();
  const [formData, setFormData] = useState({ name: "", email: "", phone: "" });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent, action: string) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMessage(null);

    try {
      const attribution = await getReferralAttribution(location.pathname);
      await submitLead({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        type: "customer_lead",
        sourcePage: location.pathname,
        referralCode: attribution.referralCode,
        referredByUserId: attribution.referredByUserId,
        details: {
          intent: action,
          landingPage: attribution.landingPage,
        },
      });
      setSubmitted(true);
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
          className="max-w-xl mx-auto"
        >
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight mb-4">{copy.title}</h2>
            <p className="text-subtle text-lg">{copy.body}</p>
          </div>

          {submitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-card rounded-2xl shadow-elevated p-10 text-center"
            >
              <div className="badge-accent w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl" aria-label={copy.successIconLabel}>✓</span>
              </div>
              <h3 className="font-sans text-xl font-semibold mb-2">{copy.successTitle}</h3>
              <p className="text-subtle">{copy.successBody}</p>
            </motion.div>
          ) : (
            <form className="bg-card rounded-2xl shadow-elevated p-8 md:p-10 space-y-5">
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-2">{copy.nameLabel}</label>
                <input
                  id="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                  placeholder={copy.namePlaceholder}
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-2">{copy.emailLabel}</label>
                <input
                  id="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                  placeholder={copy.emailPlaceholder}
                />
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium mb-2">{copy.phoneLabel}</label>
                <input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                  placeholder={copy.phonePlaceholder}
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-3 pt-3">
                <button
                  type="submit"
                  disabled={submitting}
                  onClick={(e) => void handleSubmit(e, "order")}
                  className="btn-primary flex-1 text-center disabled:opacity-70"
                >
                  {submitting ? "Skickar..." : copy.orderCta}
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  onClick={(e) => void handleSubmit(e, "consultation")}
                  className="btn-secondary flex-1 text-center disabled:opacity-70"
                >
                  {copy.consultationCta}
                </button>
              </div>
              {errorMessage ? <p className="text-sm text-destructive">{errorMessage}</p> : null}
            </form>
          )}
        </motion.div>
      </div>
    </section>
  );
};

export default LeadCaptureSection;
