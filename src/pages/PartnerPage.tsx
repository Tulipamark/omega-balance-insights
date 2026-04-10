import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ArrowDown, BarChart3, CheckCircle2, CircleDollarSign, FlaskConical, Users2 } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import FooterSection from "@/components/FooterSection";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { upsertLead } from "@/lib/api";
import { logFunnelEvent } from "@/lib/funnel-events";
import { Lang, t } from "@/lib/i18n";
import { getLeadAttributionContext } from "@/lib/referral";

interface PartnerPageProps {
  lang: Lang;
}

const readMoreByLang: Record<Lang, { more: string; less: string }> = {
  sv: { more: "Läs mer", less: "Visa mindre" },
  no: { more: "Les mer", less: "Vis mindre" },
  da: { more: "Læs mere", less: "Vis mindre" },
  fi: { more: "Lue lisää", less: "Näytä vähemmän" },
  en: { more: "Read more", less: "Show less" },
  de: { more: "Mehr lesen", less: "Weniger anzeigen" },
  fr: { more: "Lire la suite", less: "Réduire" },
  it: { more: "Leggi di più", less: "Mostra meno" },
};

const submitErrorByLang: Record<Lang, string> = {
  sv: "Partneransökan kunde inte skickas just nu.",
  no: "Partnersøknaden kunne ikke sendes akkurat nå.",
  da: "Partneransøgningen kunne ikke sendes lige nu.",
  fi: "Partnerihakemusta ei voitu lähettää juuri nyt.",
  en: "The partner application could not be sent right now.",
  de: "Die Partneranfrage konnte gerade nicht gesendet werden.",
  fr: "La demande de partenariat n'a pas pu être envoyée pour le moment.",
  it: "La richiesta partner non può essere inviata in questo momento.",
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

type PartnerPageContent = {
  hero: {
    badge: string;
    title: string;
    body: string;
    primaryCta: string;
    secondaryCta: string;
    cards: { title: string; text: string; icon: typeof FlaskConical }[];
  };
  economics: {
    title: string;
    body: string;
    steps: { label: string; value: string }[];
    modelLabel: string;
    modelBody: string;
    calloutTitle: string;
    calloutBody: string;
    note: string;
  };
  reasons: {
    title: string;
    body: string;
    cards: { title: string; text: string }[];
  };
  fit: {
    title: string;
    body: string;
    columns: { title: string; items: string[] }[];
  };
  steps: {
    title: string;
    body: string;
    items: { title: string; text: string }[];
  };
  form: {
    title: string;
    body: string;
    name: string;
    email: string;
    phone: string;
    company: string;
    interest: string;
    readiness: string;
    background: string;
    interestOptions: string[];
    readinessOptions: string[];
    submit: string;
    successTitle: string;
    successBody: string;
  };
  sticky: {
    text: string;
    cta: string;
  };
};

const sectionNavByLang: Record<Lang, { title: string; items: { href: string; label: string }[] }> = {
  sv: {
    title: "Översikt",
    items: [
      { href: "#partner-economics", label: "Affärslogik" },
      { href: "#partner-reasons", label: "Varför modellen" },
      { href: "#partner-fit", label: "Rätt profil" },
      { href: "#partner-steps", label: "Processen" },
      { href: "#partner-application", label: "Ansökan" },
    ],
  },
  no: {
    title: "Oversikt",
    items: [
      { href: "#partner-economics", label: "Forretningslogikk" },
      { href: "#partner-reasons", label: "Hvorfor nå" },
      { href: "#partner-fit", label: "Hvem det passer for" },
      { href: "#partner-steps", label: "Neste steg" },
      { href: "#partner-application", label: "Søknad" },
    ],
  },
  da: {
    title: "Overblik",
    items: [
      { href: "#partner-economics", label: "Forretningslogik" },
      { href: "#partner-reasons", label: "Hvorfor nu" },
      { href: "#partner-fit", label: "Hvem det passer til" },
      { href: "#partner-steps", label: "Næste skridt" },
      { href: "#partner-application", label: "Ansøgning" },
    ],
  },
  fi: {
    title: "Yleiskatsaus",
    items: [
      { href: "#partner-economics", label: "Liiketoimintalogiikka" },
      { href: "#partner-reasons", label: "Miksi juuri nyt" },
      { href: "#partner-fit", label: "Kenelle tämä sopii" },
      { href: "#partner-steps", label: "Seuraavat vaiheet" },
      { href: "#partner-application", label: "Hakemus" },
    ],
  },
  en: {
    title: "Overview",
    items: [
      { href: "#partner-economics", label: "Business logic" },
      { href: "#partner-reasons", label: "Why now" },
      { href: "#partner-fit", label: "Who this fits" },
      { href: "#partner-steps", label: "Next steps" },
      { href: "#partner-application", label: "Application" },
    ],
  },
  de: {
    title: "Überblick",
    items: [
      { href: "#partner-economics", label: "Geschäftslogik" },
      { href: "#partner-reasons", label: "Warum jetzt" },
      { href: "#partner-fit", label: "Für wen es passt" },
      { href: "#partner-steps", label: "Nächste Schritte" },
      { href: "#partner-application", label: "Bewerbung" },
    ],
  },
  fr: {
    title: "Vue d'ensemble",
    items: [
      { href: "#partner-economics", label: "Logique économique" },
      { href: "#partner-reasons", label: "Pourquoi maintenant" },
      { href: "#partner-fit", label: "À qui cela convient" },
      { href: "#partner-steps", label: "Étapes suivantes" },
      { href: "#partner-application", label: "Candidature" },
    ],
  },
  it: {
    title: "Panoramica",
    items: [
      { href: "#partner-economics", label: "Logica del modello" },
      { href: "#partner-reasons", label: "Perché ora" },
      { href: "#partner-fit", label: "A chi si adatta" },
      { href: "#partner-steps", label: "Prossimi passi" },
      { href: "#partner-application", label: "Candidatura" },
    ],
  },
};

const flowSummaryByLang: Record<Lang, { title: string; items: string[] }> = {
  sv: {
    title: "Partnerresan",
    items: [
      "Du lämnar ditt intresse via sidan.",
      "Vi följer upp och visar modellen tydligt.",
      "Om det känns rätt går du vidare till Zinzino.",
      "När du är igång får du portal, länkar och nästa steg.",
    ],
  },
  no: {
    title: "Partnerreisen",
    items: [
      "Du legger inn interessen din via siden.",
      "Vi følger opp og viser modellen tydelig.",
      "Hvis dette kjennes riktig, går du videre til Zinzino.",
      "Når du er i gang, får du portal, lenker og neste steg.",
    ],
  },
  da: {
    title: "Partnerrejsen",
    items: [
      "Du sender din interesse via siden.",
      "Vi følger op og viser modellen tydeligt.",
      "Hvis det føles rigtigt, går du videre til Zinzino.",
      "Når du er i gang, får du portal, links og næste skridt.",
    ],
  },
  fi: {
    title: "Partneripolku",
    items: [
      "Jätät kiinnostuksesi sivun kautta.",
      "Palaamme asiaan ja käymme mallin läpi selkeästi.",
      "Jos tämä tuntuu oikealta, etenet Zinzinoon.",
      "Kun olet käynnissä, saat portaalin, linkit ja seuraavat vaiheet.",
    ],
  },
  en: {
    title: "The partner journey",
    items: [
      "You register your interest through the page.",
      "We follow up and explain the model clearly.",
      "If it feels right, you move forward with Zinzino.",
      "Once you are active, you get portal access, links, and next steps.",
    ],
  },
  de: {
    title: "Der Partnerweg",
    items: [
      "Du hinterlässt dein Interesse über die Seite.",
      "Wir fassen nach und erklären das Modell klar.",
      "Wenn es passt, gehst du mit Zinzino weiter.",
      "Sobald du aktiv bist, bekommst du Portalzugang, Links und die nächsten Schritte.",
    ],
  },
  fr: {
    title: "Le parcours partenaire",
    items: [
      "Vous laissez votre intérêt via la page.",
      "Nous revenons vers vous et présentons clairement le modèle.",
      "Si cela vous correspond, vous poursuivez avec Zinzino.",
      "Une fois lancé, vous obtenez le portail, les liens et les prochaines étapes.",
    ],
  },
  it: {
    title: "Il percorso partner",
    items: [
      "Lasci il tuo interesse tramite la pagina.",
      "Ti ricontattiamo e spieghiamo il modello in modo chiaro.",
      "Se ti sembra la strada giusta, prosegui con Zinzino.",
      "Quando sei attivo, ricevi portale, link e prossimi passi.",
    ],
  },
};

const formIntroByLang: Record<Lang, { eyebrow: string; note: string }> = {
  sv: {
    eyebrow: "Nästa steg",
    note: "Det här är bara ett första intresse. Vi följer upp personligt och utan press.",
  },
  no: {
    eyebrow: "Neste steg",
    note: "Dette er bare en første interesse. Vi følger opp personlig og uten press.",
  },
  da: {
    eyebrow: "Næste skridt",
    note: "Dette er blot en første interesse. Vi følger op personligt og uden pres.",
  },
  fi: {
    eyebrow: "Seuraava vaihe",
    note: "Tämä on vasta ensimmäinen kiinnostuksenosoitus. Palaamme asiaan henkilökohtaisesti ilman painetta.",
  },
  en: {
    eyebrow: "Next step",
    note: "This is only an initial expression of interest. We follow up personally and without pressure.",
  },
  de: {
    eyebrow: "Nächster Schritt",
    note: "Das ist nur ein erstes Interesse. Wir melden uns persönlich und ohne Druck zurück.",
  },
  fr: {
    eyebrow: "Étape suivante",
    note: "Il s'agit simplement d'un premier intérêt. Nous revenons vers vous personnellement et sans pression.",
  },
  it: {
    eyebrow: "Prossimo passo",
    note: "Si tratta solo di un primo interesse. Ti ricontatteremo personalmente e senza pressioni.",
  },
};

const applicationDecisionByLang: Record<Lang, { title: string; body: string; checks: string[] }> = {
  sv: {
    title: "Innan du ansöker",
    body: "Det här passar bäst för personer som vill arbeta långsiktigt, är öppna för personlig uppföljning och kan se sig själva ta några tydliga steg i taget.",
    checks: [
      "Du vill förstå modellen ordentligt innan du bestämmer dig.",
      "Du är öppen för samtal, uppföljning och ett verkligt nästa steg.",
      "Du kan börja nära ditt eget nätverk i stället för att försöka göra allt på en gång.",
    ],
  },
  no: {
    title: "Før du søker",
    body: "Dette passer best for personer som vil jobbe langsiktig, er åpne for personlig oppfølging og kan se for seg å ta noen tydelige steg om gangen.",
    checks: [
      "Du vil forstå modellen ordentlig før du bestemmer deg.",
      "Du er åpen for samtaler, oppfølging og et reelt neste steg.",
      "Du kan begynne nær ditt eget nettverk i stedet for å prøve å gjøre alt samtidig.",
    ],
  },
  da: {
    title: "Før du ansøger",
    body: "Dette passer bedst til personer, der vil arbejde langsigtet, er åbne for personlig opfølgning og kan se sig selv tage nogle tydelige skridt ad gangen.",
    checks: [
      "Du vil forstå modellen ordentligt, før du beslutter dig.",
      "Du er åben for samtaler, opfølgning og et reelt næste skridt.",
      "Du kan begynde tæt på dit eget netværk i stedet for at forsøge at gøre alt på én gang.",
    ],
  },
  fi: {
    title: "Ennen kuin haet",
    body: "Tämä sopii parhaiten ihmisille, jotka haluavat rakentaa pitkäjänteisesti, ovat avoimia henkilökohtaiselle yhteydenpidolle ja pystyvät etenemään muutama selkeä askel kerrallaan.",
    checks: [
      "Haluat ymmärtää mallin kunnolla ennen päätöstäsi.",
      "Olet avoin keskustelulle, seurannalle ja todelliselle seuraavalle askeleelle.",
      "Voit aloittaa läheltä omaa verkostoasi sen sijaan, että yrittäisit tehdä kaiken kerralla.",
    ],
  },
  en: {
    title: "Before you apply",
    body: "This is best suited for people who want to build over time, are open to personal follow-up, and can see themselves taking a few clear steps at a time.",
    checks: [
      "You want to understand the model properly before deciding.",
      "You are open to conversations, follow-up, and a real next step.",
      "You can start close to your own network instead of trying to do everything at once.",
    ],
  },
  de: {
    title: "Bevor du dich bewirbst",
    body: "Das passt am besten zu Menschen, die langfristig aufbauen wollen, offen für persönliche Begleitung sind und sich vorstellen können, Schritt für Schritt vorzugehen.",
    checks: [
      "Du möchtest das Modell wirklich verstehen, bevor du entscheidest.",
      "Du bist offen für Gespräche, Nachverfolgung und einen echten nächsten Schritt.",
      "Du kannst in deinem eigenen Netzwerk beginnen, statt alles auf einmal zu versuchen.",
    ],
  },
  fr: {
    title: "Avant de candidater",
    body: "Cela convient surtout aux personnes qui veulent construire dans la durée, sont ouvertes à un suivi personnel et peuvent avancer par étapes claires.",
    checks: [
      "Vous voulez bien comprendre le modèle avant de décider.",
      "Vous êtes ouvert aux échanges, au suivi et à une vraie prochaine étape.",
      "Vous pouvez commencer au sein de votre propre réseau au lieu d'essayer de tout faire d'un coup.",
    ],
  },
  it: {
    title: "Prima di candidarti",
    body: "Questo è più adatto a persone che vogliono costruire nel tempo, sono aperte a un follow-up personale e riescono a procedere con alcuni passi chiari alla volta.",
    checks: [
      "Vuoi capire bene il modello prima di decidere.",
      "Sei aperto a confronto, follow-up e a un vero passo successivo.",
      "Puoi iniziare dal tuo network invece di cercare di fare tutto subito.",
    ],
  },
};

const afterApplicationByLang: Record<Lang, { title: string; items: string[] }> = {
  sv: {
    title: "Efter din ansökan",
    items: [
      "Vi läser igenom ditt intresse och återkommer personligt.",
      "Om det känns relevant tar vi nästa steg via samtal eller Zoom.",
      "Om det passar går du vidare i rätt ordning, utan att behöva förstå allt på egen hand direkt.",
    ],
  },
  no: {
    title: "Etter søknaden",
    items: [
      "Vi leser gjennom interessen din og følger opp personlig.",
      "Hvis dette virker relevant, tar vi neste steg via samtale eller Zoom.",
      "Hvis det passer, går du videre i riktig rekkefølge uten å måtte forstå alt alene med en gang.",
    ],
  },
  da: {
    title: "Efter ansøgningen",
    items: [
      "Vi læser din interesse igennem og følger personligt op.",
      "Hvis det virker relevant, tager vi næste skridt via samtale eller Zoom.",
      "Hvis det passer, går du videre i den rigtige rækkefølge uden at skulle forstå alt alene med det samme.",
    ],
  },
  fi: {
    title: "Hakemuksen jälkeen",
    items: [
      "Käymme kiinnostuksesi läpi ja palaamme asiaan henkilökohtaisesti.",
      "Jos tämä vaikuttaa sopivalta, otamme seuraavan askeleen puhelun tai Zoomin kautta.",
      "Jos tämä sopii, etenet oikeassa järjestyksessä ilman että sinun täytyy ymmärtää kaikkea yksin heti alussa.",
    ],
  },
  en: {
    title: "After your application",
    items: [
      "We review your interest and follow up personally.",
      "If it seems relevant, we take the next step through a call or Zoom.",
      "If it fits, you move forward in the right order without needing to figure everything out alone right away.",
    ],
  },
  de: {
    title: "Nach deiner Bewerbung",
    items: [
      "Wir schauen uns dein Interesse an und melden uns persönlich bei dir.",
      "Wenn es passend wirkt, gehen wir den nächsten Schritt per Gespräch oder Zoom.",
      "Wenn es passt, gehst du in der richtigen Reihenfolge weiter, ohne sofort alles allein verstehen zu müssen.",
    ],
  },
  fr: {
    title: "Après votre candidature",
    items: [
      "Nous examinons votre intérêt et revenons vers vous personnellement.",
      "Si cela semble pertinent, nous poursuivons via un appel ou Zoom.",
      "Si cela convient, vous avancez dans le bon ordre sans devoir tout comprendre seul immédiatement.",
    ],
  },
  it: {
    title: "Dopo la candidatura",
    items: [
      "Valutiamo il tuo interesse e ti ricontattiamo personalmente.",
      "Se sembra pertinente, facciamo il passo successivo tramite chiamata o Zoom.",
      "Se è adatto, prosegui nel giusto ordine senza dover capire tutto da solo fin da subito.",
    ],
  },
};

const proofLayerByLang: Record<Lang, { title: string; body: string; cards: { title: string; text: string }[] }> = {
  sv: {
    title: "Varför det här kan vara värt att bygga",
    body: "Som blivande partner behöver du inte allt på plats från start. Det viktiga är att snabbt se varför modellen kan ge dig bättre samtal, tydligare uppföljning och en mer strukturerad väg framåt.",
    cards: [
      {
        title: "Du får en enklare affärslogik att stå för",
        text: "När färre externa led tar marginal blir det lättare att förstå varför det finns utrymme kvar i modellen. För dig som partner betyder det en tydligare affärslogik att förklara och bygga vidare på.",
      },
      {
        title: "Du får lättare att starta relevanta samtal",
        text: "När kunden utgår från ett test blir dialogen enklare att börja i något konkret. Det gör det lättare för dig att följa upp naturligt och föra samtalet vidare utan att det känns påträngande.",
      },
      {
        title: "Du bygger i en kategori som känns mer relevant nu",
        text: "Fler människor vill förstå sina värden bättre, följa upp vad som faktiskt händer och fatta mer informerade beslut. Det gör modellen lättare att uppleva som relevant än upplägg som mest bygger på allmän inspiration.",
      },
    ],
  },
  no: {
    title: "Hvorfor dette kan være verdt å bygge",
    body: "Som potensiell partner trenger du ikke å ha alt på plass fra start. Det viktigste er å raskt se hvorfor modellen kan gi deg bedre samtaler, tydeligere oppfølging og en mer strukturert vei videre.",
    cards: [
      {
        title: "Du får en enklere forretningslogikk å stå for",
        text: "Når færre eksterne ledd tar margin, blir det lettere å forstå hvorfor det finnes mer rom igjen i modellen. For deg som partner betyr det en tydeligere forretningslogikk å forklare og bygge videre på.",
      },
      {
        title: "Du får lettere for å starte relevante samtaler",
        text: "Når kunden tar utgangspunkt i en test, blir dialogen enklere å starte i noe konkret. Det gjør det lettere for deg å følge opp naturlig og føre samtalen videre uten at det føles påtrengende.",
      },
      {
        title: "Du bygger i en kategori som kjennes mer relevant nå",
        text: "Flere mennesker vil forstå verdiene sine bedre, følge opp hva som faktisk skjer og ta mer informerte beslutninger. Det gjør modellen lettere å oppleve som relevant enn opplegg som mest bygger på generell inspirasjon.",
      },
    ],
  },
  da: {
    title: "Hvorfor det her kan være værd at bygge",
    body: "Som kommende partner behøver du ikke have alt på plads fra start. Det vigtigste er hurtigt at se, hvorfor modellen kan give dig bedre samtaler, tydeligere opfølgning og en mere struktureret vej frem.",
    cards: [
      {
        title: "Du får en enklere forretningslogik at stå på",
        text: "Når færre eksterne led tager margin, bliver det lettere at forstå, hvorfor der er mere rum tilbage i modellen. For dig som partner betyder det en tydeligere forretningslogik at forklare og bygge videre på.",
      },
      {
        title: "Du får lettere ved at starte relevante samtaler",
        text: "Når kunden tager udgangspunkt i en test, bliver dialogen lettere at starte i noget konkret. Det gør det lettere for dig at følge op naturligt og føre samtalen videre uden at det føles påtrængende.",
      },
      {
        title: "Du bygger i en kategori, der føles mere relevant nu",
        text: "Flere mennesker vil forstå deres værdier bedre, følge op på hvad der faktisk sker og træffe mere informerede beslutninger. Det gør modellen lettere at opleve som relevant end oplæg, der mest bygger på generel inspiration.",
      },
    ],
  },
  fi: {
    title: "Miksi tätä voi olla järkevää rakentaa",
    body: "Mahdollisena partnerina sinun ei tarvitse saada kaikkea valmiiksi heti alussa. Tärkeintä on nähdä nopeasti, miksi malli voi tuoda parempia keskusteluja, selkeämpää jatkoseurantaa ja rakenteellisemman tavan edetä.",
    cards: [
      {
        title: "Saat selkeämmän liiketoimintalogiikan, jonka takana voit seistä",
        text: "Kun ulkopuolisia väliportaita on vähemmän, on helpompi ymmärtää, miksi malliin jää enemmän liikkumavaraa. Partnerille tämä tarkoittaa selkeämpää liiketoimintalogiikkaa, jota on helpompi selittää ja rakentaa eteenpäin.",
      },
      {
        title: "Saat helpomman tavan aloittaa olennaisia keskusteluja",
        text: "Kun asiakas lähtee liikkeelle testistä, keskustelu on helpompi aloittaa jostain konkreettisesta. Se helpottaa luonnollista seurantaa ja auttaa viemään keskustelua eteenpäin ilman, että se tuntuu päällekäyvältä.",
      },
      {
        title: "Rakennat kategoriassa, joka tuntuu nyt ajankohtaisemmalta",
        text: "Yhä useampi haluaa ymmärtää omia arvojaan paremmin, seurata mitä oikeasti tapahtuu ja tehdä harkitumpia päätöksiä. Siksi malli tuntuu helpommin relevantilta kuin lähestymistavat, jotka perustuvat lähinnä yleiseen inspiraatioon.",
      },
    ],
  },
  en: {
    title: "Why this can be worth building",
    body: "As a potential partner, you do not need everything in place from day one. What matters is quickly seeing why the model can give you better conversations, clearer follow-up, and a more structured path forward.",
    cards: [
      {
        title: "You get a simpler business logic to stand behind",
        text: "When fewer outside layers take margin, it becomes easier to understand why more room stays in the model. For you as a partner, that means a clearer business logic to explain and build on.",
      },
      {
        title: "You get an easier way to start relevant conversations",
        text: "When the customer starts from a test, the dialogue becomes easier to begin with something concrete. That makes it easier for you to follow up naturally and move the conversation forward without feeling pushy.",
      },
      {
        title: "You build in a category that feels more relevant now",
        text: "More people want to understand their numbers better, follow what is actually changing, and make more informed decisions. That makes the model easier to experience as relevant than setups built mostly on general inspiration.",
      },
    ],
  },
  de: {
    title: "Warum es sich lohnen kann, das aufzubauen",
    body: "Als potenzieller Partner musst du nicht vom ersten Tag an alles fertig haben. Entscheidend ist, schnell zu erkennen, warum das Modell zu besseren Gesprächen, klarerer Nachverfolgung und einem strukturierteren Weg nach vorn führen kann.",
    cards: [
      {
        title: "Du bekommst eine klarere Geschäftslogik, hinter der du stehen kannst",
        text: "Wenn weniger externe Stufen Marge herausnehmen, wird verständlicher, warum im Modell mehr Spielraum bleibt. Für dich als Partner bedeutet das eine klarere Geschäftslogik, die du leichter erklären und weiter ausbauen kannst.",
      },
      {
        title: "Du kannst relevante Gespräche leichter beginnen",
        text: "Wenn der Kunde mit einem Test startet, lässt sich der Dialog leichter an etwas Konkretem aufhängen. Das macht es für dich einfacher, natürlich nachzufassen und das Gespräch weiterzuführen, ohne aufdringlich zu wirken.",
      },
      {
        title: "Du baust in einer Kategorie, die heute relevanter wirkt",
        text: "Immer mehr Menschen wollen ihre Werte besser verstehen, echte Veränderungen nachvollziehen und fundiertere Entscheidungen treffen. Dadurch wirkt das Modell relevanter als Ansätze, die vor allem auf allgemeiner Inspiration beruhen.",
      },
    ],
  },
  fr: {
    title: "Pourquoi cela peut valoir la peine d’être développé",
    body: "En tant que partenaire potentiel, vous n’avez pas besoin que tout soit en place dès le départ. L’essentiel est de voir rapidement pourquoi ce modèle peut vous apporter de meilleures conversations, un suivi plus clair et une manière plus structurée d’avancer.",
    cards: [
      {
        title: "Vous disposez d’une logique business plus simple à porter",
        text: "Quand moins d’intermédiaires externes prennent de marge, il devient plus facile de comprendre pourquoi davantage de marge de manœuvre reste dans le modèle. Pour vous, cela signifie une logique business plus claire à expliquer et à développer.",
      },
      {
        title: "Vous pouvez lancer plus facilement des conversations pertinentes",
        text: "Quand le client part d’un test, la discussion démarre plus facilement sur quelque chose de concret. Cela vous aide à faire un suivi plus naturel et à faire avancer la conversation sans paraître insistant.",
      },
      {
        title: "Vous développez une catégorie qui paraît plus pertinente aujourd’hui",
        text: "De plus en plus de personnes veulent mieux comprendre leurs marqueurs, suivre ce qui change réellement et prendre des décisions plus informées. Le modèle paraît donc plus pertinent que des approches fondées surtout sur une inspiration générale.",
      },
    ],
  },
  it: {
    title: "Perché questo può valere la pena di essere costruito",
    body: "Come potenziale partner non serve avere tutto pronto fin dal primo giorno. Ciò che conta è capire rapidamente perché il modello può portarti conversazioni migliori, un follow-up più chiaro e un percorso più strutturato.",
    cards: [
      {
        title: "Hai una logica di business più semplice da sostenere",
        text: "Quando meno passaggi esterni assorbono margine, diventa più facile capire perché nel modello resta più spazio. Per te come partner questo significa una logica di business più chiara da spiegare e sviluppare.",
      },
      {
        title: "Hai un modo più semplice per avviare conversazioni rilevanti",
        text: "Quando il cliente parte da un test, il dialogo è più facile da avviare su qualcosa di concreto. Questo ti aiuta a fare follow-up in modo naturale e a portare avanti la conversazione senza risultare invadente.",
      },
      {
        title: "Costruisci in una categoria che oggi appare più rilevante",
        text: "Sempre più persone vogliono capire meglio i propri valori, seguire ciò che cambia davvero e prendere decisioni più informate. Per questo il modello appare più rilevante rispetto ad approcci basati soprattutto su ispirazione generica.",
      },
    ],
  },
};

const whyZinzinoByLang: Record<Lang, { title: string; body: string; cards: { title: string; text: string }[] }> = {
  sv: {
    title: "Varför Zinzino i grunden",
    body: "F\u00f6r m\u00e5nga \u00e4r steget till eget st\u00f6rre \u00e4n viljan. Inte f\u00f6r att driv saknas, utan f\u00f6r att tr\u00f6skeln k\u00e4nns h\u00f6g. H\u00e4r finns redan produkt, logistik och grundstruktur p\u00e5 plats. Det g\u00f6r att du kan fokusera mer p\u00e5 att f\u00f6rst\u00e5 modellen, komma i r\u00f6relse och bygga stegvis.",
    cards: [
      {
        title: "Etablerad internationell struktur",
        text: "Bolaget har redan officiella marknader, logistik och ett partnerupplägg att arbeta inom. Det gör att fokus kan ligga mer på aktivitet, uppföljning och relationer än på att försöka bygga grundstrukturen själv. För den som vill bygga något seriöst är det en stor skillnad att arbeta ovanpå ett etablerat system i stället för att börja från helt tom mark.",
      },
      {
        title: "Testbaserad hälsa som kärna",
        text: "Personliga hälsotester och uppföljning gör erbjudandet mer konkret än många vaga hälsolöften. Det skapar bättre förutsättningar för relevanta samtal, tydligare kundvärde och en mer naturlig väg till uppföljning. När kunden kan utgå från något mätbart blir det också lättare att motivera varför nästa steg faktiskt spelar roll.",
      },
      {
        title: "En modell som går att duplicera",
        text: "Det finns redan arbetssätt, stöd och ett tydligare nästa steg för den som vill komma igång. Det gör det lättare att börja i liten skala, få hjälp i rätt ordning och sedan bygga vidare med mer struktur över tid. Det är också där dupliceringen börjar: inte i stora ord, utan i ett arbetssätt som fler kan förstå och upprepa.",
      },
    ],
  },
  no: {
    title: "Hvorfor Zinzino i bunn",
    body: "Vi løfter ikke frem Zinzino bare fordi det finnes en partnerplan, men fordi flere viktige deler allerede er på plass. Det gjør modellen lettere å bygge videre på enn om alt måtte skapes fra bunnen av.",
    cards: [
      {
        title: "Etablert internasjonal struktur",
        text: "Selskapet har allerede offisielle markeder, logistikk og et partneroppsett å arbeide innenfor. Det gjør at mer av fokuset kan ligge på aktivitet og oppfølging enn på å bygge grunnstrukturen selv.",
      },
      {
        title: "Testbasert helse som kjerne",
        text: "Personlige helsetester og oppfølging gjør tilbudet mer konkret enn mange uklare helseløfter. Det gir bedre grunnlag for relevante samtaler og tydeligere kundeverdi.",
      },
      {
        title: "En modell som kan dupliceres",
        text: "Det finnes allerede arbeidsmåter, støtte og et tydelig neste steg for den som vil komme i gang. Det gjør det lettere å starte i liten skala og bygge videre med struktur over tid.",
      },
    ],
  },
  da: {
    title: "Hvorfor Zinzino som grundlag",
    body: "Vi fremhæver ikke Zinzino kun fordi der findes en partnerplan, men fordi flere vigtige dele allerede er på plads. Det gør modellen lettere at bygge videre på, end hvis alt skulle skabes fra bunden.",
    cards: [
      {
        title: "Etableret international struktur",
        text: "Virksomheden har allerede officielle markeder, logistik og et partnersetup at arbejde indenfor. Det gør, at mere fokus kan ligge på aktivitet og opfølgning end på selv at bygge grundstrukturen.",
      },
      {
        title: "Testbaseret sundhed som kerne",
        text: "Personlige sundhedstests og opfølgning gør tilbuddet mere konkret end mange uklare sundhedsløfter. Det giver bedre forudsætninger for relevante samtaler og tydeligere kundeværdi.",
      },
      {
        title: "En model der kan duplikeres",
        text: "Der findes allerede arbejdsformer, støtte og et tydeligt næste skridt for den, der vil i gang. Det gør det lettere at starte i lille skala og bygge videre med struktur over tid.",
      },
    ],
  },
  fi: {
    title: "Miksi juuri Zinzino",
    body: "Emme nosta Zinzinoa esiin vain siksi, että sillä on partnerimalli, vaan siksi että useat tärkeät osat ovat jo olemassa. Se tekee mallista helpomman rakentaa kuin jos kaikki pitäisi luoda alusta asti itse.",
    cards: [
      {
        title: "Vakiintunut kansainvälinen rakenne",
        text: "Yhtiöllä on jo virallisia markkinoita, logistiikka ja partnerimalli, jonka sisällä voi toimia. Näin painopiste voi olla enemmän tekemisessä ja seurannassa kuin koko perustan rakentamisessa itse.",
      },
      {
        title: "Testipohjainen terveys ytimessä",
        text: "Henkilökohtaiset terveystestit ja seuranta tekevät tarjonnasta konkreettisemman kuin monet epämääräiset terveyslupaukset. Se luo paremmat edellytykset merkityksellisille keskusteluille ja selvemmälle asiakasarvolle.",
      },
      {
        title: "Malli, jota voi toistaa",
        text: "Työtapoja, tukea ja selkeä seuraava askel on jo olemassa sille, joka haluaa päästä alkuun. Se helpottaa aloittamista pienessä mittakaavassa ja rakentamista eteenpäin rakenteen kanssa.",
      },
    ],
  },
  en: {
    title: "Why Zinzino at the core",
    body: "We do not highlight Zinzino only because there is a partner plan, but because several important pieces are already in place. That makes the model easier to build on than if everything had to be created from scratch.",
    cards: [
      {
        title: "Established international structure",
        text: "The company already has official markets, logistics, and a partner setup to work within. That allows more focus on activity and follow-up instead of building the base structure yourself.",
      },
      {
        title: "Test-based health at the core",
        text: "Personal health tests and follow-up make the offer more concrete than many vague health promises. That creates better conditions for relevant conversations and clearer customer value.",
      },
      {
        title: "A model that can be duplicated",
        text: "There are already working methods, support, and a clearer next step for people who want to get started. That makes it easier to begin on a small scale and build with structure over time.",
      },
    ],
  },
  de: {
    title: "Warum Zinzino als Grundlage",
    body: "Wir heben Zinzino nicht nur hervor, weil es einen Partnerplan gibt, sondern weil mehrere wichtige Bausteine bereits vorhanden sind. Dadurch lässt sich das Modell leichter weiter aufbauen, als wenn alles von Grund auf selbst geschaffen werden müsste.",
    cards: [
      {
        title: "Etablierte internationale Struktur",
        text: "Das Unternehmen verfügt bereits über offizielle Märkte, Logistik und ein Partner-Setup, in dem gearbeitet werden kann. So kann der Fokus stärker auf Aktivität und Nachverfolgung liegen als auf dem Aufbau der gesamten Grundstruktur.",
      },
      {
        title: "Testbasierte Gesundheit im Kern",
        text: "Persönliche Gesundheitstests und Nachverfolgung machen das Angebot konkreter als viele vage Gesundheitsversprechen. Das schafft bessere Voraussetzungen für relevante Gespräche und klareren Kundennutzen.",
      },
      {
        title: "Ein Modell, das sich duplizieren lässt",
        text: "Es gibt bereits Arbeitsweisen, Unterstützung und einen klareren nächsten Schritt für Menschen, die loslegen wollen. Das macht es leichter, im kleinen Maßstab zu starten und über Zeit mit Struktur weiter aufzubauen.",
      },
    ],
  },
  fr: {
    title: "Pourquoi Zinzino comme base",
    body: "Nous ne mettons pas Zinzino en avant uniquement parce qu'il existe un plan partenaire, mais parce que plusieurs éléments importants sont déjà en place. Cela rend le modèle plus simple à développer que si tout devait être créé à partir de zéro.",
    cards: [
      {
        title: "Une structure internationale établie",
        text: "L'entreprise dispose déjà de marchés officiels, d'une logistique et d'un cadre partenaire existant. Cela permet de concentrer davantage l'énergie sur l'activité et le suivi que sur la construction de toute l'infrastructure de départ.",
      },
      {
        title: "La santé fondée sur le test au cœur",
        text: "Les tests de santé personnels et le suivi rendent l'offre plus concrète que beaucoup de promesses santé vagues. Cela crée de meilleures conditions pour des échanges pertinents et une valeur client plus claire.",
      },
      {
        title: "Un modèle duplicable",
        text: "Il existe déjà des méthodes de travail, du soutien et une prochaine étape plus claire pour ceux qui veulent se lancer. Cela facilite un démarrage à petite échelle et une construction plus structurée dans le temps.",
      },
    ],
  },
  it: {
    title: "Perché Zinzino come base",
    body: "Non mettiamo in evidenza Zinzino solo perché esiste un piano partner, ma perché diversi elementi importanti sono già presenti. Questo rende il modello più semplice da sviluppare rispetto a dover creare tutto da zero.",
    cards: [
      {
        title: "Struttura internazionale già esistente",
        text: "L'azienda dispone già di mercati ufficiali, logistica e un'impostazione partner entro cui lavorare. Questo permette di concentrare più energia su attività e follow-up invece che sulla costruzione dell'intera base operativa.",
      },
      {
        title: "Salute basata sui test al centro",
        text: "Test personali di salute e follow-up rendono l'offerta più concreta rispetto a molte promesse vaghe legate al benessere. Questo crea condizioni migliori per conversazioni rilevanti e un valore cliente più chiaro.",
      },
      {
        title: "Un modello che si può duplicare",
        text: "Esistono già modalità di lavoro, supporto e un passo successivo più chiaro per chi vuole iniziare. Questo rende più facile partire in piccolo e costruire con struttura nel tempo.",
      },
    ],
  },
};

const baseContent: Pick<Record<Lang, PartnerPageContent>, "sv" | "en"> = {
  sv: {
    hero: {
      badge: "Partnermöjlighet",
      title: "Det här är inte för alla",
      body: "Men om du vill bygga något långsiktigt inom hälsa, med riktiga produkter och återkommande kunder – då kan det vara värt att titta närmare.",
      primaryCta: "Ansök om att bli partner",
      secondaryCta: "Förstå modellen först",
      cards: [
        {
          title: "En produkt som är lätt att förstå",
          text: "Ett konkret blodtest gör det enklare att starta samtal om hälsa, eftersom kunden får något mätbart istället för vaga löften.",
          icon: FlaskConical,
        },
        {
          title: "Återkommande kundvärde",
          text: "När människor följer upp sina resultat och vill förbättra dem finns bättre förutsättningar för återköp än i engångsdrivna kategorier.",
          icon: CircleDollarSign,
        },
        {
          title: "En modell som kan skalas",
          text: "Med rätt struktur, rätt människor och en tydlig produkt går det att bygga stegvis – lokalt, digitalt och över tid.",
          icon: BarChart3,
        },
      ],
    },
    economics: {
      title: "Varför finns det utrymme för partnerintäkter i modellen?",
      body: "I traditionella kedjor passerar värdet genom flera externa led. När färre aktörer delar på samma värde kan mer stanna i modellen.",
      steps: [
        { label: "Labb / Produktion", value: "179 kr" },
        { label: "Varumärke / Import", value: "349 kr" },
        { label: "Grossist", value: "699 kr" },
        { label: "Slutkund", value: "1299 kr" },
      ],
      modelLabel: "Förenklad modell",
      modelBody: "Färre led skapar större utrymme för kundutbetalningar och partnerintäkter.",
      calloutTitle: "Poängen är inte hype. Poängen är en bättre värdekedja.",
      calloutBody: "Om mindre värde försvinner i externa mellanled skapas större utrymme för både bolaget och framtida partners. Det gör modellen mer logisk än många traditionella upplägg.",
      note: "Det här är inte magi. Det är marginalstruktur.",
    },
    reasons: {
      title: "Vad gör en partnermodell värd att bygga?",
      body: "Vi tror att starka partnermöjligheter bygger på låg tröskel att börja, ett system som redan finns på plats och en modell som går att utveckla stegvis över tid.",
      cards: [
        {
          title: "Låg tröskel att börja",
          text: "Du behöver inte bygga egen produkt, logistik eller ett stort upplägg från dag ett. Det gör vägen till start kortare och mer realistisk för fler.",
        },
        {
          title: "Systemet finns redan",
          text: "Produkter, infrastruktur och kundresa finns redan på plats. Det gör att mer fokus kan ligga på relationer, uppföljning och faktiskt arbete.",
        },
        {
          title: "Stöd och team runt dig",
          text: "Du bygger inte ensam. För många är det här ett första steg in i entreprenörskap med stöd, sammanhang och tydligare riktning.",
        },
        {
          title: "En etablerad global kategori",
          text: "Direktförsäljning är redan en stor internationell industri. För rätt person gör det modellen lättare att ta på allvar och bygga långsiktigt i.",
        },
      ],
    },
    fit: {
      title: "Vem passar det här för?",
      body: "Det här är inte för alla. Vi söker framför allt människor som vill arbeta långsiktigt och bygga med kvalitet.",
      columns: [
        {
          title: "Passar dig som...",
          items: [
            "tycker om att prata med människor på ett naturligt sätt",
            "vill bygga något stegvis, inte jaga snabba genvägar",
            "ser värdet i hälsa, data och tydliga resultat",
            "vill arbeta med ett erbjudande som känns modernt och relevant",
          ],
        },
        {
          title: "Det här är inget för dig som letar efter en snabb lösning.",
          items: [
            "förstår värdet av att arbeta långsiktigt",
            "vill arbeta med något de faktiskt kan stå för",
            "är bekväma med att bygga relationer, inte bara transaktioner",
            "ser affärsmässighet som en förutsättning, inte ett hinder",
          ],
        },
        {
          title: "Det vi värderar",
          items: ["seriositet", "självledarskap", "långsiktighet", "affärsetik", "förmåga att skapa förtroende"],
        },
      ],
    },
    steps: {
      title: "Vad händer efter att du ansöker?",
      body: "Processen är enkel och utan press. Vi vill först förstå vem du är, sedan visa modellen tydligt och därefter låta dig avgöra om det känns rätt.",
      items: [
        {
          title: "Vi går igenom din ansökan",
          text: "Vi läser dina svar för att förstå vad du söker och om det finns en rimlig match.",
        },
        {
          title: "Du får en kort genomgång av modellen",
          text: "Vi visar hur produkten, kundresan och partnerlogiken fungerar i praktiken.",
        },
        {
          title: "Du avgör om det är rätt för dig",
          text: "Målet är inte att pressa fram ett ja, utan att du ska kunna ta ställning i lugn och ro.",
        },
      ],
    },
    form: {
      title: "Nyfiken på att bli partner?",
      body: "Lämna dina uppgifter och några korta svar, så hör vi av oss om nästa steg.",
      name: "Namn",
      email: "E-post",
      phone: "Telefonnummer",
      company: "Företag eller team (valfritt)",
      interest: "Vad är du mest ute efter?",
      readiness: "Hur redo är du?",
      background: "Varför är detta intressant för dig?",
      interestOptions: [
        "Extra inkomst",
        "Bygga verksamhet",
        "Bara nyfiken",
      ],
      readinessOptions: ["Utforskar", "Vill testa", "Redo att köra"],
      submit: "Skicka intresseanm\u00e4lan",
      successTitle: "Tack. Din intresseanm\u00e4lan \u00e4r mottagen.",
      successBody: "Vi g\u00e5r nu igenom din anm\u00e4lan och \u00e5terkommer med n\u00e4sta steg.",
    },
    sticky: {
      text: "Utforska en modern partnermodell inom mätbar hälsa",
      cta: "Ansök om att bli partner",
    },
  },
  en: {
    hero: {
      badge: "Partner opportunity",
      title: "This is not for everyone",
      body: "But if you want to build something long term in health, with real products and recurring customers, it may be worth a closer look.",
      primaryCta: "Apply to become a partner",
      secondaryCta: "Understand the model first",
      cards: [
        { title: "A product that is easy to explain", text: "A clear blood test makes health conversations easier because the customer gets something measurable instead of vague promises.", icon: FlaskConical },
        { title: "Recurring customer value", text: "When people follow up on their results and want to improve them, repeat purchases become more realistic than in one-off categories.", icon: CircleDollarSign },
        { title: "A model that can scale", text: "With the right structure, the right people and a clear product, it can be built step by step over time.", icon: BarChart3 },
      ],
    },
    economics: {
      title: "Why is there room for partner income in the model?",
      body: "In traditional chains, value moves through multiple outside layers. When fewer actors share the same value, more can stay in the model.",
      steps: [
        { label: "Lab / Production", value: "SEK 179" },
        { label: "Brand / Import", value: "SEK 349" },
        { label: "Wholesale", value: "SEK 699" },
        { label: "End customer", value: "SEK 1299" },
      ],
      modelLabel: "Simplified model",
      modelBody: "Fewer layers create more room for customer payouts and partner income.",
      calloutTitle: "The point is not hype. The point is a stronger value chain.",
      calloutBody: "If less value disappears into outside middle layers, more room is created for both the company and future partners. That makes the model easier to understand than many traditional setups.",
      note: "This is not magic. It is margin structure.",
    },
    reasons: {
      title: "What makes a partner model worth building?",
      body: "We believe strong partner opportunities depend on a low barrier to start, a system that already exists and a model that can be built step by step over time.",
      cards: [
        { title: "Low barrier to start", text: "You do not need to create your own product, logistics or a large setup from day one. That makes the first step shorter and more realistic for more people." },
        { title: "The system already exists", text: "Products, infrastructure and the customer journey are already in place. That leaves more room to focus on relationships, follow-up and actual work." },
        { title: "Support and team around you", text: "You do not build alone. For many people, this becomes a first real step into entrepreneurship with guidance, context and clearer direction." },
        { title: "An established global category", text: "Direct selling is already a large international industry. For the right person, that makes the model easier to take seriously and build in over time." },
      ],
    },
    fit: {
      title: "Who is this for?",
      body: "This is not for everyone. We are mainly looking for people who want to work long term and build with quality.",
      columns: [
        { title: "A good fit if you...", items: ["enjoy speaking with people naturally", "want to build step by step instead of chasing shortcuts", "see the value in health, data and clear results", "want to work with something modern and relevant"] },
        { title: "A weaker fit if you...", items: ["want fast money without effort", "prefer hard selling to anyone", "lack patience for building trust and relationships", "mainly want a title or surface status"] },
        { title: "What we value", items: ["seriousness", "self-leadership", "long-term thinking", "business ethics", "the ability to build trust"] },
      ],
    },
    steps: {
      title: "What happens after you apply?",
      body: "The process is simple and without pressure. We first review your application, then explain the model clearly, and then you decide whether it feels right.",
      items: [
        { title: "We review your application", text: "We read your answers to understand what you are looking for and whether there is a reasonable fit." },
        { title: "You get a short walkthrough of the model", text: "We explain how the product, customer journey and partner logic work in practice." },
        { title: "You decide if it is right for you", text: "The goal is not to push for a yes, but to let you decide calmly whether it is a good match." },
      ],
    },
    form: {
      title: "Curious about becoming a partner?",
      body: "Leave your details and a few short answers, and we will get back to you about the next step.",
      name: "Name",
      email: "Email",
      phone: "Phone number",
      company: "Company or team (optional)",
      interest: "What are you mainly looking for?",
      readiness: "How ready are you?",
      background: "Why is this interesting to you?",
      interestOptions: ["Extra income", "Build a business", "Just curious"],
      readinessOptions: ["Exploring", "Want to test", "Ready to start"],
      submit: "Send partner application",
      successTitle: "Thank you, your application has been received.",
      successBody: "We will review your answers and reach out if there seems to be a reasonable match.",
    },
    sticky: {
      text: "Explore a modern partner model in measurable health",
      cta: "Apply to become a partner",
    },
  },
};

function buildLocalizedPartnerContent(lang: Exclude<Lang, "sv" | "en">): PartnerPageContent {
  const partner = t(lang).partner;

  return {
    hero: {
      badge: partner.heroBadge,
      title: partner.heroTitle,
      body: partner.heroBody,
      primaryCta: partner.heroPrimaryCta,
      secondaryCta: partner.heroSecondaryCta,
      cards: partner.highlights.map((item, index) => ({
        title: item.title,
        text: item.description,
        icon: [FlaskConical, CircleDollarSign, BarChart3][index] || BarChart3,
      })),
    },
    economics: {
      title: partner.economicsTitle,
      body: partner.economicsBody,
      steps: partner.economicsSteps,
      modelLabel: baseContent.en.economics.modelLabel,
      modelBody: baseContent.en.economics.modelBody,
      calloutTitle: partner.economicsCalloutTitle,
      calloutBody: partner.economicsCalloutBody,
      note: baseContent.en.economics.note,
    },
    reasons: {
      title: partner.reasonsTitle,
      body: partner.reasonsBody,
      cards: partner.reasons.map((item) => ({
        title: item.title,
        text: item.description,
      })),
    },
    fit: baseContent.en.fit,
    steps: baseContent.en.steps,
    form: {
      ...baseContent.en.form,
      title: partner.formTitle,
      body: partner.formBody,
      name: partner.formName,
      email: partner.formEmail,
      phone: partner.formPhone,
      company: partner.formCompany,
      background: partner.formMessage,
      submit: partner.formSubmit,
      successTitle: partner.formSuccessTitle,
      successBody: partner.formSuccessBody,
    },
    sticky: baseContent.en.sticky,
  };
}

const content: Record<Lang, PartnerPageContent> = {
  ...baseContent,
  no: buildLocalizedPartnerContent("no"),
  da: buildLocalizedPartnerContent("da"),
  fi: buildLocalizedPartnerContent("fi"),
  de: buildLocalizedPartnerContent("de"),
  fr: buildLocalizedPartnerContent("fr"),
  it: buildLocalizedPartnerContent("it"),
};

const economicsStepsByLang: Record<Lang, { label: string; value: string }[]> = {
  sv: [
    { label: "Labb / produktion", value: "249 kr" },
    { label: "Varumärke / import", value: "499 kr" },
    { label: "Grossist", value: "999 kr" },
    { label: "Butik", value: "1995 kr" },
  ],
  no: [
    { label: "Lab / produksjon", value: "NOK 279" },
    { label: "Merkevare / import", value: "NOK 559" },
    { label: "Grossist", value: "NOK 1119" },
    { label: "Butikk", value: "NOK 2239" },
  ],
  da: [
    { label: "Lab / produktion", value: "DKK 179" },
    { label: "Brand / import", value: "DKK 359" },
    { label: "Grossist", value: "DKK 719" },
    { label: "Butik", value: "DKK 1439" },
  ],
  fi: [
    { label: "Laboratorio / tuotanto", value: "EUR 23" },
    { label: "Brändi / tuonti", value: "EUR 46" },
    { label: "Tukku", value: "EUR 92" },
    { label: "Myymälä", value: "EUR 183" },
  ],
  en: [
    { label: "Lab / production", value: "EUR 23" },
    { label: "Brand / import", value: "EUR 46" },
    { label: "Wholesale", value: "EUR 92" },
    { label: "Retail", value: "EUR 183" },
  ],
  de: [
    { label: "Labor / Produktion", value: "EUR 23" },
    { label: "Marke / Import", value: "EUR 46" },
    { label: "Großhandel", value: "EUR 92" },
    { label: "Einzelhandel", value: "EUR 183" },
  ],
  fr: [
    { label: "Laboratoire / production", value: "EUR 23" },
    { label: "Marque / import", value: "EUR 46" },
    { label: "Grossiste", value: "EUR 92" },
    { label: "Magasin", value: "EUR 183" },
  ],
  it: [
    { label: "Laboratorio / produzione", value: "EUR 23" },
    { label: "Brand / import", value: "EUR 46" },
    { label: "Grossista", value: "EUR 92" },
    { label: "Negozio", value: "EUR 183" },
  ],
};

const economicsModelLabelByLang: Record<Lang, string> = {
  sv: "Förenklat räkneexempel",
  no: "Forenklet regneeksempel",
  da: "Forenklet regneeksempel",
  fi: "Yksinkertaistettu laskentaesimerkki",
  en: "Simplified example",
  de: "Vereinfachtes Rechenbeispiel",
  fr: "Exemple simplifié",
  it: "Esempio semplificato",
};

const economicsModelBodyByLang: Record<Lang, string> = {
  sv: "Exemplet visar hur generella påslag ofta byggs upp mellan produktion, varumärke, grossist och butik i vanliga distributionskedjor.",
  no: "Eksemplet viser hvordan generelle påslag ofte bygges opp mellom produksjon, merkevare, grossist og butikk i vanlige distribusjonskjeder.",
  da: "Eksemplet viser, hvordan generelle tillæg ofte bygges op mellem produktion, brand, grossist og butik i almindelige distributionskæder.",
  fi: "Esimerkki näyttää, miten yleiset katteet usein rakentuvat tuotannon, brändin, tukun ja myymälän välillä tavallisissa jakeluketjuissa.",
  en: "This example shows how general markups often build between production, brand, wholesale, and retail in ordinary distribution chains.",
  de: "Das Beispiel zeigt, wie sich allgemeine Aufschläge in klassischen Vertriebsketten oft zwischen Produktion, Marke, Großhandel und Einzelhandel aufbauen.",
  fr: "Cet exemple montre comment des marges générales se construisent souvent entre la production, la marque, le grossiste et le magasin dans des chaînes de distribution classiques.",
  it: "Questo esempio mostra come i ricarichi generali si costruiscano spesso tra produzione, brand, grossista e negozio nelle catene distributive tradizionali.",
};

const economicsCalloutTitleByLang: Record<Lang, string> = {
  sv: "Det här är ett generellt branschexempel, inte en specifik prislista.",
  no: "Dette er et generelt bransjeeksempel, ikke en spesifikk prisliste.",
  da: "Dette er et generelt brancheeksempel, ikke en specifik prisliste.",
  fi: "Tämä on yleinen toimialaesimerkki, ei tietyn yrityksen hinnasto.",
  en: "This is a general industry example, not a specific price list.",
  de: "Dies ist ein allgemeines Branchenbeispiel, keine konkrete Preisliste.",
  fr: "Il s'agit d'un exemple général du secteur, pas d'une liste de prix spécifique.",
  it: "Si tratta di un esempio generale di settore, non di un listino prezzi specifico.",
};

const economicsCalloutBodyByLang: Record<Lang, string> = {
  sv: "Poängen är att visa hur värde ofta fördelas när flera externa distributionsled lägger på sina marginaler. Det här avser inte Zinzinos faktiska priser.",
  no: "Poenget er å vise hvordan verdi ofte fordeles når flere eksterne distribusjonsledd legger på sine marginer. Dette viser ikke Zinzinos faktiske priser.",
  da: "Pointen er at vise, hvordan værdi ofte fordeles, når flere eksterne distributionsled lægger deres marginer på. Dette viser ikke Zinzinos faktiske priser.",
  fi: "Tarkoitus on havainnollistaa, miten arvo usein jakautuu, kun useat ulkoiset jakeluportaat lisäävät omat katteensa. Tämä ei kuvaa Zinzinon todellisia hintoja.",
  en: "The point is to illustrate how value is often distributed when several outside distribution layers add their own margins. This does not describe Zinzino's actual prices.",
  de: "Gemeint ist zu zeigen, wie sich Wert typischerweise verteilt, wenn mehrere externe Vertriebsstufen ihre Margen hinzufügen. Das beschreibt nicht die tatsächlichen Preise von Zinzino.",
  fr: "L'objectif est d'illustrer comment la valeur se répartit souvent lorsque plusieurs niveaux de distribution externes ajoutent leurs propres marges. Cela ne décrit pas les prix réels de Zinzino.",
  it: "L'obiettivo è illustrare come il valore venga spesso distribuito quando diversi livelli di distribuzione esterni aggiungono i propri margini. Questo non descrive i prezzi reali di Zinzino.",
};

const economicsNoteByLang: Record<Lang, string> = {
  sv: "Illustrativt räkneexempel baserat på generella branschpåslag.",
  no: "Illustrativt regneeksempel basert på generelle bransjepåslag.",
  da: "Illustrativt regneeksempel baseret på generelle branchetillæg.",
  fi: "Havainnollistava esimerkki, joka perustuu yleisiin toimialan katteisiin.",
  en: "Illustrative example based on general industry markups.",
  de: "Illustratives Beispiel auf Basis allgemeiner Branchenaufschläge.",
  fr: "Exemple illustratif fondé sur des marges générales du secteur.",
  it: "Esempio illustrativo basato su ricarichi generali di settore.",
};

const economicsIncreaseLabelByLang: Record<Lang, string> = {
  sv: "+100 % per led",
  no: "+100 % per ledd",
  da: "+100 % pr. led",
  fi: "+100 % per porras",
  en: "+100% per layer",
  de: "+100 % pro Stufe",
  fr: "+100 % par niveau",
  it: "+100% per livello",
};

const commercialApplicationDecisionOverridesByLang: Partial<Record<Lang, { checks: string[] }>> = {
  sv: {
    checks: [
      "Du vill bygga stegvis och långsiktigt, inte jaga snabba genvägar.",
      "Du är öppen för dialog, uppföljning och tydliga nästa steg.",
      "Du behöver inte kunna allt från start, men vill förstå tillräckligt för att gå vidare.",
    ],
  },
  no: {
    checks: [
      "Du vil bygge stegvis og langsiktig, ikke jage raske snarveier.",
      "Du er åpen for dialog, oppfølging og tydelige neste steg.",
      "Du trenger ikke kunne alt fra start, men vil forstå nok til å gå videre.",
    ],
  },
  da: {
    checks: [
      "Du vil bygge trin for trin og langsigtet, ikke jagte hurtige genveje.",
      "Du er åben for dialog, opfølgning og tydelige næste skridt.",
      "Du behøver ikke vide alt fra start, men vil forstå nok til at gå videre.",
    ],
  },
  fi: {
    checks: [
      "Haluat rakentaa vaiheittain ja pitkäjänteisesti etkä etsi nopeita oikoteitä.",
      "Olet avoin dialogille, seurannalle ja selkeille seuraaville askelille.",
      "Sinun ei tarvitse tietää kaikkea alusta asti, mutta haluat ymmärtää riittävästi voidaksesi edetä.",
    ],
  },
  en: {
    checks: [
      "You want to build step by step and for the long term, not chase shortcuts.",
      "You are open to dialogue, follow-up, and clear next steps.",
      "You do not need to know everything from day one, but you want to understand enough to move forward.",
    ],
  },
  de: {
    checks: [
      "Du willst Schritt für Schritt und langfristig aufbauen, statt schnellen Abkürzungen nachzujagen.",
      "Du bist offen für Dialog, Follow-up und klare nächste Schritte.",
      "Du musst nicht von Anfang an alles wissen, willst aber genug verstehen, um weiterzugehen.",
    ],
  },
  fr: {
    checks: [
      "Vous voulez construire étape par étape et dans la durée, pas courir après des raccourcis.",
      "Vous êtes ouvert au dialogue, au suivi et à des prochaines étapes claires.",
      "Vous n’avez pas besoin de tout savoir dès le départ, mais vous voulez comprendre suffisamment pour avancer.",
    ],
  },
  it: {
    checks: [
      "Vuoi costruire passo dopo passo e nel lungo periodo, non inseguire scorciatoie veloci.",
      "Sei aperto al dialogo, al follow-up e a prossimi passi chiari.",
      "Non devi sapere tutto fin dall’inizio, ma vuoi capire abbastanza per andare avanti.",
    ],
  },
};

const economicsTraditionalLabelByLang: Record<Lang, string> = {
  sv: "Traditionell kedja",
  no: "Tradisjonell kjede",
  da: "Traditionel kæde",
  fi: "Perinteinen ketju",
  en: "Traditional chain",
  de: "Traditionelle Kette",
  fr: "Chaîne traditionnelle",
  it: "Catena tradizionale",
};

const economicsTraditionalBodyByLang: Record<Lang, string> = {
  sv: "Varje extra extern aktör lägger på sin marginal. Då växer slutpriset steg för steg innan kunden ens är framme.",
  no: "Hver ekstra ekstern aktør legger på sin margin. Da vokser sluttprisen trinn for trinn før kunden i det hele tatt er fremme.",
  da: "Hver ekstra ekstern aktør lægger sin margin oveni. Så vokser slutprisen trin for trin, før kunden overhovedet er nået frem.",
  fi: "Jokainen ulkoinen lisäporras lisää oman katteensa. Silloin loppuhinta nousee askel askeleelta jo ennen kuin tuote on asiakkaalla.",
  en: "Each extra outside actor adds its own margin. That makes the end price climb step by step before the customer is even reached.",
  de: "Jede zusätzliche externe Stufe legt ihre eigene Marge oben drauf. So steigt der Endpreis Schritt für Schritt, bevor der Kunde überhaupt erreicht ist.",
  fr: "Chaque acteur externe supplémentaire ajoute sa propre marge. Le prix final monte donc étape par étape avant même d’arriver au client.",
  it: "Ogni attore esterno aggiuntivo inserisce il proprio margine. Così il prezzo finale sale passo dopo passo prima ancora di arrivare al cliente.",
};

const economicsDirectLabelByLang: Record<Lang, string> = {
  sv: "Direktmodell",
  no: "Direktemodell",
  da: "Direkte model",
  fi: "Suora malli",
  en: "Direct model",
  de: "Direktmodell",
  fr: "Modèle direct",
  it: "Modello diretto",
};

const economicsDirectBodyByLang: Record<Lang, string> = {
  sv: "När flera externa led kapas uppstår ett marginalutrymme som inte längre behöver tas av grossist- och butiksmarginaler.",
  no: "Når flere eksterne ledd kuttes bort, oppstår et marginrom som ikke lenger trenger å spises opp av grossist- og butikkmarginer.",
  da: "Når flere eksterne led skæres væk, opstår der et marginrum, som ikke længere behøver at blive spist op af grossist- og butiksmarginer.",
  fi: "Kun useita ulkoisia portaita poistetaan, syntyy marginaalitilaa, jota tukku- ja myymälämarginaalit eivät enää syö pois.",
  en: "When several outside layers are removed, margin room appears that no longer has to be absorbed by wholesale and retail margins.",
  de: "Wenn mehrere externe Stufen wegfallen, entsteht ein freier Spielraum, der nicht länger von Großhandels- und Einzelhandelsmargen aufgezehrt wird.",
  fr: "Lorsque plusieurs niveaux externes disparaissent, une réserve de valeur apparaît au lieu d’être absorbée par les marges du grossiste et du magasin.",
  it: "Quando diversi livelli esterni vengono eliminati, si libera uno spazio economico che non deve più essere assorbito dai margini di grossista e negozio.",
};

const economicsSplitTitleByLang: Record<Lang, string> = {
  sv: "Så kan den frigjorda marginalen delas",
  no: "Slik kan den frigjorte marginen deles",
  da: "Sådan kan den frigjorte margin deles",
  fi: "Näin vapautunut marginaali voidaan jakaa",
  en: "How the freed-up margin can be shared",
  de: "So kann die frei gewordene Marge verteilt werden",
  fr: "Comment la marge libérée peut être répartie",
  it: "Come può essere condiviso il margine liberato",
};

const economicsSplitBodyByLang: Record<Lang, string> = {
  sv: "När pengar inte försvinner i onödiga led kan samma marginalutrymme i stället delas mellan bolaget och partner-/ZZ-ledet.",
  no: "Når penger ikke forsvinner i unødvendige ledd, kan det samme marginrommet i stedet deles mellom selskapet og partner-/ZZ-leddet.",
  da: "Når penge ikke forsvinder i unødvendige led, kan det samme marginrum i stedet deles mellem selskabet og partner-/ZZ-leddet.",
  fi: "Kun raha ei katoa turhiin portaisiin, sama marginaalitila voidaan jakaa yrityksen ja partneri-/ZZ-tason välillä.",
  en: "When money does not disappear into unnecessary layers, the same margin room can instead be shared between the company and the partner/ZZ layer.",
  de: "Wenn Geld nicht in unnötigen Stufen verschwindet, kann derselbe Spielraum stattdessen zwischen Unternehmen und Partner-/ZZ-Ebene geteilt werden.",
  fr: "Lorsque l’argent ne disparaît pas dans des niveaux inutiles, la même réserve peut alors être partagée entre l’entreprise et le niveau partenaire/ZZ.",
  it: "Quando il denaro non scompare in livelli inutili, lo stesso spazio economico può invece essere condiviso tra azienda e livello partner/ZZ.",
};

const economicsSplitCompanyLabelByLang: Record<Lang, string> = {
  sv: "Bolaget",
  no: "Selskapet",
  da: "Selskabet",
  fi: "Yhtiö",
  en: "Company",
  de: "Unternehmen",
  fr: "Entreprise",
  it: "Azienda",
};

const economicsSplitPartnerLabelByLang: Record<Lang, string> = {
  sv: "Partner / ZZ",
  no: "Partner / ZZ",
  da: "Partner / ZZ",
  fi: "Partneri / ZZ",
  en: "Partner / ZZ",
  de: "Partner / ZZ",
  fr: "Partenaire / ZZ",
  it: "Partner / ZZ",
};

const economicsSplitValueByLang: Record<Lang, string> = {
  sv: "50 %",
  no: "50 %",
  da: "50 %",
  fi: "50 %",
  en: "50%",
  de: "50 %",
  fr: "50 %",
  it: "50%",
};

const economicsSplitNoteByLang: Record<Lang, string> = {
  sv: "Förenklad pedagogisk bild av hur ett frigjort marginalutrymme kan delas när externa mellanled kapas. Det är inte en officiell payout-tabell.",
  no: "Forenklet pedagogisk bilde av hvordan et frigjort marginrom kan deles når eksterne mellomledd kuttes. Dette er ikke en offisiell payout-tabell.",
  da: "Forenklet pædagogisk billede af, hvordan et frigjort marginrum kan deles, når eksterne mellemled fjernes. Dette er ikke en officiel payout-tabel.",
  fi: "Yksinkertaistettu havainnollistus siitä, miten vapautunut marginaalitila voidaan jakaa, kun ulkoisia väliportaita poistetaan. Tämä ei ole virallinen payout-taulukko.",
  en: "A simplified teaching example of how freed-up margin room can be shared when outside middle layers are removed. It is not an official payout table.",
  de: "Vereinfachtes Schaubild dafür, wie ein eingesparter Spielraum verteilt werden kann, wenn externe Zwischenstufen entfallen. Dies ist keine offizielle Auszahlungstabelle.",
  fr: "Illustration pédagogique simplifiée de la manière dont une réserve économisée peut être répartie lorsque les intermédiaires externes sont supprimés. Ce n’est pas un tableau de rémunération officiel.",
  it: "Schema semplificato per mostrare come uno spazio economico risparmiato possa essere condiviso quando i livelli intermedi esterni vengono rimossi. Non è una tabella payout ufficiale.",
};

const economicsConclusionByLang: Record<Lang, string> = {
  sv: "Po\u00e4ngen \u00e4r inte ett l\u00e4gre slutpris. Po\u00e4ngen \u00e4r att samma v\u00e4rde kan f\u00f6rdelas annorlunda.",
  no: "Poenget er ikke en lavere sluttpris. Poenget er at den samme verdien kan fordeles annerledes.",
  da: "Pointen er ikke en lavere slutpris. Pointen er, at den samme v\u00e6rdi kan fordeles anderledes.",
  fi: "Pointti ei ole alempi loppuhinta. Pointti on, ett\u00e4 sama arvo voidaan jakaa eri tavalla.",
  en: "The point is not a lower end price. The point is that the same value can be distributed differently.",
  de: "Der Punkt ist nicht ein niedrigerer Endpreis. Der Punkt ist, dass derselbe Wert anders verteilt werden kann.",
  fr: "L'id\u00e9e n'est pas un prix final plus bas. L'id\u00e9e est que la m\u00eame valeur peut \u00eatre r\u00e9partie autrement.",
  it: "Il punto non \u00e8 un prezzo finale pi\u00f9 basso. Il punto \u00e8 che lo stesso valore pu\u00f2 essere distribuito in modo diverso.",
};

const heroOverridesByLang: Partial<Record<Lang, PartnerPageContent["hero"]>> = {
  sv: {
    badge: "Partnermöjlighet",
    title: "Bygg en partnerverksamhet kring ett testbaserat hälsokoncept",
    body: "För dig som tror på mätning, tydlighet och långsiktighet. Vi tror att testbaserad hälsa kommer att bli allt mer relevant de kommande åren, och att den som bygger seriöst redan nu står starkare längre fram.",
    primaryCta: "Ansök om att bli partner",
    secondaryCta: "Se hur det fungerar",
    cards: [
      {
        title: "Ett konkret koncept att stå för",
        text: "Ett testbaserat erbjudande är lättare att förklara än vaga hälsolöften. Kunden får något mätbart att utgå från.",
        icon: FlaskConical,
      },
      {
        title: "Bättre grund för återkommande kunder",
        text: "När människor följer upp sina resultat över tid blir kundresan mer långsiktig än i rena engångskategorier.",
        icon: CircleDollarSign,
      },
      {
        title: "Relevant i en marknad som mognar",
        text: "Intresset för biomarkörer, uppföljning och mer faktabaserade hälsobeslut växer. Det gör kategorin intressant på 3-5 års sikt.",
        icon: BarChart3,
      },
    ],
  },
  en: {
    badge: "Partner opportunity",
    title: "Build a partner business around a test-based health concept",
    body: "For people who believe in measurement, clarity, and long-term thinking. We believe test-based health will become more relevant over the next few years, and that serious builders who start early will be better positioned.",
    primaryCta: "Apply to become a partner",
    secondaryCta: "See how it works",
    cards: [
      {
        title: "A concept you can stand behind",
        text: "A test-based offer is easier to explain than vague wellness promises. The customer starts with something measurable.",
        icon: FlaskConical,
      },
      {
        title: "A stronger basis for recurring customers",
        text: "When people follow up on their results over time, the customer relationship becomes more durable than in one-off categories.",
        icon: CircleDollarSign,
      },
      {
        title: "Relevant in a maturing market",
        text: "Interest in biomarkers, follow-up, and more fact-based health decisions is growing. That makes the category more interesting over a 3-5 year horizon.",
        icon: BarChart3,
      },
    ],
  },
  no: {
    badge: "Partnermulighet",
    title: "Bygg en partnervirksomhet rundt et testbasert helsekonsept",
    body: "For deg som tror på måling, tydelighet og langsiktighet. Vi tror at testbasert helse vil bli stadig mer relevant de kommende årene, og at den som bygger seriøst allerede nå står sterkere senere.",
    primaryCta: "Søk om å bli partner",
    secondaryCta: "Se hvordan det fungerer",
    cards: [
      {
        title: "Et konkret konsept å stå for",
        text: "Et testbasert tilbud er lettere å forklare enn diffuse helseløfter. Kunden får noe målbart å ta utgangspunkt i.",
        icon: FlaskConical,
      },
      {
        title: "Bedre grunnlag for tilbakevendende kunder",
        text: "Når mennesker følger opp resultatene sine over tid, blir kundereisen mer langsiktig enn i rene engangskategorier.",
        icon: CircleDollarSign,
      },
      {
        title: "Relevant i et marked som modnes",
        text: "Interessen for biomarkører, oppfølging og mer faktabaserte helsebeslutninger vokser. Det gjør kategorien interessant i et 3-5 års perspektiv.",
        icon: BarChart3,
      },
    ],
  },
  da: {
    badge: "Partnermulighed",
    title: "Byg en partnerforretning omkring et testbaseret sundhedskoncept",
    body: "For dig, der tror på måling, tydelighed og langsigtet opbygning. Vi tror, at testbaseret sundhed vil blive mere relevant de kommende år, og at den som bygger seriøst nu, står stærkere senere.",
    primaryCta: "Ansøg om at blive partner",
    secondaryCta: "Se hvordan det fungerer",
    cards: [
      {
        title: "Et konkret koncept at stå på mål for",
        text: "Et testbaseret tilbud er lettere at forklare end diffuse sundhedsløfter. Kunden får noget målbart at tage udgangspunkt i.",
        icon: FlaskConical,
      },
      {
        title: "Bedre grundlag for tilbagevendende kunder",
        text: "Når mennesker følger deres resultater over tid, bliver kunderejsen mere langsigtet end i rene engangskategorier.",
        icon: CircleDollarSign,
      },
      {
        title: "Relevant i et marked, der modnes",
        text: "Interessen for biomarkører, opfølgning og mere faktabaserede sundhedsbeslutninger vokser. Det gør kategorien interessant i et 3-5 års perspektiv.",
        icon: BarChart3,
      },
    ],
  },
  fi: {
    badge: "Partnerimahdollisuus",
    title: "Rakenna partneriliiketoimintaa testipohjaisen terveyskonseptin ympärille",
    body: "Sinulle, joka uskot mittaamiseen, selkeyteen ja pitkäjänteisyyteen. Uskomme, että testipohjainen terveys tulee olemaan yhä relevantimpaa tulevina vuosina, ja että vakavasti nyt rakentava on myöhemmin vahvemmassa asemassa.",
    primaryCta: "Hae partneriksi",
    secondaryCta: "Katso miten se toimii",
    cards: [
      {
        title: "Konkreettinen konsepti, jonka takana voi seistä",
        text: "Testipohjainen tarjous on helpompi selittää kuin epämääräiset hyvinvointilupaukset. Asiakas saa jotain mitattavaa, josta lähteä liikkeelle.",
        icon: FlaskConical,
      },
      {
        title: "Parempi perusta toistuvalle asiakkuudelle",
        text: "Kun ihmiset seuraavat tuloksiaan ajan myötä, asiakassuhteesta tulee pitkäjänteisempi kuin kertaluonteisissa kategorioissa.",
        icon: CircleDollarSign,
      },
      {
        title: "Relevantti kypsyvässä markkinassa",
        text: "Kiinnostus biomarkkereihin, seurantaan ja faktapohjaisempiin terveyspäätöksiin kasvaa. Siksi kategoriassa on kiinnostavaa potentiaalia 3-5 vuoden tähtäimellä.",
        icon: BarChart3,
      },
    ],
  },
  de: {
    badge: "Partnerchance",
    title: "Baue ein Partnergeschäft rund um ein testbasiertes Gesundheitskonzept auf",
    body: "Für Menschen, die an Messbarkeit, Klarheit und langfristiges Arbeiten glauben. Wir sind überzeugt, dass testbasierte Gesundheit in den kommenden Jahren relevanter wird und dass seriöse Aufbauarbeit heute später besser positioniert ist.",
    primaryCta: "Als Partner bewerben",
    secondaryCta: "So funktioniert es",
    cards: [
      {
        title: "Ein klares Konzept, hinter dem man stehen kann",
        text: "Ein testbasiertes Angebot lässt sich leichter erklären als diffuse Gesundheitsversprechen. Der Kunde startet mit etwas Messbarem.",
        icon: FlaskConical,
      },
      {
        title: "Bessere Grundlage für wiederkehrende Kunden",
        text: "Wenn Menschen ihre Ergebnisse über die Zeit verfolgen, entsteht eine belastbarere Kundenbeziehung als in reinen Einmalkategorien.",
        icon: CircleDollarSign,
      },
      {
        title: "Relevant in einem reifenden Markt",
        text: "Das Interesse an Biomarkern, Verlaufskontrolle und faktenbasierten Gesundheitsentscheidungen wächst. Das macht die Kategorie auf Sicht von 3-5 Jahren interessant.",
        icon: BarChart3,
      },
    ],
  },
  fr: {
    badge: "Opportunité partenaire",
    title: "Développez une activité partenaire autour d'un concept de santé fondé sur le test",
    body: "Pour celles et ceux qui croient à la mesure, à la clarté et à la construction dans la durée. Nous pensons que la santé fondée sur le test va gagner en importance dans les années à venir, et que ceux qui construisent sérieusement dès maintenant seront mieux placés ensuite.",
    primaryCta: "Postuler comme partenaire",
    secondaryCta: "Voir comment cela fonctionne",
    cards: [
      {
        title: "Un concept concret que l'on peut assumer",
        text: "Une offre fondée sur le test est plus facile à expliquer que des promesses santé vagues. Le client part de quelque chose de mesurable.",
        icon: FlaskConical,
      },
      {
        title: "Une base plus solide pour des clients récurrents",
        text: "Lorsque les personnes suivent leurs résultats dans le temps, la relation client devient plus durable que dans des catégories purement ponctuelles.",
        icon: CircleDollarSign,
      },
      {
        title: "Pertinent dans un marché en maturation",
        text: "L'intérêt pour les biomarqueurs, le suivi et des décisions santé plus factuelles progresse. Cela rend la catégorie intéressante sur un horizon de 3 à 5 ans.",
        icon: BarChart3,
      },
    ],
  },
  it: {
    badge: "Opportunità partner",
    title: "Costruisci un'attività partner attorno a un concetto di salute basato sul test",
    body: "Per chi crede nella misurazione, nella chiarezza e nella costruzione nel lungo periodo. Pensiamo che la salute basata sul test diventerà sempre più rilevante nei prossimi anni, e che chi costruisce seriamente già oggi sarà più forte domani.",
    primaryCta: "Candidati come partner",
    secondaryCta: "Scopri come funziona",
    cards: [
      {
        title: "Un concetto concreto dietro cui stare",
        text: "Un'offerta basata sul test è più facile da spiegare rispetto a promesse salute vaghe. Il cliente parte da qualcosa di misurabile.",
        icon: FlaskConical,
      },
      {
        title: "Una base migliore per clienti ricorrenti",
        text: "Quando le persone seguono i propri risultati nel tempo, la relazione con il cliente diventa più solida rispetto alle categorie da acquisto singolo.",
        icon: CircleDollarSign,
      },
      {
        title: "Rilevante in un mercato che matura",
        text: "L'interesse per biomarcatori, monitoraggio e decisioni salute più basate sui dati sta crescendo. Questo rende la categoria interessante su un orizzonte di 3-5 anni.",
        icon: BarChart3,
      },
    ],
  },
};

const reasonsOverridesByLang: Partial<Record<Lang, PartnerPageContent["reasons"]>> = {
  sv: {
    title: "Vad som gör modellen hållbar över tid",
    body: "Det här blocket är för dig som vill förstå vad som gör modellen mer långsiktig än många kortsiktiga hälsoupplägg.",
    cards: [
      {
        title: "Mätning före antaganden",
        text: "Det är lättare att skapa förtroende när erbjudandet utgår från test och uppföljning, inte bara allmänna hälsopåståenden.",
      },
      {
        title: "Ett mer vuxet hälsosamtal",
        text: "Testbaserad hälsa gör det lättare att föra relevanta samtal med människor som söker tydlighet, inte hype.",
      },
      {
        title: "Mer långsiktig kundlogik",
        text: "När kunden kan mäta, följa upp och förbättra över tid blir relationen starkare än vid ett enstaka köp.",
      },
      {
        title: "Rätt i tiden",
        text: "Intresset för mer mätbar, personlig och uppföljningsbar hälsa växer. Det gör att testbaserad hälsa kan bli en betydligt större kategori de kommande åren än många traditionella hälsoupplägg.",
      },
    ],
  },
  en: {
    title: "What makes the model durable over time",
    body: "This section is for people who want to understand what can make the model more durable than many short-term health setups.",
    cards: [
      {
        title: "Measurement before assumptions",
        text: "It is easier to build trust when the offer starts with testing and follow-up rather than broad wellness claims.",
      },
      {
        title: "A more mature health conversation",
        text: "Test-based health makes it easier to have relevant conversations with people who want clarity, not hype.",
      },
      {
        title: "More durable customer logic",
        text: "When customers can test, follow up, and improve over time, the relationship becomes stronger than a single transaction.",
      },
      {
        title: "Well timed",
        text: "Interest in more measurable, personal, and trackable health is growing. That makes test-based health a category that could become meaningfully larger over the coming years than many traditional health setups.",
      },
    ],
  },
  no: {
    title: "Hva som gjør modellen holdbar over tid",
    body: "Denne delen er for deg som vil forstå hva som kan gjøre modellen mer langsiktig enn mange kortsiktige helseopplegg.",
    cards: [
      {
        title: "Måling før antakelser",
        text: "Det er lettere å bygge tillit når tilbudet tar utgangspunkt i test og oppfølging, ikke bare generelle helsepåstander.",
      },
      {
        title: "Et mer voksent helsesamtale",
        text: "Testbasert helse gjør det lettere å ha relevante samtaler med mennesker som søker tydelighet, ikke hype.",
      },
      {
        title: "Mer langsiktig kundelogikk",
        text: "Når kunden kan måle, følge opp og forbedre over tid, blir relasjonen sterkere enn ved et enkelt kjøp.",
      },
      {
        title: "Riktig i tiden",
        text: "Interessen for mer målbar, personlig og oppfølgbar helse vokser. Det gjør at testbasert helse kan bli en langt større kategori i årene som kommer enn mange tradisjonelle helseopplegg.",
      },
    ],
  },
  da: {
    title: "Hvad der gør modellen holdbar over tid",
    body: "Denne del er til dig, der vil forstå, hvad der kan gøre modellen mere langsigtet end mange kortsigtede sundhedsoplæg.",
    cards: [
      {
        title: "Måling før antagelser",
        text: "Det er lettere at skabe tillid, når tilbuddet tager udgangspunkt i test og opfølgning, ikke kun i generelle sundhedspåstande.",
      },
      {
        title: "En mere voksen sundhedssamtale",
        text: "Testbaseret sundhed gør det lettere at have relevante samtaler med mennesker, der søger tydelighed, ikke hype.",
      },
      {
        title: "Mere langsigtet kundelogik",
        text: "Når kunden kan måle, følge op og forbedre over tid, bliver relationen stærkere end ved et enkelt køb.",
      },
      {
        title: "God timing",
        text: "Interessen for mere målbar, personlig og opfølgningsbar sundhed vokser. Det gør, at testbaseret sundhed kan blive en markant større kategori i de kommende år end mange traditionelle sundhedsoplæg.",
      },
    ],
  },
  fi: {
    title: "Mikä tekee mallista kestävän ajan yli",
    body: "Tämä osio on sinulle, joka haluat ymmärtää, mikä voi tehdä mallista pitkäjänteisemmän kuin monet lyhytkestoiset terveysratkaisut.",
    cards: [
      {
        title: "Mittaaminen ennen oletuksia",
        text: "Luottamusta on helpompi rakentaa, kun tarjous perustuu testiin ja seurantaan eikä vain yleisiin hyvinvointiväitteisiin.",
      },
      {
        title: "Kypsempi keskustelu terveydestä",
        text: "Testipohjainen terveys helpottaa merkityksellisiä keskusteluja ihmisten kanssa, jotka etsivät selkeyttä eivätkä hypeä.",
      },
      {
        title: "Pitkäjänteisempi asiakaslogiikka",
        text: "Kun asiakas voi mitata, seurata ja parantaa ajan myötä, suhteesta tulee vahvempi kuin yksittäisessä ostossa.",
      },
      {
        title: "Hyvä ajoitus",
        text: "Uskomme, että kiinnostus mitattavampaan ja yksilöllisempään terveyteen kasvaa edelleen tulevina vuosina.",
      },
    ],
  },
  de: {
    title: "Was das Modell auf Dauer tragfähig macht",
    body: "Dieser Abschnitt ist für alle, die verstehen möchten, was das Modell langfristig belastbarer machen kann als viele kurzfristige Gesundheitskonzepte.",
    cards: [
      {
        title: "Messung statt Vermutung",
        text: "Vertrauen lässt sich leichter aufbauen, wenn das Angebot mit Test und Verlaufskontrolle beginnt und nicht mit allgemeinen Gesundheitsversprechen.",
      },
      {
        title: "Ein reiferes Gesundheitsgespräch",
        text: "Testbasierte Gesundheit erleichtert relevante Gespräche mit Menschen, die Klarheit suchen und keine Übertreibung.",
      },
      {
        title: "Tragfähigere Kundenlogik",
        text: "Wenn Kunden über die Zeit messen, verfolgen und verbessern können, wird die Beziehung belastbarer als bei einem Einzelkauf.",
      },
      {
        title: "Gutes Timing",
        text: "Wir erwarten, dass das Interesse an messbarer und individueller Gesundheit in den kommenden Jahren weiter wächst.",
      },
    ],
  },
  fr: {
    title: "Ce qui rend le modèle durable dans le temps",
    body: "Cette section s'adresse à ceux qui veulent comprendre ce qui peut rendre le modèle plus durable que beaucoup d'approches santé à court terme.",
    cards: [
      {
        title: "La mesure avant les suppositions",
        text: "Il est plus facile de créer de la confiance lorsque l'offre commence par le test et le suivi, plutôt que par des promesses santé trop générales.",
      },
      {
        title: "Une conversation santé plus mature",
        text: "La santé fondée sur le test facilite des échanges pertinents avec des personnes qui recherchent de la clarté, pas du battage.",
      },
      {
        title: "Une logique client plus durable",
        text: "Quand le client peut mesurer, suivre et améliorer dans le temps, la relation devient plus solide qu'avec un achat ponctuel.",
      },
      {
        title: "Le bon moment",
        text: "Nous pensons que l'intérêt pour une santé plus mesurable et plus individualisée continuera à progresser dans les années à venir.",
      },
    ],
  },
  it: {
    title: "Cosa rende il modello solido nel tempo",
    body: "Questa sezione è per chi vuole capire cosa può rendere il modello più duraturo rispetto a molti percorsi salute di breve periodo.",
    cards: [
      {
        title: "Misurazione prima delle supposizioni",
        text: "È più facile costruire fiducia quando l'offerta parte da test e monitoraggio, e non da promesse salute troppo generiche.",
      },
      {
        title: "Una conversazione sulla salute più matura",
        text: "La salute basata sul test rende più semplici conversazioni rilevanti con persone che cercano chiarezza, non enfasi.",
      },
      {
        title: "Una logica cliente più duratura",
        text: "Quando il cliente può misurare, seguire e migliorare nel tempo, la relazione diventa più forte rispetto a un acquisto singolo.",
      },
      {
        title: "Il momento è favorevole",
        text: "Pensiamo che l'interesse per una salute più misurabile e più personalizzata continuerà a crescere nei prossimi anni.",
      },
    ],
  },
};

const fitOverridesByLang: Partial<Record<Lang, PartnerPageContent["fit"]>> = {
  sv: {
    title: "Vem passar det här för?",
    body: "Det här passar bäst för personer som vill bygga något seriöst vid sidan av, tror på testbaserad hälsa och är bekväma med att arbeta stegvis.",
    columns: [
      {
        title: "Det här är för dig som...",
        items: [
          "tror på testbaserad och mer faktadriven hälsa",
          "vill bygga stegvis i stället för att jaga snabba genvägar",
          "vill ha en seriös sidobana med tydligare struktur",
          "är bekväm med att skapa relationer och förtroende",
        ],
      },
      {
        title: "Det här passar sämre om du...",
        items: [
          "letar efter en snabb lösning eller en titel",
          "hellre säljer hårt än bygger tillit",
          "vill ha något som känns enkelt men ytligt",
          "saknar tålamod för att bygga över tid",
        ],
      },
      {
        title: "Det vi värderar",
        items: ["seriositet", "självledarskap", "långsiktighet", "affärsetik", "förmåga att skapa förtroende"],
      },
    ],
  },
  no: {
    title: "Hvem passer dette for?",
    body: "Dette er ikke for alle. Vi ser først og fremst etter personer som vil arbeide seriøst, langsiktig og med noe de faktisk kan stå inne for.",
    columns: [
      {
        title: "Passer deg som...",
        items: [
          "tror på testbasert og mer faktadrevet helse",
          "vil bygge steg for steg, ikke jage raske snarveier",
          "er komfortabel med å skape relasjoner og tillit",
          "vil arbeide med noe som føles relevant også fremover",
        ],
      },
      {
        title: "Passer dårligere hvis du...",
        items: [
          "leter etter en rask løsning eller en tittel",
          "heller vil selge hardt enn bygge tillit",
          "vil ha noe som virker enkelt men overfladisk",
          "mangler tålmodighet til å bygge over tid",
        ],
      },
      {
        title: "Det vi verdsetter",
        items: ["seriøsitet", "selvledelse", "langsiktighet", "forretningsetikk", "evne til å skape tillit"],
      },
    ],
  },
  da: {
    title: "Hvem passer dette til?",
    body: "Det her er ikke for alle. Vi leder først og fremmest efter personer, der vil arbejde seriøst, langsigtet og med noget, de reelt kan stå på mål for.",
    columns: [
      {
        title: "Passer dig som...",
        items: [
          "tror på testbaseret og mere faktadrevet sundhed",
          "vil bygge trin for trin i stedet for at jagte hurtige genveje",
          "er tryg ved at skabe relationer og tillid",
          "vil arbejde med noget, der også føles relevant fremadrettet",
        ],
      },
      {
        title: "Passer dårligere hvis du...",
        items: [
          "leder efter en hurtig løsning eller en titel",
          "hellere vil presse salg igennem end bygge troværdighed",
          "vil have noget, der virker let men overfladisk",
          "mangler tålmodighed til at bygge over tid",
        ],
      },
      {
        title: "Det vi vægter",
        items: ["seriøsitet", "selvledelse", "langsigtethed", "forretningsetik", "evnen til at skabe tillid"],
      },
    ],
  },
  fi: {
    title: "Kenelle tämä sopii?",
    body: "Tämä ei ole kaikille. Etsimme ennen kaikkea ihmisiä, jotka haluavat työskennellä vakavasti, pitkäjänteisesti ja sellaisen asian parissa, jonka takana he voivat aidosti seistä.",
    columns: [
      {
        title: "Sopii sinulle jos...",
        items: [
          "uskot testipohjaiseen ja aiempaa faktapohjaisempaan terveyteen",
          "haluat rakentaa askel askeleelta etkä etsi pikaratkaisuja",
          "koet luontevaksi luoda suhteita ja luottamusta",
          "haluat työskennellä jonkin kanssa, joka tuntuu relevantilta myös jatkossa",
        ],
      },
      {
        title: "Sopii heikommin jos...",
        items: [
          "etsit nopeaa ratkaisua tai pelkkää titteliä",
          "myisit mieluummin kovaa kuin rakentaisit luottamusta",
          "haluat jotain, joka tuntuu helpolta mutta pinnalliselta",
          "sinulta puuttuu kärsivällisyys rakentaa ajan kanssa",
        ],
      },
      {
        title: "Mitä arvostamme",
        items: ["vakavuus", "itsensä johtaminen", "pitkäjänteisyys", "liiketoimintaetiikka", "kyky rakentaa luottamusta"],
      },
    ],
  },
  de: {
    title: "Für wen ist das geeignet?",
    body: "Das ist nicht für alle. Wir suchen vor allem Menschen, die seriös, langfristig und mit etwas arbeiten wollen, hinter dem sie wirklich stehen können.",
    columns: [
      {
        title: "Passt zu dir, wenn du...",
        items: [
          "an testbasierte und stärker faktenorientierte Gesundheit glaubst",
          "Schritt für Schritt aufbauen willst statt nach schnellen Abkürzungen zu suchen",
          "Beziehungen und Vertrauen bewusst aufbauen kannst",
          "mit etwas arbeiten möchtest, das auch in Zukunft relevant wirkt",
        ],
      },
      {
        title: "Passt weniger, wenn du...",
        items: [
          "eine schnelle Lösung oder nur einen Titel suchst",
          "lieber Druck im Verkauf machst als Vertrauen aufzubauen",
          "etwas willst, das leicht wirkt, aber oberflächlich bleibt",
          "nicht die Geduld hast, über Zeit aufzubauen",
        ],
      },
      {
        title: "Was wir schätzen",
        items: ["Seriosität", "Selbstführung", "Langfristigkeit", "Geschäftsethik", "Fähigkeit, Vertrauen aufzubauen"],
      },
    ],
  },
  fr: {
    title: "À qui cela convient-il ?",
    body: "Ce n'est pas pour tout le monde. Nous recherchons surtout des personnes qui veulent travailler avec sérieux, dans la durée, et autour de quelque chose qu'elles peuvent réellement assumer.",
    columns: [
      {
        title: "Cela vous correspond si...",
        items: [
          "vous croyez à une santé fondée sur le test et davantage sur les faits",
          "vous voulez construire étape par étape plutôt que chercher des raccourcis",
          "vous êtes à l'aise pour créer de la relation et de la confiance",
          "vous voulez travailler avec quelque chose qui restera pertinent",
        ],
      },
      {
        title: "Cela convient moins si...",
        items: [
          "vous cherchez une solution rapide ou un simple statut",
          "vous préférez pousser la vente plutôt que construire la confiance",
          "vous voulez quelque chose de facile mais superficiel",
          "vous manquez de patience pour construire dans le temps",
        ],
      },
      {
        title: "Ce que nous valorisons",
        items: ["sérieux", "autonomie", "vision à long terme", "éthique commerciale", "capacité à créer de la confiance"],
      },
    ],
  },
  it: {
    title: "Per chi è adatto?",
    body: "Non è per tutti. Cerchiamo soprattutto persone che vogliono lavorare con serietà, nel lungo periodo e con qualcosa dietro cui possano davvero stare.",
    columns: [
      {
        title: "Fa per te se...",
        items: [
          "credi in una salute basata sul test e più orientata ai fatti",
          "vuoi costruire passo dopo passo invece di cercare scorciatoie",
          "ti senti a tuo agio nel creare relazioni e fiducia",
          "vuoi lavorare con qualcosa che resterà rilevante nel tempo",
        ],
      },
      {
        title: "Fa meno per te se...",
        items: [
          "cerchi una soluzione rapida o solo un titolo",
          "preferisci spingere la vendita invece di costruire credibilità",
          "vuoi qualcosa che sembri facile ma sia superficiale",
          "non hai pazienza per costruire nel tempo",
        ],
      },
      {
        title: "Ciò che valorizziamo",
        items: ["serietà", "autonomia", "visione di lungo periodo", "etica commerciale", "capacità di creare fiducia"],
      },
    ],
  },
};

const stepsOverridesByLang: Partial<Record<Lang, PartnerPageContent["steps"]>> = {
  sv: {
    title: "Vad händer efter att du anmäler intresse?",
    body: "Processen är enkel och utan press. Först ser vi om det finns en rimlig match, sedan visar vi hur modellen fungerar i praktiken och därefter avgör du om du vill gå vidare.",
    items: [
      {
        title: "Vi går igenom din ansökan",
        text: "Vi läser dina svar för att förstå din bakgrund, din ambition och om det finns en rimlig match.",
      },
      {
        title: "Du får se hur det faktiskt fungerar",
        text: "Vi visar hur länken, flödet, uppföljningen och nästa stegen ser ut i praktiken, så att modellen blir konkret.",
      },
      {
        title: "Du tar ställning i lugn och ro",
        text: "Målet är inte att pressa fram ett ja, utan att du ska kunna avgöra om det här känns seriöst, relevant och rätt för dig.",
      },
    ],
  },
  no: {
    title: "Hva skjer etter at du sender inn interessen din?",
    body: "Prosessen er enkel og uten press. Vi ønsker først å forstå hvem du er, deretter vise modellen tydelig, og så la deg avgjøre om dette føles riktig.",
    items: [
      {
        title: "Vi går gjennom søknaden din",
        text: "Vi leser svarene dine for å forstå bakgrunnen din, ambisjonen din og om det finnes en rimelig match.",
      },
      {
        title: "Du får en tydelig gjennomgang",
        text: "Vi viser hvordan konseptet, kundereisen og partnermodellen fungerer i praksis.",
      },
      {
        title: "Du tar stilling i ro og mak",
        text: "Målet er ikke å presse frem et ja, men å la deg ta en gjennomtenkt beslutning.",
      },
    ],
  },
  da: {
    title: "Hvad sker der, efter du har sendt din interesse?",
    body: "Processen er enkel og uden pres. Vi vil først forstå, hvem du er, derefter vise modellen tydeligt og til sidst lade dig afgøre, om det føles rigtigt.",
    items: [
      {
        title: "Vi gennemgår din ansøgning",
        text: "Vi læser dine svar for at forstå din baggrund, din ambition og om der er et rimeligt match.",
      },
      {
        title: "Du får en tydelig gennemgang",
        text: "Vi viser, hvordan konceptet, kunderejsen og partnermodellen fungerer i praksis.",
      },
      {
        title: "Du tager stilling i ro og mag",
        text: "Målet er ikke at presse et ja frem, men at lade dig træffe en velovervejet beslutning.",
      },
    ],
  },
  fi: {
    title: "Mitä tapahtuu kiinnostuksen jättämisen jälkeen?",
    body: "Prosessi on yksinkertainen eikä siihen liity painetta. Haluamme ensin ymmärtää, kuka olet, sitten näyttää mallin selkeästi ja sen jälkeen antaa sinun päättää, tuntuuko tämä oikealta.",
    items: [
      {
        title: "Käymme hakemuksesi läpi",
        text: "Luemme vastauksesi ymmärtääksemme taustasi, tavoitteesi ja sen, onko yhteensopivuudelle realistinen peruste.",
      },
      {
        title: "Saat selkeän läpikäynnin",
        text: "Näytämme, miten konsepti, asiakaspolku ja partnermalli toimivat käytännössä.",
      },
      {
        title: "Päätät rauhassa",
        text: "Tavoite ei ole painostaa sinua sanomaan kyllä, vaan antaa sinun tehdä harkittu päätös.",
      },
    ],
  },
  de: {
    title: "Was passiert nach deiner Bewerbung?",
    body: "Der Prozess ist einfach und ohne Druck. Wir möchten zunächst verstehen, wer du bist, dann das Modell klar darstellen und dir anschließend die Entscheidung in Ruhe überlassen.",
    items: [
      {
        title: "Wir prüfen deine Bewerbung",
        text: "Wir lesen deine Antworten, um deinen Hintergrund, deine Ambition und die Frage einer realistischen Passung zu verstehen.",
      },
      {
        title: "Du erhältst eine klare Einordnung",
        text: "Wir zeigen, wie Konzept, Kundenweg und Partnermodell in der Praxis funktionieren.",
      },
      {
        title: "Du entscheidest in Ruhe",
        text: "Das Ziel ist nicht, ein Ja zu erzwingen, sondern dir eine fundierte Entscheidung zu ermöglichen.",
      },
    ],
  },
  fr: {
    title: "Que se passe-t-il après votre candidature ?",
    body: "Le processus est simple et sans pression. Nous voulons d'abord comprendre qui vous êtes, puis présenter clairement le modèle, avant de vous laisser décider si cela vous correspond.",
    items: [
      {
        title: "Nous examinons votre candidature",
        text: "Nous lisons vos réponses pour comprendre votre parcours, votre ambition et s'il existe une adéquation raisonnable.",
      },
      {
        title: "Vous obtenez une présentation claire",
        text: "Nous expliquons comment le concept, le parcours client et le modèle partenaire fonctionnent dans la pratique.",
      },
      {
        title: "Vous décidez sereinement",
        text: "L'objectif n'est pas de forcer un oui, mais de vous permettre de prendre une décision réfléchie.",
      },
    ],
  },
  it: {
    title: "Cosa succede dopo la candidatura?",
    body: "Il processo è semplice e senza pressione. Prima vogliamo capire chi sei, poi mostrarti il modello in modo chiaro e infine lasciarti decidere con calma se è la strada giusta.",
    items: [
      {
        title: "Esaminiamo la tua candidatura",
        text: "Leggiamo le tue risposte per capire il tuo background, la tua ambizione e se esista una corrispondenza ragionevole.",
      },
      {
        title: "Ricevi una spiegazione chiara",
        text: "Ti mostriamo come funzionano nella pratica il concetto, il percorso cliente e il modello partner.",
      },
      {
        title: "Decidi con calma",
        text: "L'obiettivo non è spingerti a dire sì, ma permetterti di prendere una decisione ponderata.",
      },
    ],
  },
};

const formOverridesByLang: Partial<Record<Lang, PartnerPageContent["form"]>> = {
  sv: {
    title: "Nyfiken på att bli partner?",
    body: "Lämna dina uppgifter och några korta svar, så hör vi av oss om nästa steg om det finns en rimlig match.",
    name: "Namn",
    email: "E-post",
    phone: "Telefonnummer",
    company: "Företag eller team (valfritt)",
    interest: "Vad är du främst ute efter?",
    readiness: "Hur redo är du?",
    background: "Varför är detta intressant för dig?",
    interestOptions: ["Utforska möjligheten", "Bygga verksamhet", "Förstå modellen bättre"],
    readinessOptions: ["Utforskar", "Vill ta ett första samtal", "Redo att gå vidare"],
    submit: "Skicka partnerförfrågan",
    successTitle: "Tack, ditt intresse är mottaget.",
    successBody: "Vi går igenom dina svar och hör av oss om nästa steg om det finns en rimlig match.",
  },
  no: {
    title: "Nysgjerrig på å bli partner?",
    body: "Legg igjen opplysningene dine og noen korte svar, så tar vi kontakt om neste steg dersom det finnes en rimelig match.",
    name: "Navn",
    email: "E-post",
    phone: "Telefon (valgfritt)",
    company: "Bedrift eller team (valgfritt)",
    interest: "Hva er du først og fremst ute etter?",
    readiness: "Hvor klar er du?",
    background: "Hvorfor er dette interessant for deg?",
    interestOptions: ["Utforske muligheten", "Bygge virksomhet", "Forstå modellen bedre"],
    readinessOptions: ["Utforsker", "Vil ta en første samtale", "Klar til å gå videre"],
    submit: "Send partnerforespørsel",
    successTitle: "Takk, interessen din er mottatt.",
    successBody: "Vi går gjennom svarene dine og tar kontakt dersom det finnes en rimelig match.",
  },
  da: {
    title: "Nysgerrig på at blive partner?",
    body: "Efterlad dine oplysninger og nogle korte svar, så vender vi tilbage om næste skridt, hvis der er et rimeligt match.",
    name: "Navn",
    email: "E-mail",
    phone: "Telefon (valgfrit)",
    company: "Virksomhed eller team (valgfrit)",
    interest: "Hvad er du primært ude efter?",
    readiness: "Hvor klar er du?",
    background: "Hvorfor er dette interessant for dig?",
    interestOptions: ["Udforske muligheden", "Bygge en forretning", "Forstå modellen bedre"],
    readinessOptions: ["Udforsker", "Vil tage en første samtale", "Klar til at gå videre"],
    submit: "Send partnerhenvendelse",
    successTitle: "Tak, din interesse er modtaget.",
    successBody: "Vi gennemgår dine svar og vender tilbage, hvis der ser ud til at være et rimeligt match.",
  },
  fi: {
    title: "Kiinnostaako partneriksi lähteminen?",
    body: "Jätä yhteystietosi ja muutama lyhyt vastaus, niin palaamme asiaan seuraavista vaiheista, jos yhteensopivuudelle on realistinen peruste.",
    name: "Nimi",
    email: "Sähköposti",
    phone: "Puhelin (valinnainen)",
    company: "Yritys tai tiimi (valinnainen)",
    interest: "Mitä haet ensisijaisesti?",
    readiness: "Kuinka valmis olet?",
    background: "Miksi tämä kiinnostaa sinua?",
    interestOptions: ["Tutkia mahdollisuutta", "Rakentaa liiketoimintaa", "Ymmärtää malli paremmin"],
    readinessOptions: ["Selvitän vielä", "Haluan ensimmäisen keskustelun", "Valmis etenemään"],
    submit: "Lähetä partnerihakemus",
    successTitle: "Kiitos, kiinnostuksesi on vastaanotettu.",
    successBody: "Käymme vastauksesi läpi ja palaamme asiaan, jos yhteensopivuudelle on realistinen peruste.",
  },
  de: {
    title: "Interesse an einer Partnerschaft?",
    body: "Hinterlasse deine Daten und ein paar kurze Antworten. Wenn es eine realistische Passung gibt, melden wir uns mit dem nächsten Schritt.",
    name: "Name",
    email: "E-Mail",
    phone: "Telefon (optional)",
    company: "Unternehmen oder Team (optional)",
    interest: "Worauf zielst du in erster Linie ab?",
    readiness: "Wie weit bist du schon?",
    background: "Warum interessiert dich das?",
    interestOptions: ["Möglichkeit prüfen", "Geschäft aufbauen", "Modell besser verstehen"],
    readinessOptions: ["Ich informiere mich noch", "Ich möchte ein erstes Gespräch", "Ich bin bereit weiterzugehen"],
    submit: "Partneranfrage senden",
    successTitle: "Danke, dein Interesse ist eingegangen.",
    successBody: "Wir prüfen deine Antworten und melden uns, wenn eine realistische Passung besteht.",
  },
  fr: {
    title: "Envie de devenir partenaire ?",
    body: "Laissez vos coordonnées et quelques réponses courtes. S'il existe une adéquation raisonnable, nous reviendrons vers vous pour la suite.",
    name: "Nom",
    email: "E-mail",
    phone: "Téléphone (facultatif)",
    company: "Entreprise ou équipe (facultatif)",
    interest: "Que recherchez-vous en priorité ?",
    readiness: "Où en êtes-vous aujourd'hui ?",
    background: "Pourquoi cela vous intéresse-t-il ?",
    interestOptions: ["Explorer l'opportunité", "Construire une activité", "Mieux comprendre le modèle"],
    readinessOptions: ["J'explore encore", "Je veux un premier échange", "Je suis prêt à avancer"],
    submit: "Envoyer la demande partenaire",
    successTitle: "Merci, votre intérêt a bien été reçu.",
    successBody: "Nous examinons vos réponses et reviendrons vers vous s'il existe une adéquation raisonnable.",
  },
  it: {
    title: "Ti interessa diventare partner?",
    body: "Lascia i tuoi dati e qualche risposta breve. Se esiste una corrispondenza ragionevole, ti ricontatteremo per il passo successivo.",
    name: "Nome",
    email: "E-mail",
    phone: "Telefono (facoltativo)",
    company: "Azienda o team (facoltativo)",
    interest: "Che cosa stai cercando soprattutto?",
    readiness: "A che punto sei?",
    background: "Perché ti interessa?",
    interestOptions: ["Esplorare l'opportunità", "Costruire un'attività", "Capire meglio il modello"],
    readinessOptions: ["Sto ancora esplorando", "Voglio un primo confronto", "Sono pronto ad andare avanti"],
    submit: "Invia richiesta partner",
    successTitle: "Grazie, il tuo interesse è stato ricevuto.",
    successBody: "Esamineremo le tue risposte e ti ricontatteremo se emergerà una corrispondenza ragionevole.",
  },
};

const stickyOverridesByLang: Partial<Record<Lang, PartnerPageContent["sticky"]>> = {
  sv: {
    text: "Utforska en seriös partnermodell inom testbaserad hälsa",
    cta: "Ansök om att bli partner",
  },
  no: {
    text: "Utforsk en seriøs partnermodell innen testbasert helse",
    cta: "Søk om å bli partner",
  },
  da: {
    text: "Udforsk en seriøs partnermodel inden for testbaseret sundhed",
    cta: "Ansøg om at blive partner",
  },
  fi: {
    text: "Tutustu vakavaan partnermalliin testipohjaisessa terveydessä",
    cta: "Hae partneriksi",
  },
  en: {
    text: "Explore a serious partner model in test-based health",
    cta: "Apply to become a partner",
  },
  de: {
    text: "Entdecke ein seriöses Partnermodell im Bereich testbasierter Gesundheit",
    cta: "Als Partner bewerben",
  },
  fr: {
    text: "Découvrez un modèle partenaire sérieux dans la santé fondée sur le test",
    cta: "Postuler comme partenaire",
  },
  it: {
    text: "Scopri un modello partner serio nella salute basata sul test",
    cta: "Candidati come partner",
  },
};

const conversionAssistByLang: Record<Lang, { eyebrow: string; title: string; items: string[]; cta: string }> = {
  sv: {
    eyebrow: "Snabb väg vidare",
    title: "Du behöver inte kunna allt innan du skickar in",
    items: ["Tar ungefär 2 minuter", "Ingen bindning eller press", "Personlig återkoppling om nästa steg"],
    cta: "Gå direkt till ansökan",
  },
  no: {
    eyebrow: "Rask vei videre",
    title: "Du trenger ikke kunne alt før du sender inn",
    items: ["Tar omtrent 2 minutter", "Ingen binding eller press", "Personlig tilbakemelding om neste steg"],
    cta: "Gå direkte til søknaden",
  },
  da: {
    eyebrow: "Hurtig vej videre",
    title: "Du behøver ikke vide alt, før du sender ind",
    items: ["Tager cirka 2 minutter", "Ingen binding eller pres", "Personlig tilbagemelding om næste skridt"],
    cta: "Gå direkte til ansøgningen",
  },
  fi: {
    eyebrow: "Nopea reitti eteenpäin",
    title: "Sinun ei tarvitse tietää kaikkea ennen hakemista",
    items: ["Vie noin 2 minuuttia", "Ei sitoutumista tai painetta", "Henkilökohtainen palaute seuraavista askelista"],
    cta: "Siirry suoraan hakemukseen",
  },
  en: {
    eyebrow: "Fast track",
    title: "You do not need to know everything before you apply",
    items: ["Takes about 2 minutes", "No obligation or pressure", "Personal follow-up on next steps"],
    cta: "Go straight to the application",
  },
  de: {
    eyebrow: "Schneller weiter",
    title: "Du musst nicht alles wissen, bevor du dich meldest",
    items: ["Dauert etwa 2 Minuten", "Keine Bindung und kein Druck", "Persönliche Rückmeldung zu den nächsten Schritten"],
    cta: "Direkt zur Bewerbung",
  },
  fr: {
    eyebrow: "Accès rapide",
    title: "Vous n’avez pas besoin de tout savoir avant de candidater",
    items: ["Prend environ 2 minutes", "Aucun engagement ni pression", "Retour personnel sur la suite"],
    cta: "Aller directement à la candidature",
  },
  it: {
    eyebrow: "Percorso rapido",
    title: "Non devi sapere tutto prima di candidarti",
    items: ["Richiede circa 2 minuti", "Nessun vincolo o pressione", "Riscontro personale sui prossimi passi"],
    cta: "Vai direttamente alla candidatura",
  },
};

const partnerMidPageCtaByLang: Record<Lang, { title: string; body: string; cta: string }> = {
  sv: {
    title: "Känns modellen relevant för dig?",
    body: "Om du redan ser logiken behöver du inte förstå varje detalj först. Skicka in din ansökan så tar vi nästa steg i dialog i stället. Det tar ungefär 2 minuter.",
    cta: "Ansök om att bli partner",
  },
  no: {
    title: "Kjennes modellen logisk for deg?",
    body: "Hvis du ser potensialet, trenger du ikke lese alt flere ganger. Send inn søknaden, så tar vi neste steg i dialog i stedet.",
    cta: "Søk nå",
  },
  da: {
    title: "Virker modellen logisk for dig?",
    body: "Hvis du kan se potentialet, behøver du ikke læse alt flere gange. Send ansøgningen, så tager vi næste skridt i dialog i stedet.",
    cta: "Ansøg nu",
  },
  fi: {
    title: "Tuntuuko malli sinusta loogiselta?",
    body: "Jos näet potentiaalin, sinun ei tarvitse lukea kaikkea monta kertaa. Lähetä hakemus, niin käymme seuraavat askeleet läpi keskustellen.",
    cta: "Hae nyt",
  },
  en: {
    title: "Does the model make sense to you?",
    body: "If you can already see the potential, you do not need to reread everything. Apply now and we can handle the next step in conversation instead.",
    cta: "Apply now",
  },
  de: {
    title: "Ergibt das Modell für dich Sinn?",
    body: "Wenn du das Potenzial bereits siehst, musst du nicht alles mehrfach lesen. Schick die Bewerbung jetzt ab, dann klären wir den nächsten Schritt im Gespräch.",
    cta: "Jetzt bewerben",
  },
  fr: {
    title: "Le modèle vous paraît-il logique ?",
    body: "Si vous voyez déjà le potentiel, vous n’avez pas besoin de tout relire. Envoyez votre candidature maintenant et nous verrons la suite ensemble.",
    cta: "Postuler maintenant",
  },
  it: {
    title: "Il modello ti sembra sensato?",
    body: "Se vedi già il potenziale, non serve rileggere tutto più volte. Invia ora la candidatura e affrontiamo il passo successivo nel dialogo.",
    cta: "Candidati ora",
  },
};

const partnerDeepDiveByLang: Record<Lang, { eyebrow: string; title: string; body: string }> = {
  sv: {
    eyebrow: "Steg 2",
    title: "Fördjupa dig om du vill förstå mer innan du bestämmer dig",
    body: "Här under finns resten av underlaget för dig som vill läsa djupare om produktlogik, timing, matchning och hur processen ser ut vidare.",
  },
  no: {
    eyebrow: "Steg 2",
    title: "Fordyp deg hvis du vil forstå mer før du bestemmer deg",
    body: "Her under finner du resten av grunnlaget hvis du vil lese dypere om produktlogikk, timing, match og hvordan prosessen ser ut videre.",
  },
  da: {
    eyebrow: "Trin 2",
    title: "Dyk ned i det, hvis du vil forstå mere før du beslutter dig",
    body: "Herunder finder du resten af grundlaget, hvis du vil læse dybere om produktlogik, timing, match og hvordan processen ser ud videre.",
  },
  fi: {
    eyebrow: "Vaihe 2",
    title: "Syvenny tähän, jos haluat ymmärtää enemmän ennen päätöstä",
    body: "Alta löydät muun materiaalin, jos haluat lukea tarkemmin tuotteen logiikasta, ajoituksesta, sopivuudesta ja siitä, miltä prosessi näyttää eteenpäin.",
  },
  en: {
    eyebrow: "Step 2",
    title: "Go deeper if you want to understand more before deciding",
    body: "Below is the rest of the material for anyone who wants a deeper look at product logic, timing, fit, and what the process looks like from here.",
  },
  de: {
    eyebrow: "Schritt 2",
    title: "Geh tiefer, wenn du vor deiner Entscheidung mehr verstehen willst",
    body: "Unten findest du das restliche Material, wenn du tiefer in Produktlogik, Timing, Passung und den weiteren Ablauf einsteigen möchtest.",
  },
  fr: {
    eyebrow: "Étape 2",
    title: "Allez plus loin si vous voulez en comprendre davantage avant de décider",
    body: "Vous trouverez ci-dessous le reste du contenu si vous souhaitez approfondir la logique du produit, le timing, l’adéquation et la suite du processus.",
  },
  it: {
    eyebrow: "Fase 2",
    title: "Approfondisci se vuoi capire di più prima di decidere",
    body: "Qui sotto trovi il resto del materiale se vuoi approfondire la logica del prodotto, il momento, la compatibilità e come prosegue il processo.",
  },
};

const partnerSystemModelByLang: Record<Lang, { eyebrow: string; title: string; body: string; items: { title: string; text: string }[] }> = {
  sv: {
    eyebrow: "Så fungerar det",
    title: "Så fungerar modellen i praktiken",
    body: "Det här ska inte kännas diffust. Du får en länk, rätt personer går in i flödet och du följer upp där det finns verkligt intresse.",
    items: [
      { title: "Du delar din länk", text: "Du behöver inte bygga allt själv från noll. Det finns redan ett färdigt flöde att arbeta med." },
      { title: "Rätt personer visar intresse", text: "Intresse fångas upp tydligare än via lösa meddelanden och kalla kontakter." },
      { title: "Systemet tar dem vidare", text: "Flödet hjälper till att skapa förståelse innan du själv behöver bära hela förklaringen." },
      { title: "Du följer upp där det är relevant", text: "När intresset är på riktigt blir nästa steg dialog, samtal eller Zoom i stället för gissningar." },
    ],
  },
  no: {
    eyebrow: "Slik fungerer det",
    title: "En enkel modell fra trafikk til partnerdialog",
    body: "Dette skal ikke oppleves diffust. Modellen skal være rask å forstå og mulig å bruke steg for steg.",
    items: [
      { title: "Trafikk", text: "Riktige personer finner inn gjennom et ferdig digitalt flyt." },
      { title: "Leads", text: "Interesse fanges opp og blir tydeligere enn løse meldinger og kalde kontakter." },
      { title: "Oppfølging", text: "Riktige personer får riktig neste steg via dialog, samtale eller Zoom." },
      { title: "Inntekt", text: "Flere relevante partnerdialoger kan bli business når modellen brukes konsekvent." },
    ],
  },
  da: {
    eyebrow: "Sådan fungerer det",
    title: "En enkel model fra trafik til partnerdialog",
    body: "Det her skal ikke føles diffust. Modellen skal være hurtig at forstå og kunne bruges trin for trin.",
    items: [
      { title: "Trafik", text: "De rigtige mennesker finder ind via et færdigt digitalt flow." },
      { title: "Leads", text: "Interesse fanges op og bliver tydeligere end løse beskeder og kolde kontakter." },
      { title: "Opfølgning", text: "De rigtige mennesker får det rigtige næste skridt via dialog, samtale eller Zoom." },
      { title: "Indtægt", text: "Flere relevante partnerdialoger kan blive til forretning, når modellen bruges konsekvent." },
    ],
  },
  fi: {
    eyebrow: "Näin se toimii",
    title: "Yksinkertainen malli liikenteestä partnerikeskusteluun",
    body: "Tämän ei kuulu tuntua epämääräiseltä. Mallin pitää olla nopeasti ymmärrettävä ja käytettävä askel askeleelta.",
    items: [
      { title: "Liikenne", text: "Oikeat ihmiset löytävät sisään valmiin digitaalisen virtauksen kautta." },
      { title: "Liidit", text: "Kiinnostus kerätään talteen selkeämmin kuin irrallisissa viesteissä ja kylmissä kontakteissa." },
      { title: "Seuranta", text: "Oikeat ihmiset saavat oikean seuraavan askeleen dialogin, puhelun tai Zoomin kautta." },
      { title: "Tulo", text: "Useammat relevantit partnerikeskustelut voivat muuttua liiketoiminnaksi, kun mallia käytetään johdonmukaisesti." },
    ],
  },
  en: {
    eyebrow: "How it works",
    title: "A simple model from traffic to partner dialogue",
    body: "This should not feel vague. The model should be quick to understand and usable step by step.",
    items: [
      { title: "Traffic", text: "The right people enter through a ready-made digital flow." },
      { title: "Leads", text: "Interest gets captured more clearly than through loose DMs and cold outreach." },
      { title: "Follow-up", text: "The right people get the right next step through dialogue, calls, or Zoom." },
      { title: "Income", text: "More relevant partner conversations can become business when the model is used consistently." },
    ],
  },
  de: {
    eyebrow: "So funktioniert es",
    title: "Ein einfaches Modell von Traffic bis Partnerdialog",
    body: "Das soll nicht vage wirken. Das Modell soll schnell verständlich und Schritt für Schritt nutzbar sein.",
    items: [
      { title: "Traffic", text: "Die richtigen Personen kommen über einen fertigen digitalen Ablauf hinein." },
      { title: "Leads", text: "Interesse wird klarer erfasst als über lose Nachrichten und kalte Kontakte." },
      { title: "Follow-up", text: "Die richtigen Personen bekommen den richtigen nächsten Schritt per Dialog, Gespräch oder Zoom." },
      { title: "Einnahmen", text: "Mehr relevante Partnergespräche können zu Geschäft werden, wenn das Modell konsequent genutzt wird." },
    ],
  },
  fr: {
    eyebrow: "Comment cela fonctionne",
    title: "Un modèle simple du trafic jusqu’au dialogue partenaire",
    body: "Cela ne doit pas sembler vague. Le modèle doit être rapide à comprendre et utilisable étape par étape.",
    items: [
      { title: "Trafic", text: "Les bonnes personnes entrent via un parcours digital déjà prêt." },
      { title: "Leads", text: "L’intérêt est capté plus clairement qu’avec des messages dispersés et des contacts à froid." },
      { title: "Suivi", text: "Les bonnes personnes reçoivent la bonne prochaine étape via dialogue, appel ou Zoom." },
      { title: "Revenu", text: "Davantage de conversations partenaires pertinentes peuvent devenir du business si le modèle est utilisé de façon cohérente." },
    ],
  },
  it: {
    eyebrow: "Come funziona",
    title: "Un modello semplice dal traffico al dialogo partner",
    body: "Non deve sembrare vago. Il modello deve essere rapido da capire e utilizzabile passo dopo passo.",
    items: [
      { title: "Traffico", text: "Le persone giuste entrano tramite un flusso digitale già pronto." },
      { title: "Lead", text: "L’interesse viene raccolto in modo più chiaro rispetto a messaggi sparsi e contatti a freddo." },
      { title: "Follow-up", text: "Le persone giuste ricevono il giusto passo successivo tramite dialogo, call o Zoom." },
      { title: "Entrata", text: "Più dialoghi partner rilevanti possono diventare business quando il modello viene usato con coerenza." },
    ],
  },
};

const partnerSystemSummaryByLang: Record<Lang, { title: string; body: string }> = {
  sv: {
    title: "System",
    body: "Trafik in. Intresse fångas upp. Uppföljning sker i rätt ordning. Affär kan byggas steg för steg.",
  },
  no: {
    title: "System",
    body: "Trafikk inn. Interesse fanges opp. Oppfølging skjer i riktig rekkefølge. Business kan bygges steg for steg.",
  },
  da: {
    title: "System",
    body: "Trafik ind. Interesse fanges op. Opfølgning sker i den rigtige rækkefølge. Forretning kan bygges trin for trin.",
  },
  fi: {
    title: "Järjestelmä",
    body: "Liikenne sisään. Kiinnostus kerätään talteen. Seuranta tapahtuu oikeassa järjestyksessä. Liiketoimintaa voidaan rakentaa askel askeleelta.",
  },
  en: {
    title: "System",
    body: "Traffic comes in. Interest gets captured. Follow-up happens in the right order. Business can be built step by step.",
  },
  de: {
    title: "System",
    body: "Traffic kommt hinein. Interesse wird erfasst. Follow-up passiert in der richtigen Reihenfolge. Geschäft kann Schritt für Schritt aufgebaut werden.",
  },
  fr: {
    title: "Système",
    body: "Le trafic entre. L’intérêt est capté. Le suivi se fait dans le bon ordre. L’activité peut se construire étape par étape.",
  },
  it: {
    title: "Sistema",
    body: "Il traffico entra. L’interesse viene raccolto. Il follow-up avviene nel giusto ordine. L’attività può essere costruita passo dopo passo.",
  },
};

const partnerPayoffByLang: Record<Lang, { eyebrow: string; title: string; items: string[] }> = {
  sv: {
    eyebrow: "Varför det här är intressant",
    title: "Det här får rätt partner ut av modellen",
    items: [
      "Du slipper bygga allt från noll själv.",
      "Du får en tydligare väg från intresse till verklig dialog.",
      "Du jobbar med struktur i stället för slump och lösa ryck.",
      "Du söker till ett arbetssätt, inte bara till en länk.",
    ],
  },
  no: {
    eyebrow: "Hvorfor dette er interessant",
    title: "Dette får riktig partner ut av modellen",
    items: [
      "Du slipper å bygge alt fra null selv.",
      "Du får en tydeligere vei fra interesse til reell dialog.",
      "Du jobber med struktur i stedet for tilfeldighet og løse rykk.",
      "Du søker til en arbeidsmåte, ikke bare til en lenke.",
    ],
  },
  da: {
    eyebrow: "Hvorfor det er interessant",
    title: "Det får den rigtige partner ud af modellen",
    items: [
      "Du slipper for at bygge alt fra bunden selv.",
      "Du får en tydeligere vej fra interesse til reel dialog.",
      "Du arbejder med struktur i stedet for tilfældighed og løse ryk.",
      "Du søger til en arbejdsform, ikke bare til et link.",
    ],
  },
  fi: {
    eyebrow: "Miksi tämä on kiinnostavaa",
    title: "Tämän oikea partneri saa mallista",
    items: [
      "Sinun ei tarvitse rakentaa kaikkea nollasta itse.",
      "Saat selkeämmän reitin kiinnostuksesta oikeaan keskusteluun.",
      "Työskentelet rakenteella etkä sattuman ja irrallisten yritysten varassa.",
      "Et hae vain linkkiä, vaan toimivaa työskentelytapaa.",
    ],
  },
  en: {
    eyebrow: "Why this matters",
    title: "What the right partner gets from the model",
    items: [
      "You do not need to build everything from scratch on your own.",
      "You get a clearer path from interest to real dialogue.",
      "You work with structure instead of randomness and scattered effort.",
      "You apply to a working method, not just to a link.",
    ],
  },
  de: {
    eyebrow: "Warum das interessant ist",
    title: "Das bekommt der richtige Partner aus dem Modell",
    items: [
      "Du musst nicht alles selbst von null aufbauen.",
      "Du bekommst einen klareren Weg von Interesse zu echtem Dialog.",
      "Du arbeitest mit Struktur statt mit Zufall und einzelnen Aktionen.",
      "Du bewirbst dich auf eine Arbeitsweise, nicht nur auf einen Link.",
    ],
  },
  fr: {
    eyebrow: "Pourquoi c’est intéressant",
    title: "Ce que le bon partenaire retire du modèle",
    items: [
      "Vous n’avez pas à tout construire seul depuis zéro.",
      "Vous obtenez un chemin plus clair entre intérêt et vrai dialogue.",
      "Vous travaillez avec une structure plutôt qu’avec le hasard et des efforts dispersés.",
      "Vous candidatez à une manière de travailler, pas seulement à un lien.",
    ],
  },
  it: {
    eyebrow: "Perché è interessante",
    title: "Cosa ottiene il partner giusto dal modello",
    items: [
      "Non devi costruire tutto da zero da solo.",
      "Hai un percorso più chiaro dall’interesse al dialogo reale.",
      "Lavori con struttura invece che con casualità e tentativi sparsi.",
      "Ti candidi a un metodo di lavoro, non solo a un link.",
    ],
  },
};

const measurableHealthSignalUrl = "https://www.futuremarketinsights.com/reports/self-testing-market";
const marketTrendSignalUrl = "https://www.biospace.com/press-releases/diagnostic-testing-market-size-worth-usd-272-98-billion-by-2034-fueled-by-ngs-and-personalized-healthcare-demand";

const marketSignalByLang: Record<Lang, { eyebrow: string; title: string; body: string; measurableCta: string; marketCta: string }> = {
  sv: {
    eyebrow: "Extern signal",
    title: "Datadriven hälsa växer snabbt",
    body: "Marknaden för självtester växer stadigt och diagnostikmarknaden är redan en av de största inom hälsosektorn. Det stärker bilden av att testbaserad, personlig och datadriven hälsa kan bli en betydligt större kategori framåt än många äldre hälsoupplägg.",
    measurableCta: "Se källa om självtester (Future Market Insights)",
    marketCta: "Se källa om diagnostikmarknaden (BioSpace)",
  },
  no: {
    eyebrow: "Ekstern signal",
    title: "Datadrevet helse vokser raskt",
    body: "Markedet for selvtesting vokser jevnt, og diagnostikkmarkedet er allerede et av de største innen helsesektoren. Det styrker bildet av at testbasert, personlig og datadrevet helse kan bli en langt større kategori fremover enn mange eldre helseopplegg.",
    measurableCta: "Se kilde om selvtesting (Future Market Insights)",
    marketCta: "Se kilde om diagnostikkmarkedet (BioSpace)",
  },
  da: {
    eyebrow: "Ekstern signal",
    title: "Datadrevet sundhed vokser hurtigt",
    body: "Markedet for selvtests vokser støt, og diagnostikmarkedet er allerede et af de største inden for sundhedssektoren. Det styrker billedet af, at testbaseret, personlig og datadrevet sundhed kan blive en markant større kategori fremover end mange ældre sundhedsoplæg.",
    measurableCta: "Se kilde om selvtests (Future Market Insights)",
    marketCta: "Se kilde om diagnostikmarkedet (BioSpace)",
  },
  fi: {
    eyebrow: "Ulkoinen signaali",
    title: "Datapohjainen terveys kasvaa nopeasti",
    body: "Kotitestien markkina kasvaa tasaisesti, ja diagnostiikkamarkkina on jo yksi terveyssektorin suurimmista. Tämä vahvistaa kuvaa siitä, että testipohjaisesta, henkilökohtaisesta ja datalähtöisestä terveydestä voi tulla selvästi suurempi kategoria tulevaisuudessa kuin monista vanhemmista terveysmalleista.",
    measurableCta: "Katso lähde kotitesteistä (Future Market Insights)",
    marketCta: "Katso lähde diagnostiikkamarkkinasta (BioSpace)",
  },
  en: {
    eyebrow: "External signal",
    title: "Data-driven health is growing fast",
    body: "The self-testing market is growing steadily, and the broader diagnostics market is already one of the largest in healthcare. That supports the view that test-based, personal, and data-driven health could become a much larger category over time than many older health setups.",
    measurableCta: "See source on self-testing (Future Market Insights)",
    marketCta: "See source on the diagnostics market (BioSpace)",
  },
  de: {
    eyebrow: "Externe Einordnung",
    title: "Datengetriebene Gesundheit wächst schnell",
    body: "Der Markt für Selbsttests wächst stetig, und der Diagnostikmarkt gehört bereits zu den größten im Gesundheitssektor. Das stützt die Sicht, dass testbasierte, persönliche und datengetriebene Gesundheit langfristig zu einer deutlich größeren Kategorie werden kann als viele ältere Gesundheitsansätze.",
    measurableCta: "Quelle zu Selbsttests ansehen (Future Market Insights)",
    marketCta: "Quelle zum Diagnostikmarkt ansehen (BioSpace)",
  },
  fr: {
    eyebrow: "Signal externe",
    title: "La santé pilotée par la donnée croît rapidement",
    body: "Le marché des autotests progresse régulièrement, et le marché du diagnostic fait déjà partie des plus importants du secteur de la santé. Cela renforce l’idée que la santé fondée sur le test, plus personnelle et plus pilotée par la donnée, peut devenir une catégorie bien plus importante à l’avenir que beaucoup d’approches plus anciennes.",
    measurableCta: "Voir une source sur les autotests (Future Market Insights)",
    marketCta: "Voir une source sur le marché du diagnostic (BioSpace)",
  },
  it: {
    eyebrow: "Segnale esterno",
    title: "La salute guidata dai dati cresce rapidamente",
    body: "Il mercato dei self-test cresce in modo costante e il mercato della diagnostica è già uno dei più grandi del settore salute. Questo rafforza l’idea che una salute basata sul test, più personale e più guidata dai dati, possa diventare nel tempo una categoria molto più grande rispetto a molti modelli più vecchi.",
    measurableCta: "Vedi fonte sui self-test (Future Market Insights)",
    marketCta: "Vedi fonte sul mercato della diagnostica (BioSpace)",
  },
};

const commercialHeroOverridesByLang: Partial<Record<Lang, Partial<PartnerPageContent["hero"]>>> = {
  sv: {
    title: "Bygg partnerverksamhet med ett färdigt system för trafik, leads och uppföljning",
    body: "För dig som vill bygga seriöst med en tydlig modell i stället för att börja från noll. Du ansöker till ett arbetssätt som gör vägen från intresse till verklig partnerdialog tydligare, enklare och mer strukturerad.",
    cards: [
      {
        title: "Färdigt system",
        text: "Du behöver inte bygga trafik, leadflöde och uppföljningslogik helt själv från start.",
        icon: FlaskConical,
      },
      {
        title: "Seriös modell",
        text: "Du arbetar med struktur, uppföljning och verkliga nästa steg i stället för lösa ryck och slump.",
        icon: CircleDollarSign,
      },
      {
        title: "Tydligt nästa steg",
        text: "Målet är inte att du ska förstå allt direkt, utan att du snabbt ska se om modellen är rätt för dig.",
        icon: BarChart3,
      },
    ],
  },
  en: {
    title: "Build a partner business with a ready-made system for traffic, leads, and follow-up",
    body: "For people who want to build seriously with a clear model instead of starting from zero. You apply to a way of working that makes the path from interest to real partner dialogue clearer, easier, and more structured.",
    cards: [
      {
        title: "Ready-made system",
        text: "You do not need to build traffic, lead flow, and follow-up logic entirely on your own from the start.",
        icon: FlaskConical,
      },
      {
        title: "Serious model",
        text: "You work with structure, follow-up, and real next steps instead of randomness and scattered effort.",
        icon: CircleDollarSign,
      },
      {
        title: "Clear next step",
        text: "The goal is not for you to understand everything instantly, but to quickly see whether the model fits you.",
        icon: BarChart3,
      },
    ],
  },
  no: {
    title: "Bygg partnervirksomhet med et ferdig system for trafikk, leads og oppfølging",
    body: "For deg som vil bygge seriøst med en tydelig modell i stedet for å starte fra null. Du søker deg inn i en arbeidsmåte som gjør veien fra interesse til reell partnerdialog tydeligere, enklere og mer strukturert.",
    cards: [
      {
        title: "Ferdig system",
        text: "Du trenger ikke bygge trafikk, leadflyt og oppfølgingslogikk helt selv fra start.",
        icon: FlaskConical,
      },
      {
        title: "Seriøs modell",
        text: "Du jobber med struktur, oppfølging og reelle neste steg i stedet for tilfeldige rykk og løs improvisasjon.",
        icon: CircleDollarSign,
      },
      {
        title: "Tydelig neste steg",
        text: "Målet er ikke at du skal forstå alt med en gang, men raskt se om modellen passer for deg.",
        icon: BarChart3,
      },
    ],
  },
  da: {
    title: "Byg partnerforretning med et færdigt system for trafik, leads og opfølgning",
    body: "For dig, der vil bygge seriøst med en tydelig model i stedet for at starte fra nul. Du ansøger til en arbejdsform, der gør vejen fra interesse til reel partnerdialog tydeligere, enklere og mere struktureret.",
    cards: [
      {
        title: "Færdigt system",
        text: "Du behøver ikke selv at bygge trafik, leadflow og opfølgningslogik helt fra bunden.",
        icon: FlaskConical,
      },
      {
        title: "Seriøs model",
        text: "Du arbejder med struktur, opfølgning og reelle næste skridt i stedet for tilfældige ryk og løs improvisation.",
        icon: CircleDollarSign,
      },
      {
        title: "Tydeligt næste skridt",
        text: "Målet er ikke, at du skal forstå alt med det samme, men hurtigt se, om modellen passer til dig.",
        icon: BarChart3,
      },
    ],
  },
  fi: {
    title: "Rakenna partneriliiketoimintaa valmiilla järjestelmällä liikenteelle, liideille ja seurannalle",
    body: "Sinulle, joka haluat rakentaa vakavasti selkeän mallin avulla etkä aloittaa tyhjästä. Haet toimintatapaan, joka tekee polusta kiinnostuksesta todelliseen partnerikeskusteluun selkeämmän, helpomman ja rakenteellisemman.",
    cards: [
      {
        title: "Valmis järjestelmä",
        text: "Sinun ei tarvitse rakentaa liikennettä, liidivirtaa ja seurantaa kokonaan itse alusta lähtien.",
        icon: FlaskConical,
      },
      {
        title: "Vakava malli",
        text: "Työskentelet rakenteen, seurannan ja todellisten seuraavien askelten kanssa satunnaisten yritysten sijaan.",
        icon: CircleDollarSign,
      },
      {
        title: "Selkeä seuraava askel",
        text: "Tavoite ei ole, että ymmärtäisit kaiken heti, vaan että näet nopeasti, sopiiko malli sinulle.",
        icon: BarChart3,
      },
    ],
  },
  de: {
    title: "Baue ein Partnergeschäft mit einem fertigen System für Traffic, Leads und Follow-up",
    body: "Für Menschen, die mit einem klaren Modell seriös aufbauen wollen, statt bei null anzufangen. Du bewirbst dich auf eine Arbeitsweise, die den Weg von Interesse zu echtem Partnerdialog klarer, einfacher und strukturierter macht.",
    cards: [
      {
        title: "Fertiges System",
        text: "Du musst Traffic, Leadfluss und Follow-up-Logik nicht komplett selbst von Grund auf aufbauen.",
        icon: FlaskConical,
      },
      {
        title: "Seriöses Modell",
        text: "Du arbeitest mit Struktur, Follow-up und echten nächsten Schritten statt mit Zufall und einzelnen Aktionen.",
        icon: CircleDollarSign,
      },
      {
        title: "Klarer nächster Schritt",
        text: "Es geht nicht darum, sofort alles zu verstehen, sondern schnell zu erkennen, ob das Modell zu dir passt.",
        icon: BarChart3,
      },
    ],
  },
  fr: {
    title: "Développez une activité partenaire avec un système prêt à l’emploi pour le trafic, les leads et le suivi",
    body: "Pour celles et ceux qui veulent construire sérieusement avec un modèle clair au lieu de partir de zéro. Vous candidatez à une manière de travailler qui rend le passage de l’intérêt à un vrai dialogue partenaire plus clair, plus simple et plus structuré.",
    cards: [
      {
        title: "Système prêt à l’emploi",
        text: "Vous n’avez pas besoin de construire seul tout le trafic, le flux de leads et la logique de suivi dès le départ.",
        icon: FlaskConical,
      },
      {
        title: "Modèle sérieux",
        text: "Vous travaillez avec de la structure, du suivi et de vraies prochaines étapes plutôt qu’avec des efforts dispersés et du hasard.",
        icon: CircleDollarSign,
      },
      {
        title: "Prochaine étape claire",
        text: "L’objectif n’est pas que vous compreniez tout immédiatement, mais que vous voyiez vite si le modèle vous correspond.",
        icon: BarChart3,
      },
    ],
  },
  it: {
    title: "Costruisci un’attività partner con un sistema pronto per traffico, lead e follow-up",
    body: "Per chi vuole costruire seriamente con un modello chiaro invece di partire da zero. Ti candidi a un modo di lavorare che rende il percorso dall’interesse al vero dialogo partner più chiaro, più semplice e più strutturato.",
    cards: [
      {
        title: "Sistema pronto",
        text: "Non devi costruire da solo traffico, flusso lead e logica di follow-up fin dall’inizio.",
        icon: FlaskConical,
      },
      {
        title: "Modello serio",
        text: "Lavori con struttura, follow-up e passi successivi reali invece che con tentativi sparsi e casualità.",
        icon: CircleDollarSign,
      },
      {
        title: "Passo successivo chiaro",
        text: "L’obiettivo non è capire tutto subito, ma vedere rapidamente se il modello è giusto per te.",
        icon: BarChart3,
      },
    ],
  },
};

const finalCommercialHeroOverridesByLang: Partial<Record<Lang, Partial<PartnerPageContent["hero"]>>> = {
  sv: {
    title: "Bygg partnerverksamhet med ett färdigt system för trafik, leads och uppföljning",
    body: "För dig som vill bygga seriöst med en tydlig modell i stället för att börja från noll. Du ansöker till ett arbetssätt som gör vägen från intresse till verklig partnerdialog tydligare, enklare och mer strukturerad.",
    cards: [
      {
        title: "Färdigt system",
        text: "Du behöver inte bygga trafik, leadflöde och uppföljningslogik helt själv från start.",
        icon: FlaskConical,
      },
      {
        title: "Seriös modell",
        text: "Du arbetar med struktur, uppföljning och verkliga nästa steg i stället för lösa ryck och slump.",
        icon: CircleDollarSign,
      },
      {
        title: "Tydligt nästa steg",
        text: "Målet är inte att du ska förstå allt direkt, utan att du snabbt ska se om modellen är rätt för dig.",
        icon: BarChart3,
      },
    ],
  },
};

const finalConversionAssistOverridesByLang: Partial<Record<Lang, { eyebrow: string; title: string }>> = {
  sv: {
    eyebrow: "Det första steget är enkelt",
    title: "Du behöver inte vara redo på allt för att gå vidare",
  },
  no: {
    eyebrow: "Det første steget er enkelt",
    title: "Du trenger ikke være klar på alt for å gå videre",
  },
  da: {
    eyebrow: "Det første skridt er enkelt",
    title: "Du behøver ikke være klar på det hele for at gå videre",
  },
  fi: {
    eyebrow: "Ensimmäinen askel on helppo",
    title: "Sinun ei tarvitse olla valmis kaikkeen voidaksesi edetä",
  },
  en: {
    eyebrow: "The first step is simple",
    title: "You do not need to be ready for everything to move forward",
  },
  de: {
    eyebrow: "Der erste Schritt ist einfach",
    title: "Du musst nicht für alles bereit sein, um weiterzugehen",
  },
  fr: {
    eyebrow: "La première étape est simple",
    title: "Vous n’avez pas besoin d’être prêt à tout pour avancer",
  },
  it: {
    eyebrow: "Il primo passo è semplice",
    title: "Non devi essere pronto a tutto per andare avanti",
  },
};

const finalEconomicsModelBodyOverridesByLang: Partial<Record<Lang, string>> = {
  sv: "Kunden behöver inte betala mindre. Poängen är att samma slutpris kan fördelas annorlunda när färre externa led tar marginal.",
  no: "Når færre eksterne ledd tar margin, blir det mer rom igjen i modellen. Det er en del av logikken bak hvorfor partnerinntekter kan finnes.",
  da: "Når færre eksterne led tager margin, er der mere rum tilbage i modellen. Det er en del af logikken bag, at partnerindtægter kan eksistere.",
  fi: "Kun ulkoisia väliportaita on vähemmän ottamassa marginaalia, malliin jää enemmän liikkumavaraa. Se on osa logiikkaa sen takana, miksi partnerituloja voi syntyä.",
  en: "When fewer outside layers take margin, more room stays in the model. That is part of the logic behind why partner income can exist.",
  de: "Wenn weniger externe Stufen Marge herausnehmen, bleibt mehr Spielraum im Modell. Das ist ein Teil der Logik dahinter, warum Partnereinkommen möglich sein kann.",
  fr: "Quand moins d’intermédiaires externes prennent de marge, il reste plus de marge de manœuvre dans le modèle. Cela fait partie de la logique qui explique pourquoi un revenu partenaire peut exister.",
  it: "Quando meno passaggi esterni assorbono margine, nel modello resta più spazio. Fa parte della logica che spiega perché può esistere un reddito partner.",
};

const sectionMotion = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.55 },
};

