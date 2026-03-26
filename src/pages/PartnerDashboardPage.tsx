import { useMemo, useState } from "react";
import { Copy, Link2, UserPlus2, Users } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, Navigate, useParams, useSearchParams } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DashboardSection, DashboardShell, dashboardIcons } from "@/components/dashboard/DashboardShell";
import { DataTable } from "@/components/dashboard/DataTable";
import { MetricCard } from "@/components/dashboard/MetricCard";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { isSupabaseConfigured } from "@/integrations/supabase/client";
import { getPartnerDashboardData, getPortalAccessState, signOutPortalUser, updatePartnerZzLinks } from "@/lib/omega-data";
import type { Lead, PartnerDashboardData } from "@/lib/omega-types";
import { hasAcceptedPortalLegal } from "@/lib/portal-legal";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("sv-SE", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

function getLeadStatusLabel(status: Lead["status"]) {
  switch (status) {
    case "new":
      return "Behöver kontakt";
    case "qualified":
      return "Följ upp nu";
    case "active":
      return "Aktiv dialog";
    case "inactive":
      return "Vilande";
    case "won":
      return "Klart";
    case "lost":
      return "Avslutad";
    default:
      return status;
  }
}

function getLeadPriorityScore(lead: Lead) {
  switch (lead.status) {
    case "won":
      return 5;
    case "active":
      return 4;
    case "qualified":
      return 3;
    case "new":
      return 2;
    case "inactive":
      return 1;
    case "lost":
      return 0;
    default:
      return 0;
  }
}

function getLeadNextAction(lead: Lead) {
  switch (lead.status) {
    case "new":
      return "Ta första kontakt i dag.";
    case "qualified":
      return "Följ upp medan signalen fortfarande är varm.";
    case "active":
      return lead.type === "partner_lead"
        ? "Håll dialogen levande och försök boka nästa steg."
        : "För dialogen vidare mot test, order eller tydligt beslut.";
    case "inactive":
      return "Parkera tillfälligt och ta ny kontakt vid rätt läge.";
    case "won":
      return "Bygg vidare på det som fungerade och skapa nästa resultat.";
    case "lost":
      return "Lägg ingen energi här just nu.";
    default:
      return "Bestäm nästa tydliga steg.";
  }
}

function getLeadStatusVariant(status: Lead["status"]) {
  switch (status) {
    case "qualified":
    case "active":
      return "secondary" as const;
    case "won":
      return "default" as const;
    default:
      return "outline" as const;
  }
}

function getLeadSituationLabel(lead: Lead) {
  switch (lead.status) {
    case "new":
      return "Kall";
    case "qualified":
      return "Varm";
    case "active":
      return "Het";
    case "inactive":
      return "Sval";
    case "won":
      return "Klar";
    case "lost":
      return "Stängd";
    default:
      return "Oklar";
  }
}

function getLeadSituationVariant(lead: Lead) {
  switch (lead.status) {
    case "qualified":
    case "active":
      return "secondary" as const;
    case "won":
      return "default" as const;
    default:
      return "outline" as const;
  }
}

function getLeadUrgencyLabel(lead: Lead) {
  switch (lead.status) {
    case "new":
    case "qualified":
      return "Hög";
    case "active":
      return "Nu";
    case "inactive":
      return "Låg";
    case "won":
    case "lost":
      return "Klar";
    default:
      return "Normal";
  }
}

function getLeadUrgencyVariant(lead: Lead) {
  switch (lead.status) {
    case "new":
    case "qualified":
    case "active":
      return "default" as const;
    default:
      return "outline" as const;
  }
}

function hasRequiredZzLinks(data: PartnerDashboardData) {
  return Boolean(data.zzLinks.test && data.zzLinks.shop && data.zzLinks.partner);
}

function buildPartnerStartAction(data: PartnerDashboardData, legalAccepted: boolean) {
  if (!legalAccepted) {
    return {
      title: "Bekräfta grunden",
      description: "Godkänn portalvillkor och integritet innan du går vidare.",
      mode: "legal" as const,
      label: "Öppna legal",
    };
  }

  if (!hasRequiredZzLinks(data)) {
    return {
      title: "Lägg in dina ZZ-länkar",
      description: "Test-, shop- och partnerlänk behöver finnas på plats innan du börjar arbeta externt.",
      mode: "links" as const,
      label: "Öppna länkar",
    };
  }

  if (data.leads.length === 0 && data.partnerLeads.length === 0 && data.customers.length === 0 && data.metrics.directPartners === 0) {
    return {
      title: "Skapa första signalen",
      description: "När grunden är klar är nästa steg att dela Omega-länken och få in första rörelsen.",
      mode: "copy-link" as const,
      label: "Kopiera Omega-länk",
    };
  }

  return {
    title: "Arbeta vidare i leads",
    description: "Du har redan signaler i gång. Fortsätt där arbetet faktiskt rör sig just nu.",
    mode: "leads" as const,
    label: "Öppna leads",
  };
}

function buildFirstResultFocus(data: PartnerDashboardData) {
  const allLeads = [...data.leads, ...data.partnerLeads];
  const firstResultReached = data.customers.length > 0 || data.metrics.directPartners > 0;
  const warmLead = allLeads.find((lead) => lead.status === "qualified");
  const activeLead = allLeads.find((lead) => lead.status === "active");
  const newLead = allLeads.find((lead) => lead.status === "new");

  if (data.metrics.directPartners > 0) {
    return {
      title: "Hjälp första linjen igång",
      reason: "Du har redan skapat egen rörelse. Nu blir nästa hävstång att hjälpa någon nära dig till sin första signal.",
      action: "Välj en partner i första linjen och hjälp den personen till ett första tydligt steg denna vecka.",
    };
  }

  if (firstResultReached) {
    return {
      title: "Bygg på första resultatet",
      reason: "Nu gäller det att upprepa det som fungerade medan tempot fortfarande finns kvar.",
      action: "Fokusera på ett andra resultat i samma riktning i stället för att sprida dig för brett.",
    };
  }

  if (activeLead) {
    return {
      title: "Driv aktiv dialog framåt",
      reason: "Det finns redan rörelse. Det viktiga nu är att hålla tempot uppe tills du får ett tydligt utfall.",
      action: getLeadNextAction(activeLead),
    };
  }

  if (warmLead) {
    return {
      title: "Följ upp varm lead nu",
      reason: "Det här är läget där första resultat ofta avgörs.",
      action: `Ta nästa kontakt med ${warmLead.name} medan signalen fortfarande är varm.`,
    };
  }

  if (newLead) {
    return {
      title: "Ta första kontakt i dag",
      reason: "Ett nytt lead är mest värdefullt tidigt, innan tempot sjunker.",
      action: `Börja med ${newLead.name} och ta första kontakt i dag.`,
    };
  }

  return {
    title: "Skapa första signalen",
    reason: "Du behöver första rörelsen i systemet innan något annat blir viktigt.",
    action: "Dela din Omega-länk och försök få in ett första kund- eller partnerlead.",
  };
}

function buildWeeklyPlan(data: PartnerDashboardData) {
  const allLeads = [...data.leads, ...data.partnerLeads];
  const activeLead = allLeads.find((lead) => lead.status === "active");
  const warmLead = allLeads.find((lead) => lead.status === "qualified");
  const newLead = allLeads.find((lead) => lead.status === "new");

  if (data.metrics.directPartners > 0) {
    return {
      title: "Den här veckan",
      items: [
        "Välj en person i första linjen som du aktivt hjälper framåt.",
        "Sätt ett enda tydligt mål för den personen denna vecka.",
        "Följ upp utfallet innan du sprider fokus vidare.",
      ],
    };
  }

  if (data.customers.length > 0 || data.metrics.directPartners > 0) {
    return {
      title: "Den här veckan",
      items: [
        "Upprepa samma aktivitet som gav ditt första resultat.",
        "Fokusera på ett andra resultat innan du breddar för mycket.",
        "Skydda tempot genom att följa upp det som redan är igång.",
      ],
    };
  }

  if (activeLead) {
    return {
      title: "Den här veckan",
      items: [
        `Driv dialogen med ${activeLead.name} till ett tydligt utfall.`,
        "Låt inte aktiv rörelse bli stående utan nästa steg.",
        "Prioritera färre samtal med högre kvalitet framför fler lösa kontakter.",
      ],
    };
  }

  if (warmLead) {
    return {
      title: "Den här veckan",
      items: [
        `Följ upp ${warmLead.name} medan signalen fortfarande är varm.`,
        "Försök få ett tydligt besked i stället för att lämna dialogen öppen.",
        "Skriv kort vad nästa steg är direkt efter kontakten.",
      ],
    };
  }

  if (newLead) {
    return {
      title: "Den här veckan",
      items: [
        `Ta första kontakt med ${newLead.name}.`,
        "Skapa ett enkelt tempo: kontakt först, funderingar sen.",
        "Fokusera på att få ett första svar, inte på att göra allt perfekt.",
      ],
    };
  }

  return {
    title: "Den här veckan",
    items: [
      "Dela din Omega-länk i ett sammanhang där du faktiskt får respons.",
      "Sikta på en första tydlig signal, inte maximal räckvidd.",
      "När första leaden kommer in, följ upp snabbt samma dag.",
    ],
  };
}

function buildPracticalWorkSuggestions(data: PartnerDashboardData) {
  const allLeads = [...data.leads, ...data.partnerLeads];
  const firstResultReached = data.customers.length > 0 || data.metrics.directPartners > 0;
  const hasWarmDialog = allLeads.some((lead) => lead.status === "qualified" || lead.status === "active");

  if (data.metrics.directPartners > 0) {
    return {
      title: "Praktiskt arbetssätt",
      items: [
        "Ta ett kort avstämningssamtal med din närmaste partner och hjälp personen att välja en enda nästa aktivitet.",
        "Bjud hellre in till ett gemensamt Zoom-call än att försöka förklara allt själv i långa meddelanden.",
        "Be personen börja nära sitt eget nätverk och följ upp direkt efter första kontakterna.",
      ],
    };
  }

  if (firstResultReached || hasWarmDialog) {
    return {
      title: "Praktiskt arbetssätt",
      items: [
        "Följ upp medan dialogen fortfarande lever och försök få ett tydligt nästa steg i stället för lösa svar.",
        "När intresse finns, bjud hellre vidare till samtal eller Zoom än att skriva längre och längre förklaringar.",
        "Skriv kort efter varje kontakt vad som ska hända härnäst, så att tempot inte tappas bort.",
      ],
    };
  }

  return {
    title: "Praktiskt arbetssätt",
    items: [
      "Börja nära. Välj några personliga kontakter där det redan finns förtroende, i stället för att skriva till alla.",
      "Använd sociala medier för att väcka nyfikenhet och fortsätt sedan i dialog med dem som faktiskt svarar.",
      "När någon visar intresse, bjud vidare till samtal eller Zoom i stället för att försöka bära hela förklaringen själv.",
    ],
  };
}

function buildDuplicationPlaybook(data: PartnerDashboardData) {
  const allLeads = [...data.leads, ...data.partnerLeads];
  const firstResultReached = data.customers.length > 0 || data.metrics.directPartners > 0;
  const hasWarmDialog = allLeads.some((lead) => lead.status === "qualified" || lead.status === "active");
  const hasDirectPartner = data.metrics.directPartners > 0;
  const hasSponsor = Boolean(data.sponsor);

  if (hasDirectPartner) {
    return {
      title: "Så duplicerar du vidare",
      description: "Nu handlar det inte bara om din egen aktivitet, utan om att hjälpa första linjen att arbeta på samma sätt.",
      cards: [
        {
          title: "Personliga kontakter",
          summary: "Be partnern börja nära sitt eget nätverk där förtroende redan finns.",
          action: "Låt personen välja några namn i sin närhet innan ni breddar vidare.",
        },
        {
          title: "Sociala medier",
          summary: "Använd sociala medier för att öppna dörrar, inte för att bära hela förklaringen.",
          action: "Be partnern följa upp dem som faktiskt svarar i stället för att jaga räckvidd.",
        },
        {
          title: "Zoom eller samtal",
          summary: "När intresset är tydligt ska ni snabbare vidare till gemensamt samtal eller Zoom.",
          action: "Bjud hellre in till ett nästa steg än att förklara allt i text.",
        },
        {
          title: hasSponsor ? "Stöd uppåt och nedåt" : "Stöd i kärnan",
          summary: hasSponsor
            ? `Du hjälper nedåt och tar samtidigt hjälp av ${data.sponsor?.name} uppåt när det behövs.`
            : "Du hjälper din första linje vidare och tar stöd nära toppen när det behövs.",
          action: "Håll stödet nära nästa aktivitet, inte som allmän pepp eller teori.",
        },
      ],
    };
  }

  if (firstResultReached || hasWarmDialog) {
    return {
      title: "Så bygger du vidare",
      description: "Du har redan rörelse. Nästa steg är att göra arbetssättet tydligt och upprepningsbart.",
      cards: [
        {
          title: "Personliga kontakter",
          summary: "Börja med personer där du naturligt kan ta nästa kontakt utan att det känns krystat.",
          action: "Välj hellre några relevanta kontakter än att skriva till många samtidigt.",
        },
        {
          title: "Sociala medier",
          summary: "Låt sociala medier väcka nyfikenhet, men ta dialogen vidare där riktig respons finns.",
          action: "Svara snabbt där någon visar intresse i stället för att sprida energin för brett.",
        },
        {
          title: "Zoom eller samtal",
          summary: "När frågorna blir fler än ett par meddelanden är det oftast dags för samtal.",
          action: "Flytta dialogen till Zoom eller telefon när du märker att intresset är på riktigt.",
        },
        {
          title: hasSponsor ? "Ta hjälp uppåt" : "Ta stöd nära toppen",
          summary: hasSponsor
            ? `Du behöver inte bära allt själv. Ta hjälp av ${data.sponsor?.name} när dialogen behöver nästa nivå.`
            : "Du behöver inte bära allt själv. Ta stöd nära toppen när dialogen behöver nästa nivå.",
          action: "Be om hjälp när det kan öka kvaliteten i ett samtal eller nästa steg.",
        },
      ],
    };
  }

  return {
    title: "Så kommer du igång",
    description: "Det första arbetssättet ska vara enkelt nog att upprepa och tydligt nog att kännas naturligt.",
    cards: [
      {
        title: "Personliga kontakter",
        summary: "Börja nära med några personer där det redan finns förtroende.",
        action: "Tänk familj, vänner, tidigare kollegor eller andra du kan kontakta utan att det känns konstlat.",
      },
      {
        title: "Sociala medier",
        summary: "Använd sociala medier för att skapa nyfikenhet, inte för att jaga alla samtidigt.",
        action: "Lägg energi på dem som svarar eller visar verkligt intresse.",
      },
      {
        title: "Zoom eller samtal",
        summary: "Du behöver inte förklara allt själv i text från början.",
        action: "När intresse finns, bjud vidare till ett samtal eller Zoom i stället för att skriva längre meddelanden.",
      },
      {
        title: hasSponsor ? "Ta hjälp uppåt" : "Stöd nära toppen",
        summary: hasSponsor
          ? "När du kör fast är nästa steg ofta att ta hjälp av din up-line."
          : "När du kör fast är nästa steg ofta att ta stöd nära toppen i stället för att tveka för länge själv.",
        action: "Hjälp tas bäst i samband med en verklig kontakt eller ett konkret nästa steg.",
      },
    ],
  };
}

function buildDuplicationRhythm(data: PartnerDashboardData) {
  const nearestDownline = data.team[0];
  const hasSponsor = Boolean(data.sponsor);
  const hasDirectPartner = data.metrics.directPartners > 0;

  if (!hasDirectPartner) {
    return {
      title: "Duplicering börjar så här",
      items: [
        "Bygg först din egen rytm tills du vet vad som faktiskt fungerar i praktiken.",
        "Spara kort vad du säger i första kontakt, hur du följer upp och när du bjuder vidare till samtal eller Zoom.",
        hasSponsor
          ? "När något börjar fungera, stäm av med din up-line hur samma arbetssätt kan göras enklare att upprepa."
          : "När något börjar fungera, håll arbetssättet enkelt nog att upprepa innan du försöker bredda det.",
      ],
    };
  }

  return {
    title: "Din dupliceringsrytm",
    items: [
      nearestDownline
        ? `Fokusera denna vecka på att hjälpa ${nearestDownline.partnerName} till ett enda tydligt nästa steg.`
        : "Fokusera denna vecka på din närmaste first line och håll stödet nära nästa aktivitet.",
      "Använd gemensamt samtal eller Zoom när det höjer kvaliteten, i stället för att skriva längre förklaringar i efterhand.",
      hasSponsor
        ? `När ni kör fast, lyft läget kort till ${data.sponsor?.name} med vad som redan är gjort och vad nästa hinder faktiskt är.`
        : "När ni kör fast, lyft bara det som behöver nästa nivå av stöd och håll resten nära vardagsarbetet.",
    ],
  };
}

function buildLeadQueueSummary(leads: Lead[]) {
  const urgent = leads.filter((lead) => lead.status === "new" || lead.status === "qualified").length;
  const active = leads.filter((lead) => lead.status === "active").length;
  const newLeads = leads.filter((lead) => lead.status === "new").length;
  const done = leads.filter((lead) => lead.status === "won").length;

  return [
    { label: "Brådskande nu", value: urgent },
    { label: "Aktiva dialoger", value: active },
    { label: "Nya", value: newLeads },
    { label: "Klart", value: done },
  ];
}

function getFirstResultProgress(data: PartnerDashboardData) {
  const allLeads = [...data.leads, ...data.partnerLeads];
  const hasLead = allLeads.length > 0;
  const hasResponse = allLeads.some(
    (lead) => lead.status === "qualified" || lead.status === "active" || lead.status === "won",
  );
  const hasResult = data.customers.length > 0 || data.metrics.directPartners > 0;

  return [
    {
      label: "Första aktivitet",
      description: "Ett lead eller en första signal har skapats.",
      done: hasLead,
      current: !hasLead,
    },
    {
      label: "Respons",
      description: "En dialog har kommit igång och är redo för tydlig uppföljning.",
      done: hasResponse,
      current: hasLead && !hasResponse,
    },
    {
      label: "Första resultat",
      description: "En kundsignal eller tydlig partnerreaktion finns.",
      done: hasResult,
      current: hasResponse && !hasResult,
    },
    {
      label: "Nästa fas",
      description: "Nu handlar det om att upprepa det som fungerar och skapa stabil rytm.",
      done: hasResult,
      current: false,
    },
  ];
}

function buildPartnerFirst30Days(data: PartnerDashboardData, legalAccepted: boolean) {
  const customerLeads = data.leads.filter((lead) => lead.type === "customer_lead").length;
  const partnerLeads = data.partnerLeads.length;
  const customers = data.customers.length;
  const directPartners = data.metrics.directPartners;
  const zzLinksReady = hasRequiredZzLinks(data);

  const checklist = [
    { label: "Godkänn portalvillkor och integritet", done: legalAccepted },
    { label: "Lägg in dina tre ZZ-länkar", done: zzLinksReady },
    { label: "Dela din referral-länk", done: data.partner.referral_code.length > 0 },
    { label: "Skapa första kundsignal", done: customerLeads > 0 || customers > 0 },
    { label: "Skapa första partnerintresse", done: partnerLeads > 0 },
    { label: "Få första direkta partnerkontakt", done: directPartners > 0 },
  ];

  if (!legalAccepted) {
    return {
      stageLabel: "Bekräfta grunden",
      summary: "Innan du arbetar vidare i portalen behöver villkor och integritet vara godkända.",
      nextMilestone: "Godkända portalvillkor och integritet",
      nextBestAction: "Läs igenom dokumenten, bekräfta att du förstått upplägget och slutför godkännandet.",
      checklist,
    };
  }

  if (!zzLinksReady) {
    return {
      stageLabel: "Lägg grunden",
      summary: "Innan du driver trafik eller följer upp leads behöver test-, shop- och partnerlänken finnas på plats.",
      nextMilestone: "Tre Zinzino-destinationer sparade",
      nextBestAction: "Gå till Länkar och lägg in dina tre personliga ZZ-länkar innan du börjar arbeta externt.",
      checklist,
    };
  }

  if (customers === 0 && customerLeads === 0 && partnerLeads === 0 && directPartners === 0) {
    return {
      stageLabel: "Kom igång",
      summary: "Fokus just nu är att skapa första riktiga rörelsen, inte att göra allt samtidigt.",
      nextMilestone: "Första kundsignal eller första partnerintresse",
      nextBestAction: "Dela din länk och fokusera på att få din första kund eller ditt första partnerlead.",
      checklist,
    };
  }

  if (customers === 0 && customerLeads <= 1 && partnerLeads <= 1 && directPartners === 0) {
    return {
      stageLabel: "Första resultat",
      summary: "Du har börjat röra dig. Nu gäller det att visa att det inte bara var ett enstaka försök.",
      nextMilestone: "Ett andra resultat i samma riktning",
      nextBestAction: "Upprepa det som gav första signalen och håll fokus på samma typ av aktivitet några dagar till.",
      checklist,
    };
  }

  if (directPartners === 0) {
    return {
      stageLabel: "Bygg upprepad aktivitet",
      summary: "Du har flera signaler igång, men allt bygger fortfarande mest på din egen aktivitet.",
      nextMilestone: "Första direkta partnerkontakt eller tydlig first-line-signal",
      nextBestAction: "Fortsätt skapa kund- och partnerintresse, men börja styra fokus mot att få in din första direkta partnerkontakt.",
      checklist,
    };
  }

  if (directPartners > 0 && partnerLeads + customerLeads + customers < 4) {
    return {
      stageLabel: "Aktivera first line",
      summary: "Du är inte längre helt själv i flödet. Nästa steg är att hjälpa första linjen att börja röra sig.",
      nextMilestone: "Första tydliga signalen från first line",
      nextBestAction: "Hjälp din första partner att få sitt första lead eller sin första kundsignal i stället för att bara producera själv.",
      checklist,
    };
  }

  return {
    stageLabel: "Tidig duplicering",
    summary: "Det finns tidiga signaler på att arbetet börjar upprepa sig genom andra. Nu handlar det om stabilitet, inte bara fart.",
    nextMilestone: "Fler återkommande signaler från first line",
    nextBestAction: "Skydda det som fungerar och hjälp fler i första linjen att upprepa samma beteende.",
    checklist,
  };
}

const PartnerDashboardPage = () => {
  const { section } = useParams<{ section?: string }>();
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const partnerId = searchParams.get("partnerId") || undefined;
  const isDemo = searchParams.get("demo") === "partner" || !isSupabaseConfigured;
  const [zzLinksOpen, setZzLinksOpen] = useState(false);
  const [zzTestUrl, setZzTestUrl] = useState("");
  const [zzShopUrl, setZzShopUrl] = useState("");
  const [zzPartnerUrl, setZzPartnerUrl] = useState("");
  const [zzConsultationUrl, setZzConsultationUrl] = useState("");
  const [zzLinkStatus, setZzLinkStatus] = useState<string | null>(null);
  const [leadFilter, setLeadFilter] = useState<"all" | "urgent" | "active" | "new">("all");
  const [partnerLeadFilter, setPartnerLeadFilter] = useState<"all" | "urgent" | "active" | "new">("all");
  const partnerQuery = useQuery({
    queryKey: ["partner-dashboard", partnerId],
    queryFn: () => getPartnerDashboardData(partnerId),
  });
  const accessQuery = useQuery({
    queryKey: ["portal-access", "partner-view"],
    queryFn: getPortalAccessState,
    enabled: isSupabaseConfigured && !isDemo,
  });
  const zzLinksMutation = useMutation({
    mutationFn: () =>
      data
        ? updatePartnerZzLinks(data.partner.id, {
            test: zzTestUrl,
            shop: zzShopUrl,
            partner: zzPartnerUrl,
            consultation: zzConsultationUrl,
          })
        : Promise.reject(new Error("Ingen partnerdata hittades.")),
    onSuccess: async () => {
      setZzLinkStatus("Dina ZZ-länkar är sparade.");
      await queryClient.invalidateQueries({ queryKey: ["partner-dashboard", partnerId] });
      await queryClient.invalidateQueries({ queryKey: ["admin-dashboard"] });
    },
    onError: (error) => {
      setZzLinkStatus(error instanceof Error ? error.message : "Kunde inte spara dina ZZ-länkar.");
    },
  });

  const currentSection =
    section === "leads" || section === "network" || section === "overview" || section === "links" || section === "customers"
      ? section
      : section
        ? null
        : "overview";

  const navigation = useMemo(
    () => [
      { label: "Översikt", href: "/dashboard/partner/overview", icon: dashboardIcons.dashboard },
      { label: "Leads", href: "/dashboard/partner/leads", icon: dashboardIcons.leads },
      { label: "Länkar", href: "/dashboard/partner/links", icon: Link2 },
      { label: "Kunder", href: "/dashboard/partner/customers", icon: Users },
      { label: "Kontakter", href: "/dashboard/partner/network", icon: dashboardIcons.network },
    ],
    [],
  );

  if (!isDemo && !isSupabaseConfigured) {
    return <Navigate to="/dashboard/login" replace />;
  }

  if (!currentSection) {
    return <Navigate to="/dashboard/partner/overview" replace />;
  }

  const data = partnerQuery.data;
  const legalAccepted = hasAcceptedPortalLegal(accessQuery.data?.portalUser);
  const journey = data ? buildPartnerFirst30Days(data, legalAccepted) : null;
  const viewingAsAdmin = accessQuery.data?.portalUser?.role === "admin";
  const legalActionHref = viewingAsAdmin ? "/dashboard/admin/legal-preview" : "/dashboard/partner/legal";
  const showOverview = currentSection === "overview";
  const showLeads = currentSection === "leads";
  const showLinks = currentSection === "links";
  const showCustomers = currentSection === "customers";
  const showNetwork = currentSection === "network";
  const partnerLink = data ? `${window.location.origin}/?ref=${data.partner.referral_code}` : "";
  const firstResultProgress = data ? getFirstResultProgress(data) : [];
  const firstResultFocus = data ? buildFirstResultFocus(data) : null;
  const weeklyPlan = data ? buildWeeklyPlan(data) : null;
  const practicalSuggestions = data ? buildPracticalWorkSuggestions(data) : null;
  const duplicationPlaybook = data ? buildDuplicationPlaybook(data) : null;
  const duplicationRhythm = data ? buildDuplicationRhythm(data) : null;
  const startAction = data ? buildPartnerStartAction(data, legalAccepted) : null;
  const leadQueueSummary = data ? buildLeadQueueSummary(data.leads) : [];
  const partnerLeadQueueSummary = data ? buildLeadQueueSummary(data.partnerLeads) : [];
  const prioritizedLeads = data
    ? [...data.leads, ...data.partnerLeads]
        .sort((a, b) => {
          const scoreDiff = getLeadPriorityScore(b) - getLeadPriorityScore(a);
          if (scoreDiff !== 0) {
            return scoreDiff;
          }

          return new Date(b.updated_at || b.created_at).getTime() - new Date(a.updated_at || a.created_at).getTime();
        })
        .slice(0, 3)
    : [];
  const matchesLeadFilter = (lead: Lead, filter: "all" | "urgent" | "active" | "new") => {
    if (filter === "all") {
      return true;
    }

    if (filter === "urgent") {
      return lead.status === "new" || lead.status === "qualified";
    }

    if (filter === "active") {
      return lead.status === "active" || lead.status === "won";
    }

    return lead.status === "new";
  };
  const filteredLeads = data ? data.leads.filter((lead) => matchesLeadFilter(lead, leadFilter)) : [];
  const filteredPartnerLeads = data ? data.partnerLeads.filter((lead) => matchesLeadFilter(lead, partnerLeadFilter)) : [];
  const sortedFilteredLeads = [...filteredLeads].sort((a, b) => {
    const scoreDiff = getLeadPriorityScore(b) - getLeadPriorityScore(a);
    if (scoreDiff !== 0) {
      return scoreDiff;
    }

    return new Date(b.updated_at || b.created_at).getTime() - new Date(a.updated_at || a.created_at).getTime();
  });
  const sortedFilteredPartnerLeads = [...filteredPartnerLeads].sort((a, b) => {
    const scoreDiff = getLeadPriorityScore(b) - getLeadPriorityScore(a);
    if (scoreDiff !== 0) {
      return scoreDiff;
    }

    return new Date(b.updated_at || b.created_at).getTime() - new Date(a.updated_at || a.created_at).getTime();
  });
  const openZzLinksDialog = () => {
    if (!data) {
      return;
    }

    setZzTestUrl(data.zzLinks.test || "");
    setZzShopUrl(data.zzLinks.shop || "");
    setZzPartnerUrl(data.zzLinks.partner || "");
    setZzConsultationUrl(data.zzLinks.consultation || "");
    setZzLinkStatus(null);
    setZzLinksOpen(true);
  };

  return (
    <DashboardShell
      title="Partnerdashboard"
      subtitle="Din egen vy över referral-länk, leads, kunder och direkta partnerkontakter. Bara det som hör till dig visas här."
      roleLabel={isDemo ? "Partnerdemo" : "Partner"}
      navigation={navigation}
      onSignOut={isDemo ? undefined : () => void signOutPortalUser()}
    >
      <Dialog open={zzLinksOpen} onOpenChange={setZzLinksOpen}>
        <DialogContent className="max-w-2xl rounded-[1.75rem] border-border/70 bg-white/95 p-6 shadow-card md:p-7">
            <DialogHeader>
              <DialogTitle>Mina ZZ-länkar</DialogTitle>
              <DialogDescription>
                Lägg in dina riktiga Zinzino-länkar här. Just nu använder vi test-, shop- och partnerlänken i flödet.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="partner-zz-test">Testlänk</Label>
              <Input
                id="partner-zz-test"
                value={zzTestUrl}
                onChange={(event) => setZzTestUrl(event.target.value)}
                placeholder="https://..."
                className="rounded-xl"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="partner-zz-shop">Shoplänk</Label>
              <Input
                id="partner-zz-shop"
                value={zzShopUrl}
                onChange={(event) => setZzShopUrl(event.target.value)}
                placeholder="https://..."
                className="rounded-xl"
              />
            </div>

              <div className="grid gap-2">
                <Label htmlFor="partner-zz-partner">Partnerlänk</Label>
                <Input
                  id="partner-zz-partner"
                  value={zzPartnerUrl}
                  onChange={(event) => setZzPartnerUrl(event.target.value)}
                  placeholder="https://..."
                  className="rounded-xl"
                />
              </div>

            </div>

          <DialogFooter className="mt-3 flex-col items-stretch gap-3 sm:flex-row sm:justify-between">
            <div className="text-sm text-subtle">
              {zzLinkStatus ? zzLinkStatus : "Du kan uppdatera länkarna själv när dina Zinzino-destinationer ändras."}
            </div>
            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={() => setZzLinksOpen(false)}>
                Stäng
              </Button>
              <Button type="button" onClick={() => zzLinksMutation.mutate()} disabled={zzLinksMutation.isPending}>
                {zzLinksMutation.isPending ? "Sparar..." : "Spara länkar"}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {!data ? (
        <div className="rounded-[1.75rem] border border-border/70 bg-white/90 p-8 shadow-card">Laddar partnervy...</div>
      ) : (
        <div className="space-y-8">
          {viewingAsAdmin ? (
            <div className="rounded-[1.5rem] border border-amber-300/70 bg-amber-50 px-5 py-4 text-sm text-amber-950 shadow-card">
              Du tittar på partnervyn som admin. Den här sidan används för att granska partnerupplevelsen, inte för att ändra adminbehörighet.
            </div>
          ) : null}

          {showOverview && journey ? (
            <DashboardSection
              title="Dina första 30 dagar"
              description="En enkel kompass för vad som är viktigast just nu. Det här är inte ZZ-rank eller payout, utan din nästa tydliga riktning."
            >
              <div className="grid gap-3 xl:grid-cols-[1.1fr_0.9fr]">
                <div className="rounded-[1.2rem] border border-border/70 bg-secondary/30 p-4">
                  <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Nuvarande läge</p>
                  <p className="mt-3 font-serif text-3xl font-semibold tracking-tight text-foreground">{journey.stageLabel}</p>
                  <p className="mt-2 text-sm leading-6 text-subtle">{journey.summary}</p>

                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    <div className="rounded-[1rem] border border-border/70 bg-white/80 p-3.5">
                      <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Nästa milstolpe</p>
                      <p className="mt-2 text-sm text-foreground">{journey.nextMilestone}</p>
                    </div>
                    <div className="rounded-[1rem] border border-border/70 bg-white/80 p-3.5">
                      <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Nästa bästa steg</p>
                      <p className="mt-2 text-sm text-foreground">{journey.nextBestAction}</p>
                    </div>
                  </div>
                </div>

                <div className="grid gap-3">
                  {firstResultFocus ? (
                    <div className="rounded-[1.2rem] border border-border/70 bg-white p-4">
                      <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Fokus just nu</p>
                      <p className="mt-3 text-lg font-semibold text-foreground">{firstResultFocus.title}</p>
                      <p className="mt-2 text-sm leading-6 text-subtle">{firstResultFocus.reason}</p>
                      <div className="mt-3 rounded-[1rem] border border-border/70 bg-secondary/20 p-3.5">
                        <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Nästa handling</p>
                        <p className="mt-2 text-sm text-foreground">{firstResultFocus.action}</p>
                      </div>
                    </div>
                  ) : null}

                  {startAction ? (
                    <div className="rounded-[1.2rem] border border-border/70 bg-white p-4">
                      <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Gör detta nu</p>
                      <p className="mt-3 text-lg font-semibold text-foreground">{startAction.title}</p>
                      <p className="mt-2 text-sm leading-6 text-subtle">{startAction.description}</p>
                      <div className="mt-3">
                        {startAction.mode === "copy-link" ? (
                          <Button
                            type="button"
                            variant="outline"
                            className="h-8 rounded-lg px-3 text-sm"
                            onClick={() => navigator.clipboard.writeText(partnerLink)}
                          >
                            <Copy className="mr-2 h-3.5 w-3.5" />
                            {startAction.label}
                          </Button>
                        ) : startAction.mode === "links" ? (
                          <Button asChild type="button" variant="outline" className="h-8 rounded-lg px-3 text-sm">
                            <Link to="/dashboard/partner/links">{startAction.label}</Link>
                          </Button>
                        ) : startAction.mode === "leads" ? (
                          <Button asChild type="button" variant="outline" className="h-8 rounded-lg px-3 text-sm">
                            <Link to="/dashboard/partner/leads">{startAction.label}</Link>
                          </Button>
                        ) : (
                          <Button asChild type="button" variant="outline" className="h-8 rounded-lg px-3 text-sm">
                            <Link to={legalActionHref}>{startAction.label}</Link>
                          </Button>
                        )}
                      </div>
                    </div>
                  ) : null}

                  <div className="rounded-[1.2rem] border border-border/70 bg-white p-4">
                    <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Progress mot första resultat</p>
                    <div className="mt-3 space-y-2.5">
                      {firstResultProgress.map((step) => (
                        <div key={step.label} className="rounded-[1rem] border border-border/70 bg-secondary/20 p-3.5">
                          <div className="flex items-center justify-between gap-4">
                            <div>
                              <p className="text-sm font-medium text-foreground">{step.label}</p>
                              <p className="mt-1 text-xs leading-5 text-subtle">{step.description}</p>
                            </div>
                            <Badge
                              variant={step.done ? "default" : step.current ? "secondary" : "outline"}
                              className="rounded-full px-3 py-1"
                            >
                              {step.done ? "Klar" : step.current ? "Nu" : "Senare"}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {weeklyPlan ? (
                    <div className="rounded-[1.2rem] border border-border/70 bg-white p-4">
                      <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">{weeklyPlan.title}</p>
                      <div className="mt-3 space-y-2.5">
                        {weeklyPlan.items.map((item) => (
                          <div key={item} className="rounded-[1rem] border border-border/70 bg-secondary/20 px-3.5 py-3">
                            <p className="text-sm text-foreground">{item}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {practicalSuggestions ? (
                    <div className="rounded-[1.2rem] border border-border/70 bg-white p-4">
                      <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">{practicalSuggestions.title}</p>
                      <div className="mt-3 space-y-2.5">
                        {practicalSuggestions.items.map((item) => (
                          <div key={item} className="rounded-[1rem] border border-border/70 bg-secondary/20 px-3.5 py-3">
                            <p className="text-sm text-foreground">{item}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {duplicationPlaybook ? (
                    <div className="rounded-[1.2rem] border border-border/70 bg-white p-4">
                      <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">{duplicationPlaybook.title}</p>
                      <p className="mt-2 text-sm leading-6 text-subtle">{duplicationPlaybook.description}</p>
                      <div className="mt-3 grid gap-3 md:grid-cols-2">
                        {duplicationPlaybook.cards.map((card) => (
                          <div key={card.title} className="rounded-[1rem] border border-border/70 bg-secondary/20 p-3.5">
                            <p className="text-sm font-medium text-foreground">{card.title}</p>
                            <p className="mt-2 text-sm leading-6 text-subtle">{card.summary}</p>
                            <p className="mt-2 text-xs leading-5 text-foreground/80">{card.action}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {duplicationRhythm ? (
                    <div className="rounded-[1.2rem] border border-border/70 bg-white p-4">
                      <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">{duplicationRhythm.title}</p>
                      <div className="mt-3 space-y-2.5">
                        {duplicationRhythm.items.map((item) => (
                          <div key={item} className="rounded-[1rem] border border-border/70 bg-secondary/20 px-3.5 py-3">
                            <p className="text-sm text-foreground">{item}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  <div className="rounded-[1.2rem] border border-border/70 bg-white p-4">
                    <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Enkel checklista</p>
                    <div className="mt-3 space-y-2.5">
                      {journey.checklist.map((item) => (
                        <div
                          key={item.label}
                          className="flex items-center justify-between gap-4 rounded-[1rem] border border-border/70 bg-secondary/20 px-3.5 py-3"
                        >
                          <p className="text-sm text-foreground">{item.label}</p>
                          <Badge variant={item.done ? "default" : "outline"} className="rounded-full px-3 py-1">
                            {item.done ? "Klar" : "Kvar"}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </DashboardSection>
          ) : null}

          {showOverview ? (
            <DashboardSection
              title="Snabbåtgärder"
              description="Tre snabba vägar när du vill agera direkt."
            >
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                <div className="flex h-full flex-col justify-between rounded-[1.1rem] border border-border/70 bg-white/95 p-4 shadow-card">
                  <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Dela Omega-länken</p>
                  <p className="mt-2 text-sm leading-6 text-subtle">
                    När grunden är klar är detta länken du använder för att skapa ny rörelse.
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    className="mt-3 inline-flex h-8 max-w-full self-start whitespace-normal rounded-lg px-3 text-sm leading-tight"
                    onClick={() => navigator.clipboard.writeText(partnerLink)}
                  >
                    <Copy className="mr-2 h-3.5 w-3.5 shrink-0" />
                    Kopiera länk
                  </Button>
                </div>

                <div className="flex h-full flex-col justify-between rounded-[1.1rem] border border-border/70 bg-white/95 p-4 shadow-card">
                  <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Se ZZ-länkar</p>
                  <p className="mt-2 text-sm leading-6 text-subtle">
                    Börja här om dina test-, shop- eller partnerlänkar saknas.
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    className="mt-3 inline-flex h-8 max-w-full self-start whitespace-normal rounded-lg px-3 text-sm leading-tight"
                    onClick={openZzLinksDialog}
                  >
                    Redigera mina länkar
                  </Button>
                </div>

                <div className="flex h-full flex-col justify-between rounded-[1.1rem] border border-border/70 bg-white/95 p-4 shadow-card">
                  <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Arbeta med leads</p>
                  <p className="mt-2 text-sm leading-6 text-subtle">
                    Gå hit när du redan har signaler i gång och vill följa upp dem vidare.
                  </p>
                  <Button asChild type="button" variant="outline" className="mt-3 inline-flex h-8 max-w-full self-start whitespace-normal rounded-lg px-3 text-sm leading-tight">
                    <Link to="/dashboard/partner/leads">Öppna mina leads</Link>
                  </Button>
                </div>
              </div>
            </DashboardSection>
          ) : null}

          {showLinks ? (
            <DashboardSection
              title="Min Omega-länk"
              description="Länken du normalt delar vidare."
            >
              <div className="flex flex-col gap-4 rounded-[1.2rem] border border-border/70 bg-secondary/40 p-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Länken du delar</p>
                  <p className="mt-2 break-all font-medium text-foreground">{partnerLink}</p>
                  <p className="mt-2 text-sm leading-6 text-subtle">
                    Använd den här länken i första hand. Vi skickar vidare till rätt Zinzino-länk i bakgrunden.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  className="h-8 rounded-lg px-3 text-sm"
                  onClick={() => navigator.clipboard.writeText(partnerLink)}
                >
                  <Copy className="mr-2 h-3.5 w-3.5" />
                  Kopiera länk
                </Button>
              </div>
            </DashboardSection>
          ) : null}

          {showLinks ? (
            <DashboardSection
              title="Mina ZZ-länkar"
              description="Dina personliga destinationslänkar till Zinzino."
            >
              <div className="mb-4 flex items-center justify-between gap-3 rounded-[1.1rem] border border-border/70 bg-secondary/30 p-4">
                <p className="text-sm leading-6 text-subtle">
                  Lägg in och uppdatera dina egna test-, shop- och partnerlänkar här.
                </p>
                <Button type="button" variant="outline" className="h-8 rounded-lg px-3 text-sm" onClick={openZzLinksDialog}>
                  Redigera mina länkar
                </Button>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {[
                  { label: "Testlänk", value: data.zzLinks.test },
                  { label: "Shoplänk", value: data.zzLinks.shop },
                  { label: "Partnerlänk", value: data.zzLinks.partner },
                ].map((linkItem) => (
                  <div key={linkItem.label} className="rounded-[1.1rem] border border-border/70 bg-white/95 p-4 shadow-card">
                    <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">{linkItem.label}</p>
                  {linkItem.value ? (
                      <>
                        <p className="mt-3 break-all text-sm text-foreground">{linkItem.value}</p>
                        <p className="mt-2 text-xs leading-5 text-subtle">
                          Detta är din bakomliggande Zinzino-länk. Dela normalt din Omega-länk ovan och använd denna när du behöver gå direkt.
                        </p>
                        <Button
                          type="button"
                          variant="outline"
                          className="mt-3 h-8 rounded-lg px-3 text-sm"
                          onClick={() => navigator.clipboard.writeText(linkItem.value as string)}
                        >
                          <Copy className="mr-2 h-3.5 w-3.5" />
                          Kopiera länk
                        </Button>
                      </>
                    ) : (
                      <p className="mt-3 text-sm leading-6 text-subtle">
                        Ingen länk sparad ännu. Lägg in den via knappen ovan.
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </DashboardSection>
          ) : null}

          {showOverview ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <MetricCard label="Mina leads" value={data.metrics.leads} helper="Alla leads där du är attribuerad partner." icon={<Link2 className="h-5 w-5" />} />
              <MetricCard label="Partnerleads" value={data.metrics.partnerLeads} helper="Nya intresseanmälningar för partnerskap." icon={<UserPlus2 className="h-5 w-5" />} />
              <MetricCard label="Mina kunder" value={data.metrics.customers} helper="Kunder som hittills kopplats till dig." icon={<Users className="h-5 w-5" />} />
              <MetricCard label="Direkta kontakter" value={data.metrics.directPartners} helper="Direkta partnerkontakter som kommit in via dig." icon={<Users className="h-5 w-5" />} />
            </div>
          ) : null}

          {showLeads ? (
            <div className="grid gap-8 xl:grid-cols-[1.1fr_0.9fr]">
              <DashboardSection title="Mina leads" description="Både kundleads och partnerleads sparas med din attribution.">
                <div className="mb-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  {leadQueueSummary.map((item) => (
                    <div key={item.label} className="rounded-[1rem] border border-border/70 bg-secondary/20 px-3.5 py-3">
                      <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">{item.label}</p>
                      <p className="mt-2 text-2xl font-semibold text-foreground">{item.value}</p>
                    </div>
                  ))}
                </div>
                <div className="mb-4 flex flex-wrap gap-2">
                  {[
                    { value: "all", label: "Alla" },
                    { value: "urgent", label: "Brådskande" },
                    { value: "active", label: "Aktiva" },
                    { value: "new", label: "Nya" },
                  ].map((option) => (
                    <Button
                      key={option.value}
                      type="button"
                      variant={leadFilter === option.value ? "default" : "outline"}
                      className="h-8 rounded-full px-3 text-sm"
                      onClick={() => setLeadFilter(option.value as "all" | "urgent" | "active" | "new")}
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>
                <DataTable
                  columns={["Namn", "Typ", "Läge", "Brådskande", "Nästa steg", "Senast aktiv"]}
                  rows={sortedFilteredLeads.map((lead) => [
                    <div key={`${lead.id}-lead`}>
                      <p className="font-medium text-foreground">{lead.name}</p>
                      <p className="text-xs text-subtle">{lead.email}</p>
                    </div>,
                    <Badge key={`${lead.id}-type`} variant="outline" className="rounded-full">
                      {lead.type === "partner_lead" ? "Partner" : "Kund"}
                    </Badge>,
                    <Badge key={`${lead.id}-situation`} variant={getLeadSituationVariant(lead)} className="rounded-full px-3 py-1">
                      {getLeadSituationLabel(lead)}
                    </Badge>,
                    <Badge key={`${lead.id}-urgency`} variant={getLeadUrgencyVariant(lead)} className="rounded-full px-3 py-1">
                      {getLeadUrgencyLabel(lead)}
                    </Badge>,
                    <div key={`${lead.id}-action`} className="max-w-[260px] text-sm text-subtle">
                      <div className="font-medium text-foreground">{getLeadStatusLabel(lead.status)}</div>
                      <div className="mt-1">{getLeadNextAction(lead)}</div>
                    </div>,
                    <span key={`${lead.id}-created`}>{formatDate(lead.updated_at || lead.created_at)}</span>,
                  ])}
                  emptyState="Inga leads matchar filtret just nu."
                />
              </DashboardSection>

              {showLeads ? (
                <DashboardSection title="Först att följa upp" description="Systemet lyfter de leads som just nu är mest relevanta för att få första rörelse eller första resultat.">
                  <div className="rounded-[1.2rem] border border-border/70 bg-accent/50 p-4">
                    <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Prioriterade leads</p>
                    <div className="mt-4 space-y-3">
                      {prioritizedLeads.length ? (
                        prioritizedLeads.map((lead) => (
                          <div key={lead.id} className="rounded-[1rem] border border-border/70 bg-white/85 p-3.5">
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <p className="font-medium text-foreground">{lead.name}</p>
                                <p className="text-xs text-subtle">{lead.email}</p>
                              </div>
                              <Badge
                                variant={getLeadStatusVariant(lead.status)}
                                className="rounded-full px-3 py-1"
                              >
                                {getLeadStatusLabel(lead.status)}
                              </Badge>
                            </div>
                            <div className="mt-3 flex flex-wrap gap-2">
                              <Badge variant={getLeadSituationVariant(lead)} className="rounded-full px-3 py-1">
                                {getLeadSituationLabel(lead)}
                              </Badge>
                              <Badge variant={getLeadUrgencyVariant(lead)} className="rounded-full px-3 py-1">
                                Brådskande: {getLeadUrgencyLabel(lead)}
                              </Badge>
                            </div>
                            <p className="mt-3 text-sm text-foreground">{getLeadNextAction(lead)}</p>
                            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-subtle">
                              <span>{lead.type === "partner_lead" ? "Partnerlead" : "Kundlead"}</span>
                              <span>•</span>
                              <span>{formatDate(lead.updated_at || lead.created_at)}</span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="rounded-[1rem] border border-border/70 bg-white/85 p-3.5">
                          <p className="text-sm text-subtle">Inga prioriterade leads ännu. Fokusera först på att skapa din första signal.</p>
                          <Button
                            type="button"
                            variant="outline"
                            className="mt-3 h-8 rounded-lg px-3 text-sm"
                            onClick={() => navigator.clipboard.writeText(partnerLink)}
                          >
                            <Copy className="mr-2 h-3.5 w-3.5" />
                            Kopiera Omega-länken
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </DashboardSection>
              ) : null}
            </div>
          ) : null}

          {showCustomers ? (
            <DashboardSection title="Kundsignaler" description="Kundrelationer som hittills kopplats till dig via systemet. Detta är inte officiell ZZ-utbetalning eller kompensation.">
              <div className="rounded-[1.2rem] border border-border/70 bg-accent/50 p-4">
                <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Attribuerade kunder</p>
                <p className="mt-3 font-serif text-4xl font-semibold tracking-tight text-foreground">
                  {new Intl.NumberFormat("sv-SE", { maximumFractionDigits: 0 }).format(data.customers.length)}
                </p>
                <p className="mt-2 text-sm leading-6 text-subtle">
                  Tidiga kommersiella signaler runt ditt flöde, inte payout eller bonus.
                </p>
              </div>

              <div className="mt-4">
                <DataTable
                  columns={["Kund", "Status", "Skapad"]}
                  rows={data.customers.map((customer) => [
                    <div key={`${customer.id}-name`}>
                      <p className="font-medium text-foreground">{customer.name}</p>
                      <p className="text-xs text-subtle">{customer.email}</p>
                    </div>,
                    <span key={`${customer.id}-status`} className="capitalize">{customer.status}</span>,
                    <span key={`${customer.id}-created`}>{formatDate(customer.created_at)}</span>,
                  ])}
                  emptyState="Inga attribuerade kunder ännu."
                />
              </div>
            </DashboardSection>
          ) : null}

          {showLeads || showNetwork ? (
            <div className="grid gap-8 xl:grid-cols-2">
              {showLeads ? (
                <DashboardSection title="Mina partnerleads" description="Här ser du partnerintresse och vad du bör göra härnäst.">
                  <div className="mb-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    {partnerLeadQueueSummary.map((item) => (
                      <div key={item.label} className="rounded-[1rem] border border-border/70 bg-secondary/20 px-3.5 py-3">
                        <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">{item.label}</p>
                        <p className="mt-2 text-2xl font-semibold text-foreground">{item.value}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mb-4 flex flex-wrap gap-2">
                    {[
                      { value: "all", label: "Alla" },
                      { value: "urgent", label: "Brådskande" },
                      { value: "active", label: "Aktiva" },
                      { value: "new", label: "Nya" },
                    ].map((option) => (
                      <Button
                        key={option.value}
                        type="button"
                        variant={partnerLeadFilter === option.value ? "default" : "outline"}
                        className="h-8 rounded-full px-3 text-sm"
                        onClick={() => setPartnerLeadFilter(option.value as "all" | "urgent" | "active" | "new")}
                      >
                        {option.label}
                      </Button>
                    ))}
                  </div>
                  <DataTable
                    columns={["Sökande", "Källa", "Läge", "Brådskande", "Nästa steg", "Senast aktiv"]}
                    rows={sortedFilteredPartnerLeads.map((lead) => [
                      <div key={`${lead.id}-partner`}>
                        <p className="font-medium text-foreground">{lead.name}</p>
                        <p className="text-xs text-subtle">{lead.email}</p>
                      </div>,
                      <span key={`${lead.id}-source`}>{lead.source_page || "-"}</span>,
                      <Badge key={`${lead.id}-situation`} variant={getLeadSituationVariant(lead)} className="rounded-full px-3 py-1">
                        {getLeadSituationLabel(lead)}
                      </Badge>,
                      <Badge key={`${lead.id}-urgency`} variant={getLeadUrgencyVariant(lead)} className="rounded-full px-3 py-1">
                        {getLeadUrgencyLabel(lead)}
                      </Badge>,
                      <div key={`${lead.id}-action`} className="max-w-[260px] text-sm text-subtle">
                        <div className="font-medium text-foreground">{getLeadStatusLabel(lead.status)}</div>
                        <div className="mt-1">{getLeadNextAction(lead)}</div>
                      </div>,
                      <span key={`${lead.id}-received`}>{formatDate(lead.updated_at || lead.created_at)}</span>,
                    ])}
                    emptyState="Inga partnerleads matchar filtret just nu."
                  />
                </DashboardSection>
              ) : null}

              {showNetwork ? (
                <DashboardSection title="Direkta partnerkontakter" description="Personer du har bjudit in eller fått in i ditt närmaste partnerled. Själva placeringen och ranken hanteras i Zinzino.">
                  <div className="mb-4 grid gap-3 lg:grid-cols-2">
                    <div className="rounded-[1.1rem] border border-border/70 bg-secondary/20 p-4">
                      <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Vem hjälper dig nu</p>
                      {data.sponsor ? (
                        <>
                          <p className="mt-3 text-sm font-medium text-foreground">{data.sponsor.name}</p>
                          <p className="mt-1 text-sm text-subtle">{data.sponsor.email}</p>
                          <p className="mt-3 text-sm leading-6 text-subtle">
                            Om du fastnar i nästa steg ska du i första hand ta hjälp av din närmaste up-line.
                          </p>
                        </>
                      ) : (
                        <p className="mt-3 text-sm leading-6 text-subtle">
                          Du ligger nära toppen i den här modellen. Det betyder att stöd uppåt främst sker direkt från kärnan.
                        </p>
                      )}
                    </div>

                    <div className="rounded-[1.1rem] border border-border/70 bg-secondary/20 p-4">
                      <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Vem ska du hjälpa nu</p>
                      {data.team.length ? (
                        <>
                          <p className="mt-3 text-sm font-medium text-foreground">{data.team[0].partnerName}</p>
                          <p className="mt-1 text-sm text-subtle">{data.team[0].email}</p>
                          <p className="mt-3 text-sm leading-6 text-subtle">
                            Börja med din närmaste downline och hjälp den personen till sitt första tydliga steg innan du breddar stödet.
                          </p>
                        </>
                      ) : (
                        <p className="mt-3 text-sm leading-6 text-subtle">
                          När du får in din första direkta partner börjar dupliceringen här. Då är nästa steg att hjälpa den personen igång.
                        </p>
                      )}
                    </div>
                  </div>

                  {duplicationRhythm ? (
                    <div className="mb-4 rounded-[1.1rem] border border-border/70 bg-white/95 p-4 shadow-card">
                      <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">{duplicationRhythm.title}</p>
                      <div className="mt-3 grid gap-3 md:grid-cols-3">
                        {duplicationRhythm.items.map((item) => (
                          <div key={item} className="rounded-[1rem] border border-border/70 bg-secondary/20 px-3.5 py-3">
                            <p className="text-sm leading-6 text-foreground">{item}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  <DataTable
                    columns={["Partner", "Nivå", "Tillagd"]}
                    rows={data.team.map((member) => [
                      <div key={`${member.partnerId}-member`}>
                        <p className="font-medium text-foreground">{member.partnerName}</p>
                        <p className="text-xs text-subtle">{member.email}</p>
                      </div>,
                      <Badge key={`${member.partnerId}-level`} variant="secondary" className="rounded-full px-3 py-1">
                        Nivå {member.level}
                      </Badge>,
                      <span key={`${member.partnerId}-joined`}>{formatDate(member.createdAt)}</span>,
                    ])}
                    emptyState="Inga direkta partnerkontakter ännu."
                  />
                </DashboardSection>
              ) : null}
            </div>
          ) : null}
        </div>
      )}
    </DashboardShell>
  );
};

export default PartnerDashboardPage;
