import { type FormEvent, useRef, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import InfoPageLayout from "@/components/InfoPageLayout";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { upsertLead } from "@/lib/api";
import { logFunnelEvent } from "@/lib/funnel-events";
import { defaultLang, isSupportedLang, Lang } from "@/lib/i18n";
import { getLeadAttributionContext } from "@/lib/referral";
import { buildAlternates, useSeo } from "@/lib/seo";

const contactCopyByLang: Record<Lang, {
  title: string;
  intro: string;
  backLabel: string;
  detailsTitle: string;
  emailPrefix: string;
  responseTitle: string;
  responseBody: string;
  formTitle: string;
  successBody: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  submit: string;
  submitting: string;
  error: string;
}> = {
  sv: {
    title: "Kontakt",
    intro: "Har du frågor eller vill komma i kontakt med oss? Vi hjälper dig gärna vidare.",
    backLabel: "Till startsidan",
    detailsTitle: "Kontaktuppgifter",
    emailPrefix: "E-post",
    responseTitle: "Svarstid",
    responseBody: "Vi återkommer normalt inom 24-48 timmar.",
    formTitle: "Kontakta oss",
    successBody: "Tack, ditt meddelande är skickat. Vi återkommer så snart vi kan.",
    name: "Namn",
    email: "E-post",
    phone: "Telefonnummer",
    message: "Meddelande",
    submit: "Skicka meddelande",
    submitting: "Skickar...",
    error: "Kunde inte skicka kontaktförfrågan just nu.",
  },
  no: {
    title: "Kontakt",
    intro: "Har du spørsmål eller ønsker å komme i kontakt med oss? Vi hjelper deg gjerne videre.",
    backLabel: "Til startsiden",
    detailsTitle: "Kontaktopplysninger",
    emailPrefix: "E-post",
    responseTitle: "Svartid",
    responseBody: "Vi svarer normalt innen 24-48 timer.",
    formTitle: "Kontakt oss",
    successBody: "Takk, meldingen din er sendt. Vi tar kontakt så snart vi kan.",
    name: "Navn",
    email: "E-post",
    phone: "Telefonnummer",
    message: "Melding",
    submit: "Send melding",
    submitting: "Sender...",
    error: "Kunne ikke sende kontaktforespørselen akkurat nå.",
  },
  da: {
    title: "Kontakt",
    intro: "Har du spørgsmål eller vil du i kontakt med os? Vi hjælper dig gerne videre.",
    backLabel: "Til forsiden",
    detailsTitle: "Kontaktoplysninger",
    emailPrefix: "E-mail",
    responseTitle: "Svartid",
    responseBody: "Vi vender normalt tilbage inden for 24-48 timer.",
    formTitle: "Kontakt os",
    successBody: "Tak, din besked er sendt. Vi vender tilbage så hurtigt som muligt.",
    name: "Navn",
    email: "E-mail",
    phone: "Telefonnummer",
    message: "Besked",
    submit: "Send besked",
    submitting: "Sender...",
    error: "Kontaktforespørgslen kunne ikke sendes lige nu.",
  },
  fi: {
    title: "Yhteystiedot",
    intro: "Onko sinulla kysyttävää tai haluatko ottaa meihin yhteyttä? Autamme mielellämme eteenpäin.",
    backLabel: "Takaisin etusivulle",
    detailsTitle: "Yhteystiedot",
    emailPrefix: "Sähköposti",
    responseTitle: "Vastausaika",
    responseBody: "Vastaamme normaalisti 24-48 tunnin kuluessa.",
    formTitle: "Ota yhteyttä",
    successBody: "Kiitos, viestisi on lähetetty. Palaamme asiaan mahdollisimman pian.",
    name: "Nimi",
    email: "Sähköposti",
    phone: "Puhelinnumero",
    message: "Viesti",
    submit: "Lähetä viesti",
    submitting: "Lähetetään...",
    error: "Yhteydenottopyyntöä ei voitu lähettää juuri nyt.",
  },
  en: {
    title: "Contact",
    intro: "Do you have questions or want to get in touch with us? We are happy to help.",
    backLabel: "Back to home",
    detailsTitle: "Contact details",
    emailPrefix: "Email",
    responseTitle: "Response time",
    responseBody: "We normally respond within 24-48 hours.",
    formTitle: "Contact us",
    successBody: "Thank you, your message has been sent. We will get back to you as soon as we can.",
    name: "Name",
    email: "Email",
    phone: "Phone number",
    message: "Message",
    submit: "Send message",
    submitting: "Submitting...",
    error: "The contact request could not be sent right now.",
  },
  de: {
    title: "Kontakt",
    intro: "Hast du Fragen oder möchtest du mit uns in Kontakt treten? Wir helfen dir gern weiter.",
    backLabel: "Zur Startseite",
    detailsTitle: "Kontaktdaten",
    emailPrefix: "E-Mail",
    responseTitle: "Antwortzeit",
    responseBody: "Wir antworten normalerweise innerhalb von 24-48 Stunden.",
    formTitle: "Kontaktiere uns",
    successBody: "Danke, deine Nachricht wurde gesendet. Wir melden uns so schnell wie möglich bei dir.",
    name: "Name",
    email: "E-Mail",
    phone: "Telefonnummer",
    message: "Nachricht",
    submit: "Nachricht senden",
    submitting: "Wird gesendet...",
    error: "Die Kontaktanfrage konnte gerade nicht gesendet werden.",
  },
  fr: {
    title: "Contact",
    intro: "Vous avez des questions ou souhaitez nous contacter ? Nous serons ravis de vous aider.",
    backLabel: "Retour à l'accueil",
    detailsTitle: "Coordonnées",
    emailPrefix: "E-mail",
    responseTitle: "Délai de réponse",
    responseBody: "Nous répondons généralement sous 24 à 48 heures.",
    formTitle: "Nous contacter",
    successBody: "Merci, votre message a été envoyé. Nous reviendrons vers vous dès que possible.",
    name: "Nom",
    email: "E-mail",
    phone: "Téléphone",
    message: "Message",
    submit: "Envoyer le message",
    submitting: "Envoi...",
    error: "La demande de contact n'a pas pu être envoyée pour le moment.",
  },
  it: {
    title: "Contatto",
    intro: "Hai domande o vuoi metterti in contatto con noi? Saremo felici di aiutarti.",
    backLabel: "Torna alla home",
    detailsTitle: "Dettagli di contatto",
    emailPrefix: "E-mail",
    responseTitle: "Tempo di risposta",
    responseBody: "Rispondiamo normalmente entro 24-48 ore.",
    formTitle: "Contattaci",
    successBody: "Grazie, il tuo messaggio è stato inviato. Ti ricontatteremo appena possibile.",
    name: "Nome",
    email: "E-mail",
    phone: "Numero di telefono",
    message: "Messaggio",
    submit: "Invia messaggio",
    submitting: "Invio...",
    error: "La richiesta di contatto non può essere inviata in questo momento.",
  },
  ar: {
    title: "تواصل معنا",
    intro: "هل لديك سؤال عن اختبار الأوميغا أو تريد أن نشرح لك الخطوة التالية؟ اترك رسالة وسنعود إليك بهدوء.",
    backLabel: "العودة إلى البداية",
    detailsTitle: "بيانات التواصل",
    emailPrefix: "البريد الإلكتروني",
    responseTitle: "وقت الرد",
    responseBody: "نرد عادة خلال 24-48 ساعة.",
    formTitle: "أرسل لنا رسالة",
    successBody: "شكرا لك، وصلت رسالتك. سنتواصل معك في أقرب وقت ممكن.",
    name: "الاسم",
    email: "البريد الإلكتروني",
    phone: "رقم الهاتف",
    message: "اكتب سؤالك أو ما تريد أن نفهمه",
    submit: "إرسال الرسالة",
    submitting: "جار الإرسال...",
    error: "تعذر إرسال الرسالة الآن.",
  },
};

const ContactPage = () => {
  const { lang } = useParams<{ lang?: string }>();
  const currentLang = (isSupportedLang(lang) ? lang : defaultLang) as Lang;
  const copy = contactCopyByLang[currentLang];
  const location = useLocation();
  const contactPath = currentLang === "sv" ? "/kontakt" : `/${currentLang}/kontakt`;
  useSeo({
    lang: currentLang,
    title: `${copy.title} | InsideBalance`,
    description: copy.intro,
    path: contactPath,
    alternates: buildAlternates((lang) => (lang === "sv" ? "/kontakt" : `/${lang}/kontakt`), ["sv", "no", "da", "fi", "en", "de", "fr", "it", "ar"]),
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const hasTrackedFormStart = useRef(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const updateField = (field: keyof typeof formData, value: string) => {
    setFormData((current) => ({ ...current, [field]: value }));
  };

  const trackFormStart = () => {
    if (hasTrackedFormStart.current) {
      return;
    }

    hasTrackedFormStart.current = true;
    void logFunnelEvent("lead_form_started", {
      pathname: location.pathname,
      search: location.search,
      details: {
        formType: "contact",
      },
    });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) {
      return;
    }
    setSubmitting(true);
    setErrorMessage(null);

    try {
      const attribution = await getLeadAttributionContext(location.pathname, location.search);
      const validReferralCode = attribution.referredByUserId ? attribution.referralCode : null;
      void logFunnelEvent("lead_form_submitted", {
        pathname: location.pathname,
        search: location.search,
        referralCode: validReferralCode,
        sessionId: attribution.sessionId,
        details: {
          formType: "contact",
        },
      });
      const response = await upsertLead({
        full_name: formData.name,
        email: formData.email,
        phone: formData.phone || null,
        session_id: attribution.sessionId,
        ref: validReferralCode,
        lead_type: "customer",
        lead_source: "customer_form",
        source_page: currentLang === "sv" ? "/kontakt" : `/${currentLang}/kontakt`,
        details: {
          intent: "contact",
          message: formData.message,
          landingPage: attribution.landingPage,
          attribution: {
            sessionId: attribution.sessionId,
            referralCode: validReferralCode,
            referredByUserId: attribution.referredByUserId,
            landingPage: attribution.landingPage,
            firstTouch: attribution.firstTouch,
            lastTouch: attribution.lastTouch,
          },
        },
      });

      if (!response.ok) {
        throw new Error(copy.error);
      }

      setSubmitted(true);
    } catch (error) {
      void logFunnelEvent("lead_form_submit_failed", {
        pathname: location.pathname,
        search: location.search,
        details: {
          formType: "contact",
          reason: error instanceof Error ? error.message : "submit_failed",
        },
      });
      setErrorMessage(error instanceof Error ? error.message : copy.error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <InfoPageLayout
      lang={currentLang}
      title={copy.title}
      intro={copy.intro}
      backLabel={copy.backLabel}
    >
      <section className="rounded-[1.5rem] border border-border/80 bg-card p-5 shadow-card sm:p-6 md:rounded-[1.75rem] md:p-8">
        <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">{copy.detailsTitle}</h2>
        <p className="mt-3 text-base leading-7 text-subtle sm:mt-4 sm:leading-8">
          {copy.emailPrefix}:{" "}
          <a href="mailto:hello@insidebalance.eu" className="font-medium text-foreground underline underline-offset-4">
            hello@insidebalance.eu
          </a>
        </p>
      </section>

      <section className="rounded-[1.5rem] border border-border/80 bg-card p-5 shadow-card sm:p-6 md:rounded-[1.75rem] md:p-8">
        <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">{copy.responseTitle}</h2>
        <p className="mt-3 text-base leading-7 text-subtle sm:mt-4 sm:leading-8">
          {copy.responseBody}
        </p>
      </section>

      <section className="rounded-[1.5rem] border border-border/80 bg-card p-5 shadow-card sm:p-6 md:rounded-[1.75rem] md:p-8">
        <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">{copy.formTitle}</h2>
        {submitted ? (
          <p className="mt-3 text-base leading-7 text-subtle sm:mt-4 sm:leading-8">
            {copy.successBody}
          </p>
        ) : (
          <form className="mt-5 space-y-5 sm:mt-6" onSubmit={(event) => void handleSubmit(event)}>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-foreground">{copy.name}</span>
              <Input required value={formData.name} onChange={(event) => {
                trackFormStart();
                updateField("name", event.target.value);
              }} className="h-12 rounded-xl" />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-foreground">{copy.email}</span>
              <Input required type="email" value={formData.email} onChange={(event) => {
                trackFormStart();
                updateField("email", event.target.value);
              }} className="h-12 rounded-xl" />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-foreground">{copy.phone}</span>
              <Input value={formData.phone} onChange={(event) => {
                trackFormStart();
                updateField("phone", event.target.value);
              }} className="h-12 rounded-xl" />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-foreground">{copy.message}</span>
              <Textarea required value={formData.message} onChange={(event) => {
                trackFormStart();
                updateField("message", event.target.value);
              }} className="min-h-[144px] rounded-xl" />
            </label>
            <button type="submit" disabled={submitting} className="btn-primary min-h-12 w-full text-center disabled:opacity-70 sm:min-w-[220px] sm:w-auto">
              {submitting ? copy.submitting : copy.submit}
            </button>
            {errorMessage ? <p className="text-sm text-destructive">{errorMessage}</p> : null}
          </form>
        )}
      </section>
    </InfoPageLayout>
  );
};

export default ContactPage;