function getPreviewText(text: string) {
  const firstSentenceMatch = text.match(/^.*?[.!?](?:\s|$)/);
  if (firstSentenceMatch?.[0] && firstSentenceMatch[0].trim().length < text.trim().length) {
    return firstSentenceMatch[0].trim();
  }

  if (text.length <= 140) {
    return text;
  }

  return `${text.slice(0, 140).trimEnd()}...`;
}

function ExpandableInfoCard({ lang, title, text }: { lang: Lang; title: string; text: string }) {
  const [open, setOpen] = useState(false);
  const previewText = getPreviewText(text);
  const hasMore = previewText !== text;

  return (
    <Collapsible open={open} onOpenChange={setOpen} className="rounded-[1.5rem] border border-border/80 bg-card p-6 shadow-sm">
      <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
      {open ? (
        <CollapsibleContent forceMount className="mt-3 data-[state=closed]:hidden">
          <p className="text-sm leading-7 text-subtle md:text-[15px]">{text}</p>
        </CollapsibleContent>
      ) : (
        <p className="mt-3 text-sm leading-7 text-subtle md:text-[15px]">{previewText}</p>
      )}
      {hasMore ? (
        <CollapsibleTrigger asChild>
          <button
            type="button"
            className="mt-4 text-sm font-medium text-foreground underline-offset-4 transition hover:underline"
          >
            {open ? readMoreByLang[lang].less : readMoreByLang[lang].more}
          </button>
        </CollapsibleTrigger>
      ) : null}
    </Collapsible>
  );
}

