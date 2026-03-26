import { motion } from "framer-motion";
import { useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { upsertLead, trackClickAndGetRedirect } from "@/lib/api";
import { logFunnelEvent } from "@/lib/funnel-events";
import { Lang, t } from "@/lib/i18n";
import { getActiveReferralCode, getLeadAttributionContext } from "@/lib/referral";

interface LeadCaptureSectionProps {
  lang: Lang;
}

const referralErrorByLang: Record<Lang, string> = {
  sv: "Bokningen kan bara fortsätta via en giltig referral-länk.",
  no: "Bookingen kan bare fortsette via en gyldig referral-lenke.",
  da: "Bookingen kan kun fortsætte via et gyldigt referral-link.",
  fi: "Varaus voi jatkua vain kelvollisen referral-linkin kautta.",
  en: "The booking can only continue from a valid referral link.",
  de: "Die Buchung kann nur über einen gültigen Referral-Link fortgesetzt werden.",
  fr: "La réservation ne peut se poursuivre qu'à partir d'un lien de recommandation valide.",
  it: "La prenotazione può continuare solo tramite un link referral valido.",
};

const submitErrorByLang: Record<Lang, string> = {
  sv: "Kunde inte skicka formuläret just nu.",
  no: "Kunne ikke sende skjemaet akkurat nå.",
  da: "Kunne ikke sende formularen lige nu.",
  fi: "Lomaketta ei voitu lähettää juuri nyt.",
  en: "The form could not be submitted right now.",
  de: "Das Formular konnte gerade nicht gesendet werden.",
  fr: "Le formulaire n'a pas pu être envoyé pour le moment.",
  it: "Il modulo non può essere inviato in questo momento.",
};

const submittingLabelByLang: Record<Lang, string> = {
  sv: "Skickar...",
  no: "Sender...",
  da: "Sender...",
  fi: "Lähetetään...",
  en: "Submitting...",
  de: "Wird gesendet...",
  fr: "Envoi...",
  it: "Invio...",
};

const LeadCaptureSection = ({ lang }: LeadCaptureSectionProps) => {
  const copy = t(lang).lead;
  const location = useLocation();
  const [formData, setFormData] = useState({ name: "", email: "", phone: "" });
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const hasTrackedFormStart = useRef(false);

  const trackFormStart = () => {
    if (hasTrackedFormStart.current) {
      return;
    }

    hasTrackedFormStart.current = true;
    void logFunnelEvent("lead_form_started", {
      pathname: location.pathname,
      search: location.search,
      details: {
        formType: "consultation",
      },
    });
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (submitting) {
      return;
    }

    const referralCode = getActiveReferralCode(location.pathname, location.search);
    if (!referralCode) {
      void logFunnelEvent("lead_form_submit_failed", {
        pathname: location.pathname,
        search: location.search,
        details: {
          formType: "consultation",
          reason: "missing_referral",
        },
      });
      setErrorMessage(referralErrorByLang[lang]);
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);

    try {
      const attribution = await getLeadAttributionContext(location.pathname, location.search);
      const sessionId = attribution.sessionId;
      void logFunnelEvent("lead_form_submitted", {
        pathname: location.pathname,
        search: location.search,
        referralCode,
        sessionId,
        details: {
          formType: "consultation",
        },
      });
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
          landingPage: attribution.landingPage,
          attribution: {
            sessionId: attribution.sessionId,
            referralCode: attribution.referralCode,
            referredByUserId: attribution.referredByUserId,
            landingPage: attribution.landingPage,
            firstTouch: attribution.firstTouch,
            lastTouch: attribution.lastTouch,
          },
        },
      });

      if (!leadResponse.ok) {
        throw new Error(submitErrorByLang[lang]);
      }

      void logFunnelEvent("consultation_redirect_requested", {
        pathname: location.pathname,
        search: location.search,
        referralCode,
        sessionId,
        details: {
          destinationType: "consultation",
        },
      });
      const response = await trackClickAndGetRedirect({
        ref: referralCode,
        type: "consultation",
        session_id: sessionId,
      });

      if (response.ok) {
        window.location.assign(response.destination_url);
      } else {
        const failRes = response as Extract<typeof response, { ok: false }>;
        throw new Error(failRes.error?.message || "Kunde inte boka konsultation.");
      }
    } catch (error) {
      void logFunnelEvent("lead_form_submit_failed", {
        pathname: location.pathname,
        search: location.search,
        referralCode,
        details: {
          formType: "consultation",
          reason: error instanceof Error ? error.message : "submit_failed",
        },
      });
      setErrorMessage(error instanceof Error ? error.message : submitErrorByLang[lang]);
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

          <form className="space-y-5 rounded-2xl bg-card p-6 text-left shadow-elevated md:p-10" onSubmit={(event) => void handleSubmit(event)}>
            <div>
              <label htmlFor="name" className="mb-2 block text-sm font-medium">
                {copy.nameLabel}
              </label>
              <input
                id="name"
                type="text"
                required
                value={formData.name}
                onChange={(event) => {
                  trackFormStart();
                  setFormData({ ...formData, name: event.target.value });
                }}
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
                onChange={(event) => {
                  trackFormStart();
                  setFormData({ ...formData, email: event.target.value });
                }}
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
                onChange={(event) => {
                  trackFormStart();
                  setFormData({ ...formData, phone: event.target.value });
                }}
                className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder={copy.phonePlaceholder}
              />
            </div>
            <button type="submit" disabled={submitting} className="btn-primary min-h-12 w-full text-center disabled:opacity-70">
              {submitting ? submittingLabelByLang[lang] : copy.consultationCta}
            </button>
            {errorMessage ? <p className="text-sm text-destructive">{errorMessage}</p> : null}
          </form>
        </motion.div>
      </div>
    </section>
  );
};

export default LeadCaptureSection;