const PartnerPage = ({ lang }: PartnerPageProps) => {
  const page = useMemo(() => {
    const basePage = content[lang] ?? content.en;

    return {
      ...basePage,
      hero: {
        ...basePage.hero,
        ...(heroOverridesByLang[lang] ?? {}),
        ...(commercialHeroOverridesByLang[lang] ?? {}),
        ...(finalCommercialHeroOverridesByLang[lang] ?? {}),
      },
      economics: {
        ...basePage.economics,
        steps: economicsStepsByLang[lang] ?? economicsStepsByLang.en,
        modelLabel: economicsModelLabelByLang[lang] ?? economicsModelLabelByLang.en,
        modelBody: finalEconomicsModelBodyOverridesByLang[lang] ?? economicsModelBodyByLang[lang] ?? economicsModelBodyByLang.en,
        calloutTitle: economicsCalloutTitleByLang[lang] ?? economicsCalloutTitleByLang.en,
        calloutBody: economicsCalloutBodyByLang[lang] ?? economicsCalloutBodyByLang.en,
        note: economicsNoteByLang[lang] ?? economicsNoteByLang.en,
      },
      reasons: reasonsOverridesByLang[lang] ? { ...basePage.reasons, ...reasonsOverridesByLang[lang] } : basePage.reasons,
      fit: fitOverridesByLang[lang] ? { ...basePage.fit, ...fitOverridesByLang[lang] } : basePage.fit,
      steps: stepsOverridesByLang[lang] ? { ...basePage.steps, ...stepsOverridesByLang[lang] } : basePage.steps,
      form: formOverridesByLang[lang] ? { ...basePage.form, ...formOverridesByLang[lang] } : basePage.form,
      sticky: stickyOverridesByLang[lang] ? { ...basePage.sticky, ...stickyOverridesByLang[lang] } : basePage.sticky,
    };
  }, [lang]);
  const location = useLocation();
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showStickyCta, setShowStickyCta] = useState(false);
  const hasTrackedFormStart = useRef(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    interest: "",
    readiness: "",
    background: "",
  });

  const updateField = (field: keyof typeof formData, value: string) => {
    if (!hasTrackedFormStart.current) {
      hasTrackedFormStart.current = true;
      void logFunnelEvent("partner_form_started", {
        pathname: location.pathname,
        search: location.search,
        details: {
          formType: "partner_application",
        },
      });
    }

    setFormData((current) => ({ ...current, [field]: value }));
  };

  useEffect(() => {
    const onScroll = () => setShowStickyCta(window.scrollY > 480);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (submitting) {
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);

    try {
      const attributionContext = await getLeadAttributionContext(location.pathname, location.search);
      const validReferralCode = attributionContext.referredByUserId ? attributionContext.referralCode : null;

      const sessionId = attributionContext.sessionId;
      void logFunnelEvent("partner_form_submitted", {
        pathname: location.pathname,
        search: location.search,
        referralCode: validReferralCode,
        sessionId,
        details: {
          formType: "partner_application",
          partnerLinked: Boolean(validReferralCode),
        },
      });
      const response = await upsertLead({
        full_name: formData.name,
        email: formData.email,
        phone: formData.phone,
        ref: validReferralCode,
        session_id: sessionId,
        lead_type: "partner",
        lead_source: "partner_form",
        source_page: location.pathname,
        details: {
          company: formData.company,
          interest: formData.interest,
          readiness: formData.readiness,
          background: formData.background,
          landingPage: attributionContext.landingPage,
          attribution: {
            sessionId: attributionContext.sessionId,
            referralCode: validReferralCode,
            referredByUserId: attributionContext.referredByUserId,
            landingPage: attributionContext.landingPage,
            firstTouch: attributionContext.firstTouch,
            lastTouch: attributionContext.lastTouch,
          },
        },
      });

      if (!response.ok) {
        throw new Error(submitErrorByLang[lang]);
      }

      setSubmitted(true);
    } catch (error) {
      void logFunnelEvent("partner_form_submit_failed", {
        pathname: location.pathname,
        search: location.search,
        details: {
          formType: "partner_application",
          reason: error instanceof Error ? error.message : "submit_failed",
        },
      });
      setErrorMessage(error instanceof Error ? error.message : submitErrorByLang[lang]);
    } finally {
      setSubmitting(false);
    }
  };

  const conversionAssist = {
    ...conversionAssistByLang[lang],
    ...(finalConversionAssistOverridesByLang[lang] ?? {}),
  };
  const applicationDecision = {
    ...applicationDecisionByLang[lang],
    ...(commercialApplicationDecisionOverridesByLang[lang] ?? {}),
  };
  const heroShellClass = "container-wide !max-w-[68rem]";
  const sectionShellClass = "container-wide !max-w-[68rem]";

  const applicationSection = (
    <section id="partner-application" className="section-padding bg-section-alt pb-28 md:pb-24">
      <motion.div {...sectionMotion} className={sectionShellClass}>
        <div className="mb-8 grid gap-6 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
          <div className="rounded-[1.5rem] border border-border/80 bg-card p-6 text-left shadow-sm md:p-8">
            <h3 className="text-lg font-semibold tracking-tight">{applicationDecision.title}</h3>
            <p className="mt-3 text-sm leading-7 text-subtle md:text-[15px]">
              {applicationDecision.body}
            </p>
            <ul className="mt-5 space-y-3">
              {applicationDecision.checks.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm leading-7 text-subtle md:text-[15px]">
                  <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-primary" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-[1.5rem] border border-border/70 bg-background/80 p-6 text-left shadow-sm md:p-8">
            <h3 className="text-lg font-semibold tracking-tight">{afterApplicationByLang[lang].title}</h3>
            <div className="mt-5 grid gap-4 md:grid-cols-3 xl:grid-cols-1">
              {afterApplicationByLang[lang].items.map((item, index) => (
                <div key={item} className="rounded-2xl border border-border/70 bg-card px-5 py-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                    {index + 1}
                  </p>
                  <p className="mt-2 text-sm leading-7 text-subtle md:text-[15px]">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12 text-center md:mt-14">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            {formIntroByLang[lang].eyebrow}
          </p>
          <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">{page.form.title}</h2>
          <p className="mt-4 text-base leading-7 text-subtle md:text-lg">{page.form.body}</p>
          <p className="mt-3 text-sm leading-7 text-subtle">
            {formIntroByLang[lang].note}
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {conversionAssist.items.map((item) => (
              <div key={item} className="rounded-2xl border border-border/70 bg-card px-4 py-4 shadow-sm">
                <p className="text-sm leading-6 text-foreground/85">{item}</p>
              </div>
            ))}
          </div>
        </div>

        {submitted ? (
          <div className="mt-10 rounded-[1.75rem] border border-border/80 bg-card p-10 text-center shadow-sm">
            <div className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-full bg-accent text-accent-foreground">
              <Users2 className="h-6 w-6" />
            </div>
            <h3 className="mt-5 text-xl font-semibold tracking-tight md:text-2xl">{page.form.successTitle}</h3>
            <p className="mt-3 text-sm leading-7 text-subtle md:text-base">{page.form.successBody}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-10 rounded-[1.75rem] border border-border/80 bg-card p-6 shadow-elevated md:p-10">
            <div className="grid gap-5 md:grid-cols-2">
              <Field label={page.form.name}><Input required value={formData.name} onChange={(e) => updateField("name", e.target.value)} className="h-12 rounded-xl" /></Field>
              <Field label={page.form.email}><Input required type="email" value={formData.email} onChange={(e) => updateField("email", e.target.value)} className="h-12 rounded-xl" /></Field>
              <Field label={page.form.phone}><Input required value={formData.phone} onChange={(e) => updateField("phone", e.target.value)} className="h-12 rounded-xl" /></Field>
              <Field label={page.form.company}><Input value={formData.company} onChange={(e) => updateField("company", e.target.value)} className="h-12 rounded-xl" /></Field>
              <Field label={page.form.interest}>
                <Select value={formData.interest} onValueChange={(value) => updateField("interest", value)}>
                  <SelectTrigger className="h-12 rounded-xl"><SelectValue placeholder={page.form.interest} /></SelectTrigger>
                  <SelectContent>{page.form.interestOptions.map((option) => <SelectItem key={option} value={option}>{option}</SelectItem>)}</SelectContent>
                </Select>
              </Field>
              <Field label={page.form.readiness}>
                <Select value={formData.readiness} onValueChange={(value) => updateField("readiness", value)}>
                  <SelectTrigger className="h-12 rounded-xl"><SelectValue placeholder={page.form.readiness} /></SelectTrigger>
                  <SelectContent>{page.form.readinessOptions.map((option) => <SelectItem key={option} value={option}>{option}</SelectItem>)}</SelectContent>
                </Select>
              </Field>
            </div>

            <div className="mt-5">
              <Field label={page.form.background}>
                <Textarea required value={formData.background} onChange={(e) => updateField("background", e.target.value)} className="min-h-[144px] rounded-xl" />
              </Field>
            </div>

            <div className="mt-8 flex justify-end">
              <button type="submit" disabled={submitting} className="btn-primary min-h-12 w-full text-center disabled:opacity-70 sm:min-w-[220px] sm:w-auto">
                {submitting ? submittingLabelByLang[lang] : page.form.submit}
              </button>
            </div>
            {errorMessage ? <p className="mt-4 text-sm text-destructive">{errorMessage}</p> : null}
          </form>
        )}
      </motion.div>
    </section>
  );

  return (
    <div className="brand-partner min-h-screen bg-background">
      <section className="bg-hero section-padding pb-14 md:pb-24">
        <div className={heroShellClass}>
          <div className="mb-8 flex items-center justify-between gap-3 md:mb-12 md:gap-4">
            <Link to={lang === "sv" ? "/omega-balance" : `/${lang}/omega-balance`} className="font-serif text-xl font-semibold tracking-tight text-foreground">
              OmegaBalance
            </Link>
            <LanguageSwitcher lang={lang} />
          </div>

          <div className="grid items-start gap-10">
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="rounded-[1.75rem] border border-border/70 bg-card/70 px-5 py-7 shadow-sm backdrop-blur-sm sm:rounded-[2rem] sm:px-6 sm:py-8 md:px-8 md:py-10">
              <span className="badge-accent inline-flex rounded-full px-4 py-1.5 text-sm font-medium shadow-sm">{page.hero.badge}</span>
              <h1 className="mt-5 max-w-3xl text-[2.35rem] font-semibold leading-[1.05] tracking-tight sm:text-4xl md:mt-6 md:text-6xl">{page.hero.title}</h1>
              <p className="mt-3 max-w-2xl text-base leading-7 text-subtle sm:text-lg sm:leading-8 md:text-xl">{page.hero.body}</p>
              <div className="mt-8 flex flex-col gap-3 sm:mt-10 sm:flex-row sm:flex-wrap sm:gap-4">
                <a
                  href="#partner-application"
                  className="btn-primary w-full px-6 py-3.5 text-center text-base sm:w-auto"
                  onClick={() => void logFunnelEvent("partner_hero_primary_cta_clicked", {
                    pathname: location.pathname,
                    search: location.search,
                    details: {
                      placement: "hero",
                    },
                  })}
                >
                  {page.hero.primaryCta}
                </a>
                <a href="#partner-system" className="btn-secondary w-full px-6 py-3.5 text-center text-base sm:w-auto">{page.hero.secondaryCta}</a>
              </div>
              <div className="mt-7 grid gap-4 sm:mt-8 sm:gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(18rem,0.9fr)]">
                <div className="rounded-[1.35rem] border border-border/80 bg-background/80 p-4 shadow-sm sm:rounded-[1.5rem] sm:p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                    {conversionAssist.eyebrow}
                  </p>
                  <p className="mt-2 text-lg font-semibold tracking-tight text-foreground">
                    {conversionAssist.title}
                  </p>
                  <div className="mt-4 grid gap-3 xl:grid-cols-1 sm:max-xl:grid-cols-3">
                    {conversionAssist.items.map((item) => (
                      <div key={item} className="rounded-2xl border border-border/70 bg-card px-4 py-4">
                        <p className="text-sm leading-6 text-foreground/85">{item}</p>
                      </div>
                    ))}
                  </div>
                  <a
                    href="#partner-application"
                    className="mt-4 inline-flex items-center text-sm font-medium text-foreground underline-offset-4 transition hover:underline"
                    onClick={() => void logFunnelEvent("partner_hero_primary_cta_clicked", {
                      pathname: location.pathname,
                      search: location.search,
                      details: {
                        placement: "hero-fast-track",
                      },
                    })}
                  >
                    {conversionAssist.cta}
                  </a>
                </div>
                <div className="rounded-[1.35rem] border border-border/80 bg-secondary/35 p-4 shadow-sm sm:rounded-[1.5rem] sm:p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                    {marketSignalByLang[lang].eyebrow}
                  </p>
                  <p className="mt-2 text-lg font-semibold tracking-tight text-foreground">
                    {marketSignalByLang[lang].title}
                  </p>
                  <p className="mt-3 text-sm leading-7 text-subtle">
                    {marketSignalByLang[lang].body}
                  </p>
                  <div className="mt-4 flex flex-col items-start gap-2">
                    <a
                      href={measurableHealthSignalUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center text-sm font-medium text-foreground underline-offset-4 transition hover:underline"
                    >
                      {marketSignalByLang[lang].measurableCta}
                    </a>
                    <a
                      href={marketTrendSignalUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center text-sm font-medium text-foreground underline-offset-4 transition hover:underline"
                    >
                      {marketSignalByLang[lang].marketCta}
                    </a>
                  </div>
                </div>
              </div>
              <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }} className="mt-8 grid gap-4 lg:grid-cols-3">
              {page.hero.cards.map((card) => {
                const Icon = card.icon;
                return (
                  <div key={card.title} className="rounded-[1.5rem] border border-border/80 bg-card p-5 shadow-sm">
                    <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-accent/70 text-accent-foreground">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h2 className="text-lg font-semibold tracking-tight">{card.title}</h2>
                    <p className="mt-3 text-sm leading-7 text-subtle md:text-[15px]">{card.text}</p>
                  </div>
                );
              })}
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      <section id="partner-system" className="px-4 py-8 md:px-6 md:py-10">
        <motion.div {...sectionMotion} className={sectionShellClass}>
          <div className="rounded-[1.75rem] border border-border/80 bg-card p-6 shadow-sm md:p-8">
            <div className="grid gap-6 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] xl:items-start">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                  {partnerSystemModelByLang[lang].eyebrow}
                </p>
                <h2 className="mt-2 max-w-2xl text-2xl font-semibold tracking-tight md:text-3xl">
                  {partnerSystemModelByLang[lang].title}
                </h2>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-subtle md:text-base">
                  {partnerSystemModelByLang[lang].body}
                </p>
              </div>
              <div className="rounded-[1.5rem] border border-border/70 bg-background/80 p-4 md:p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                  {partnerSystemSummaryByLang[lang].title}
                </p>
                <p className="mt-2 text-sm leading-6 text-subtle">
                  {partnerSystemSummaryByLang[lang].body}
                </p>
              </div>
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {partnerSystemModelByLang[lang].items.map((item, index) => (
                <div key={item.title} className="rounded-2xl border border-border/70 bg-background px-5 py-5 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-accent text-sm font-semibold text-accent-foreground">
                      {index + 1}
                    </div>
                    <p className="text-lg font-semibold tracking-tight text-foreground">{item.title}</p>
                  </div>
                  <p className="mt-3 text-sm leading-7 text-subtle">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      <section className="px-4 py-6 md:px-6 md:py-8">
        <motion.div {...sectionMotion} className={sectionShellClass}>
          <div className="rounded-[1.75rem] border border-border/80 bg-card p-6 shadow-sm md:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              {partnerPayoffByLang[lang].eyebrow}
            </p>
            <h2 className="mt-2 max-w-3xl text-2xl font-semibold tracking-tight md:text-3xl">
              {partnerPayoffByLang[lang].title}
            </h2>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {partnerPayoffByLang[lang].items.map((item) => (
                <div key={item} className="rounded-2xl border border-border/70 bg-background px-5 py-5">
                  <p className="text-sm leading-7 text-foreground/85">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      <section className="px-4 py-6 md:px-6 md:py-8">
        <div className={sectionShellClass}>
          <div className="rounded-[1.75rem] border border-border/80 bg-card px-6 py-6 shadow-sm md:px-8 md:py-7">
            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div className="max-w-2xl">
                <p className="text-xl font-semibold tracking-tight text-foreground">
                  {partnerMidPageCtaByLang[lang].title}
                </p>
                <p className="mt-2 text-sm leading-7 text-subtle md:text-base">
                  {partnerMidPageCtaByLang[lang].body}
                </p>
              </div>
              <a
                href="#partner-application"
                className="btn-primary whitespace-nowrap text-center"
                onClick={() => void logFunnelEvent("partner_hero_primary_cta_clicked", {
                  pathname: location.pathname,
                  search: location.search,
                  details: {
                    placement: "mid-page-bridge",
                  },
                })}
              >
                {partnerMidPageCtaByLang[lang].cta}
              </a>
            </div>
          </div>
        </div>
      </section>

      {applicationSection}

      <section className="px-4 py-6 md:px-6 md:py-8">
        <div className={sectionShellClass}>
          <div className="rounded-[1.75rem] border border-border/80 bg-card px-6 py-6 shadow-sm md:px-8 md:py-7">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              {partnerDeepDiveByLang[lang].eyebrow}
            </p>
            <h2 className="mt-2 max-w-3xl text-2xl font-semibold tracking-tight md:text-3xl">
              {partnerDeepDiveByLang[lang].title}
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-subtle md:text-base">
              {partnerDeepDiveByLang[lang].body}
            </p>
          </div>
        </div>
      </section>

      <section className="px-4 py-6 md:px-6 md:py-8">
        <div className={sectionShellClass}>
          <div className="rounded-[1.5rem] border border-border/80 bg-card px-5 py-5 shadow-sm md:px-6">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              {sectionNavByLang[lang].title}
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              {sectionNavByLang[lang].items.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="rounded-full border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-card"
                >
                  {item.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-6 md:px-6 md:py-8">
        <div className="container-wide">
          <div className="rounded-[1.5rem] border border-border/80 bg-card px-5 py-5 shadow-sm md:px-6">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              {flowSummaryByLang[lang].title}
            </p>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {flowSummaryByLang[lang].items.map((item, index) => (
                <div key={item} className="rounded-2xl border border-border/70 bg-background px-4 py-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                    {index + 1}
                  </p>
                  <p className="mt-2 text-sm leading-7 text-foreground/85">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="partner-economics" className="section-padding bg-section-alt">
        <motion.div {...sectionMotion} className={sectionShellClass}>
          <h2 className="max-w-3xl text-2xl font-semibold tracking-tight md:text-3xl">{page.economics.title}</h2>
          <p className="mt-4 max-w-2xl text-base leading-7 text-subtle md:text-lg">{page.economics.body}</p>
          <div className="mt-10 rounded-[1.75rem] border border-border/80 bg-card p-6 shadow-sm md:p-8">
            <div className="grid gap-5 lg:grid-cols-2">
              <div className="rounded-[1.5rem] border border-border/70 bg-background/80 p-5">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold tracking-tight text-foreground">
                    {economicsTraditionalLabelByLang[lang] ?? economicsTraditionalLabelByLang.en}
                  </p>
                  <span className="rounded-full border border-border/70 bg-card px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                    {economicsIncreaseLabelByLang[lang] ?? economicsIncreaseLabelByLang.en}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-7 text-foreground/80 md:text-base">
                  {economicsTraditionalBodyByLang[lang] ?? economicsTraditionalBodyByLang.en}
                </p>
                <div className="mt-5 space-y-3">
                  {page.economics.steps.map((step, index) => (
                    <div key={step.label}>
                      <div className="rounded-2xl border border-border/70 bg-card px-5 py-5 shadow-sm">
                        <p className="text-xs font-medium uppercase tracking-[0.08em] text-subtle">{step.label}</p>
                        <p className="mt-2 font-serif text-2xl font-semibold tracking-tight md:text-3xl">{step.value}</p>
                      </div>
                      {index < page.economics.steps.length - 1 ? (
                        <div className="mt-3 flex justify-center">
                          <div className="inline-flex items-center gap-2 rounded-full border border-dashed border-border/70 bg-card px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                            <ArrowDown className="h-3.5 w-3.5" />
                            {economicsIncreaseLabelByLang[lang] ?? economicsIncreaseLabelByLang.en}
                          </div>
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[1.5rem] border border-border/70 bg-secondary/30 p-5">
                <p className="text-sm font-semibold tracking-tight text-foreground">
                  {economicsDirectLabelByLang[lang] ?? economicsDirectLabelByLang.en}
                </p>
                <p className="mt-2 text-sm leading-7 text-foreground/85 md:text-base">
                  {economicsDirectBodyByLang[lang] ?? economicsDirectBodyByLang.en}
                </p>
                <div className="mt-5 rounded-2xl border border-border/70 bg-card px-4 py-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                    {page.economics.modelLabel}
                  </p>
                  <p className="mt-2 text-sm leading-7 text-foreground/85 md:text-base">{page.economics.modelBody}</p>
                </div>
                <div className="mt-4 rounded-2xl border border-border/70 bg-background px-4 py-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                    {economicsSplitTitleByLang[lang] ?? economicsSplitTitleByLang.en}
                  </p>
                  <p className="mt-2 text-sm leading-7 text-foreground/85 md:text-base">
                    {economicsSplitBodyByLang[lang] ?? economicsSplitBodyByLang.en}
                  </p>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl border border-border/70 bg-secondary/20 px-4 py-4 text-center">
                      <p className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                        {economicsSplitCompanyLabelByLang[lang] ?? economicsSplitCompanyLabelByLang.en}
                      </p>
                      <p className="mt-2 font-serif text-3xl font-semibold tracking-tight text-foreground">
                        {economicsSplitValueByLang[lang] ?? economicsSplitValueByLang.en}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-border/70 bg-secondary/20 px-4 py-4 text-center">
                      <p className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                        {economicsSplitPartnerLabelByLang[lang] ?? economicsSplitPartnerLabelByLang.en}
                      </p>
                      <p className="mt-2 font-serif text-3xl font-semibold tracking-tight text-foreground">
                        {economicsSplitValueByLang[lang] ?? economicsSplitValueByLang.en}
                      </p>
                    </div>
                  </div>
                  <p className="mt-4 text-xs leading-6 text-muted-foreground">
                    {economicsSplitNoteByLang[lang] ?? economicsSplitNoteByLang.en}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-border/70 bg-background px-5 py-5">
              <p className="text-base font-semibold tracking-tight text-foreground md:text-lg">
                {economicsConclusionByLang[lang] ?? economicsConclusionByLang.en}
              </p>
              <p className="mt-3 text-sm leading-7 text-foreground/85 md:text-base">{page.economics.modelBody}</p>
              <p className="mt-4 text-xs leading-6 text-muted-foreground md:text-sm">
                <span className="font-medium text-foreground/85">{page.economics.calloutTitle}</span>{" "}
                {page.economics.calloutBody} {page.economics.note}
              </p>
            </div>
          </div>
        </motion.div>
      </section>

      <section className="px-4 py-10 md:px-6 md:py-12">
        <motion.div {...sectionMotion} className={sectionShellClass}>
          <h2 className="max-w-3xl text-2xl font-semibold tracking-tight md:text-3xl">{proofLayerByLang[lang].title}</h2>
          <p className="mt-4 max-w-3xl text-base leading-7 text-subtle md:text-lg">{proofLayerByLang[lang].body}</p>
          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {proofLayerByLang[lang].cards.map((card) => (
              <ExpandableInfoCard key={card.title} lang={lang} title={card.title} text={card.text} />
            ))}
          </div>
        </motion.div>
      </section>

      <section id="partner-reasons" className="px-4 py-10 md:px-6 md:py-12">
        <motion.div {...sectionMotion} className={sectionShellClass}>
          <h2 className="max-w-3xl text-2xl font-semibold tracking-tight md:text-3xl">{page.reasons.title}</h2>
          <p className="mt-4 max-w-3xl text-base leading-7 text-subtle md:text-lg">{page.reasons.body}</p>
          <div className="mt-10 grid gap-5 md:grid-cols-2">
            {page.reasons.cards.map((card) => (
              <div key={card.title} className="flex h-full flex-col rounded-[1.5rem] border border-border/80 bg-card p-6 shadow-sm">
                <h3 className="text-lg font-semibold tracking-tight">{card.title}</h3>
                <p className="mt-3 text-sm leading-7 text-subtle md:text-[15px]">{card.text}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      <section className="bg-section-alt px-4 py-10 md:px-6 md:py-12">
        <motion.div {...sectionMotion} className={sectionShellClass}>
          <h2 className="max-w-3xl text-2xl font-semibold tracking-tight md:text-3xl">{whyZinzinoByLang[lang].title}</h2>
          <p className="mt-4 max-w-3xl text-base leading-7 text-subtle md:text-lg">{whyZinzinoByLang[lang].body}</p>
          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {whyZinzinoByLang[lang].cards.map((card) => (
              <ExpandableInfoCard key={card.title} lang={lang} title={card.title} text={card.text} />
            ))}
          </div>
        </motion.div>
      </section>

      <section id="partner-fit" className="bg-section-alt px-4 py-10 md:px-6 md:py-12">
        <motion.div {...sectionMotion} className={sectionShellClass}>
          <h2 className="max-w-3xl text-2xl font-semibold tracking-tight md:text-3xl">{page.fit.title}</h2>
          <p className="mt-4 max-w-3xl text-base leading-7 text-subtle md:text-lg">{page.fit.body}</p>
          <div className="mt-10 grid gap-5 xl:grid-cols-3">
            {page.fit.columns.map((column) => (
              <div key={column.title} className="rounded-[1.5rem] border border-border/80 bg-card p-6 shadow-sm">
                <h3 className="text-lg font-semibold tracking-tight">{column.title}</h3>
                <ul className="mt-5 space-y-3">
                  {column.items.map((item) => (
                    <li key={item} className="flex items-start gap-3 text-sm leading-7 text-subtle md:text-[15px]">
                      <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-primary" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      <section id="partner-steps" className="px-4 py-10 md:px-6 md:py-12">
        <motion.div {...sectionMotion} className={sectionShellClass}>
          <h2 className="max-w-3xl text-2xl font-semibold tracking-tight md:text-3xl">{page.steps.title}</h2>
          <p className="mt-4 max-w-3xl text-base leading-7 text-subtle md:text-lg">{page.steps.body}</p>
          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {page.steps.items.map((item, index) => (
              <div key={item.title} className="rounded-[1.5rem] border border-border/80 bg-card p-6 shadow-sm">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-accent font-semibold text-accent-foreground">
                  {index + 1}
                </div>
                <h3 className="mt-5 text-lg font-semibold tracking-tight">{item.title}</h3>
                <p className="mt-3 text-sm leading-7 text-subtle md:text-[15px]">{item.text}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      <section className="px-4 py-10 md:px-6 md:py-12">
        <motion.div
          {...sectionMotion}
          className="container-wide mx-auto rounded-[1.75rem] border border-border/80 bg-card/85 px-6 py-8 text-center shadow-sm md:px-10 md:py-10"
        >
          <p className="mx-auto max-w-2xl text-base leading-7 text-subtle md:text-lg">{page.sticky.text}</p>
          <div className="mt-6">
            <a
              href="#partner-application"
              className="btn-primary inline-flex min-h-12 items-center justify-center px-6 py-3.5 text-center text-base"
              onClick={() => void logFunnelEvent("partner_bottom_cta_clicked", {
                pathname: location.pathname,
                search: location.search,
                details: {
                  placement: "bottom-section",
                },
              })}
            >
              {page.sticky.cta}
            </a>
          </div>
        </motion.div>
      </section>

      <FooterSection lang={lang} />

      {showStickyCta ? (
        <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-card/95 px-3 py-3 backdrop-blur-lg md:hidden">
          <div className="container-wide flex items-center justify-between gap-2">
            <p className="hidden text-sm font-medium text-foreground/85 sm:block">{page.sticky.text}</p>
            <a
              href="#partner-application"
              className="btn-primary w-full whitespace-nowrap px-5 py-3 text-center text-base sm:w-auto"
              onClick={() => void logFunnelEvent("partner_sticky_cta_clicked", {
                pathname: location.pathname,
                search: location.search,
                details: {
                  placement: "sticky-bar",
                },
              })}
            >
              {page.sticky.cta}
            </a>
          </div>
        </div>
      ) : null}
    </div>
  );
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2.5 block text-sm font-medium text-foreground">{label}</span>
      {children}
    </label>
  );
}

export default PartnerPage;
