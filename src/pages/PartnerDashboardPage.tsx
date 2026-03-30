import { useMemo, useState } from "react";
import { CheckCircle2, Copy, Link2, UserPlus2, Users } from "lucide-react";
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

function formatWholeNumber(value: number) {
  return new Intl.NumberFormat("sv-SE", { maximumFractionDigits: 0 }).format(value);
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
          title: hasSponsor ? "Stöd uppåt och nedåt" : "Stöd från Omega Balance-teamet",
          summary: hasSponsor
            ? `Du hjälper nedåt och tar samtidigt hjälp av ${data.sponsor?.name} uppåt när det behövs.`
            : "Du hjälper din första linje vidare och tar samtidigt stöd direkt från Omega Balance-teamet när det behövs.",
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
          title: hasSponsor ? "Ta hjälp uppåt" : "Ta stöd från Omega Balance-teamet",
          summary: hasSponsor
            ? `Du behöver inte bära allt själv. Ta hjälp av ${data.sponsor?.name} eller din up-line när du kör fast.`
            : "Du behöver inte bära allt själv. Ta stöd av Omega Balance-teamet när du kör fast eller vill göra nästa steg tydligare.",
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
        title: hasSponsor ? "Ta hjälp uppåt" : "Stöd från Omega Balance-teamet",
        summary: hasSponsor
          ? "När du kör fast är nästa steg ofta att ta hjälp av din up-line."
          : "När du kör fast är nästa steg ofta att ta stöd direkt från Omega Balance-teamet i stället för att tveka för länge själv.",
        action: "Be om hjälp när du har en verklig kontakt i gång eller vill göra nästa steg tydligare.",
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

function buildLeadExecutionSummary(leads: Lead[]) {
  const takeToday = leads.filter((lead) => lead.status === "new").length;
  const followUpNow = leads.filter((lead) => lead.status === "qualified").length;
  const activeDialogs = leads.filter((lead) => lead.status === "active").length;

  return [
    { label: "Ta i dag", value: takeToday, note: "Nya kontakter som bör få första svar snabbt." },
    { label: "Följ upp nu", value: followUpNow, note: "Varmare dialoger som inte bär tappa fart." },
    { label: "Håll levande", value: activeDialogs, note: "Aktiva samtal som behöver nästa steg, inte bara väntan." },
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

  const completedMilestones = checklist.filter((item) => item.done).length;
  const encouragement =
    completedMilestones === 0
      ? "Du är här och tittar in i portalen. Det i sig är en bra början."
      : completedMilestones === 1
        ? "Bra start. Du har redan tagit första riktiga steget."
        : completedMilestones === 2
          ? "Snyggt jobbat. Du bygger faktiskt grunden, inte bara tänker på den."
          : completedMilestones === 3
            ? "Det här börjar ta form på riktigt. Du har redan flera viktiga bitar på plats."
            : completedMilestones === 4
              ? "Starkt. Du har kommit förbi startsträckan och börjar skapa riktig rörelse."
              : completedMilestones === 5
                ? "Riktigt bra jobbat. Nu märks det att du bygger något som kan upprepas."
                : "Mycket fint jobbat. Du har tagit dig långt och bygger nu vidare från en stark grund.";

  if (!legalAccepted) {
    return {
      stageLabel: "Bekräfta grunden",
      summary: "Innan du arbetar vidare i portalen behöver villkor och integritet vara godkända.",
      nextMilestone: "Godkända portalvillkor och integritet",
      nextBestAction: "Läs igenom dokumenten, bekräfta att du förstått upplägget och slutför godkännandet.",
      encouragement,
      checklist,
    };
  }

  if (!zzLinksReady) {
    return {
      stageLabel: "Lägg grunden",
      summary: "Innan du driver trafik eller följer upp leads behöver test-, shop- och partnerlänken finnas på plats.",
      nextMilestone: "Tre Zinzino-destinationer sparade",
      nextBestAction: "Gå till Länkar och lägg in dina tre personliga ZZ-länkar innan du börjar arbeta externt.",
      encouragement,
      checklist,
    };
  }

  if (customers === 0 && customerLeads === 0 && partnerLeads === 0 && directPartners === 0) {
    return {
      stageLabel: "Kom igång",
      summary: "Fokus just nu är att skapa första riktiga rörelsen, inte att göra allt samtidigt.",
      nextMilestone: "Första kundsignal eller första partnerintresse",
      nextBestAction: "Dela din länk och fokusera på att få din första kund eller ditt första partnerlead.",
      encouragement,
      checklist,
    };
  }

  if (customers === 0 && customerLeads <= 1 && partnerLeads <= 1 && directPartners === 0) {
    return {
      stageLabel: "Första resultat",
      summary: "Du har börjat röra dig. Nu gäller det att visa att det inte bara var ett enstaka försök.",
      nextMilestone: "Ett andra resultat i samma riktning",
      nextBestAction: "Upprepa det som gav första signalen och håll fokus på samma typ av aktivitet några dagar till.",
      encouragement,
      checklist,
    };
  }

  if (directPartners === 0) {
    return {
      stageLabel: "Bygg upprepad aktivitet",
      summary: "Du har flera signaler igång, men allt bygger fortfarande mest på din egen aktivitet.",
      nextMilestone: "Första direkta partnerkontakt eller tydlig first-line-signal",
      nextBestAction: "Fortsätt skapa kund- och partnerintresse, men börja styra fokus mot att få in din första direkta partnerkontakt.",
      encouragement,
      checklist,
    };
  }

  if (directPartners > 0 && partnerLeads + customerLeads + customers < 4) {
    return {
      stageLabel: "Aktivera first line",
      summary: "Du är inte längre helt själv i flödet. Nästa steg är att hjälpa första linjen att börja röra sig.",
      nextMilestone: "Första tydliga signalen från first line",
      nextBestAction: "Hjälp din första partner att få sitt första lead eller sin första kundsignal i stället för att bara producera själv.",
      encouragement,
      checklist,
    };
  }

  return {
    stageLabel: "Tidig duplicering",
    summary: "Det finns tidiga signaler på att arbetet börjar upprepa sig genom andra. Nu handlar det om stabilitet, inte bara fart.",
    nextMilestone: "Fler återkommande signaler från first line",
    nextBestAction: "Skydda det som fungerar och hjälp fler i första linjen att upprepa samma beteende.",
    encouragement,
    checklist,
  };
}

function getPartnerLaunchDay(createdAt: string) {
  const createdTime = new Date(createdAt).getTime();
  if (Number.isNaN(createdTime)) {
    return 1;
  }

  const diffMs = Date.now() - createdTime;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  return Math.min(120, Math.max(1, diffDays + 1));
}

function buildFastStartJourney(data: PartnerDashboardData, legalAccepted: boolean) {
  const customerSignals = data.customers.length + data.leads.filter((lead) => lead.type === "customer_lead").length;
  const partnerSignals = data.metrics.directPartners + data.partnerLeads.length;
  const zzLinksReady = hasRequiredZzLinks(data);
  const launchDay = getPartnerLaunchDay(data.partner.created_at);
  const daysLeft = Math.max(0, 120 - launchDay);
  const ownFoundationReady = legalAccepted && zzLinksReady && data.partner.referral_code.length > 0;
  const firstCustomersReached = customerSignals > 0;
  const twoStarted = data.metrics.directPartners >= 2 || partnerSignals >= 2;
  const firstLineMoving = data.metrics.directPartners >= 2 && (data.team.length >= 2 || customerSignals + partnerSignals >= 4);

  const steps = [
    {
      id: "foundation",
      title: "Steg 1: Kom igång själv",
      description: "Lägg grunden först. Då blir resten enklare att upprepa.",
      target: "Legal, länkar och din egen Omega-länk ska vara på plats.",
      reward: "Bra jobbat. Nu har du din egen grund på plats.",
      done: ownFoundationReady,
    },
    {
      id: "customers",
      title: "Steg 2: Få dina första kunder",
      description: "Skapa första riktiga rörelsen med din länk och några tydliga kundsignaler.",
      target: firstCustomersReached
        ? `${customerSignals} kundsignaler skapade hittills.`
        : "Målet är att få in din första kundsignal och börja bygga en liten stabil kundbas.",
      reward: "Snyggt. Nu har du bevis på att modellen går att sätta i rörelse.",
      done: firstCustomersReached,
    },
    {
      id: "start-two",
      title: "Steg 3: Hjälp två personer att komma igång",
      description: "Nu börjar dupliceringen. Nästa nivå är att du inte bara bygger själv.",
      target: twoStarted
        ? `${Math.max(data.metrics.directPartners, partnerSignals)} partnerstarter eller partnersignaler finns redan.`
        : "Målet är att hjälpa två personer till en första tydlig start via ditt flöde.",
      reward: "Bra där. Nu bygger du inte bara själv, du börjar bygga vidare genom andra.",
      done: twoStarted,
    },
    {
      id: "activate-two",
      title: "Steg 4: Hjälp dina två att få fart",
      description: "Nu gäller det att hjälpa de första vidare så att arbetet kan upprepas utan att allt hänger på dig.",
      target: firstLineMoving
        ? "Det finns tydliga first-line-signaler att bygga vidare på."
        : "Målet är att dina två första inte bara startar, utan börjar få egen rörelse.",
      reward: "Starkt jobbat. Nu har du byggt en riktig startmotor, inte bara en engångsinsats.",
      done: firstLineMoving,
    },
  ];

  const currentStepIndex = steps.findIndex((step) => !step.done);

  return {
    launchDay,
    daysLeft,
    completedSteps: steps.filter((step) => step.done).length,
    totalSteps: steps.length,
    currentTitle: currentStepIndex === -1 ? "Fast Start genomförd" : steps[currentStepIndex].title,
    currentFocus:
      currentStepIndex === -1
        ? "Nu handlar det om att upprepa det som fungerar och hjälpa fler i din första linje framåt."
        : steps[currentStepIndex].description,
    momentumMessage:
      currentStepIndex <= 0
        ? "En sak i taget. Grunden först, tempo sedan."
        : currentStepIndex === 1
          ? "Bra jobbat. Nu har du en grund att bygga riktiga kundsignaler ovanpå."
          : currentStepIndex === 2
            ? "Nu börjar det bli en verksamhet, inte bara en egen aktivitet."
            : currentStepIndex === 3
              ? "Nu flyttas fokus från din egen fart till hur väl du hjälper andra i gång."
              : "Snyggt jobbat. Nu kan du börja bygga vidare med mycket bättre rytm.",
    steps: steps.map((step, index) => ({
      ...step,
      status: step.done ? "done" : currentStepIndex === index ? "current" : "locked",
    })),
  };
}

function buildFirstActionEngine(data: PartnerDashboardData, legalAccepted: boolean) {
  const visits = data.metrics.clicks;
  const customerSignals = data.leads.length + data.customers.length;
  const partnerSignals = data.partnerLeads.length;
  const resultSignals = customerSignals + partnerSignals;
  const duplicationReady = resultSignals > 0 || data.metrics.directPartners > 0;
  const linksReady = hasRequiredZzLinks(data);
  const foundationReady = legalAccepted && linksReady && data.partner.referral_code.length > 0;

  if (!foundationReady) {
    return {
      level: 1,
      statusTitle: "Level 1 – Aktivering",
      statusBody: "Du har inte hela grunden på plats än. Fixa den först så blir resten mycket enklare.",
      nextGoal: "Nästa mål: få grunden helt klar",
      actionTitle: "Få grunden klar nu",
      actionBody: "Godkänn legal och lägg in dina länkar innan du börjar driva rörelse.",
      actionLabel: !legalAccepted ? "Öppna legal" : "Öppna länkar",
      actionMode: !legalAccepted ? ("legal" as const) : ("links" as const),
      helper: [
        "Gör klart legal först",
        "Lägg in test-, shop- och partnerlänk",
        "Se till att du själv kan stå för det du delar",
      ],
      liveTitle: "Det här händer just nu",
      liveBody: "Så fort grunden är klar kan systemet börja jobba åt dig.",
      liveMeta: "Du är nära första riktiga start",
      nextLevelTitle: "Nästa steg",
      nextLevelBody: "När grunden är klar låser du upp första aktiveringen.",
      momentum: "Du är här nu. Få grunden klar och gå vidare.",
      shareMode: "setup" as const,
    };
  }

  if (visits === 0) {
    return {
      level: 1,
      statusTitle: "Level 1 – Aktivering",
      statusBody: "Du har kommit igång. Nu behöver du skapa första rörelsen.",
      nextGoal: "Nästa mål: första signal",
      actionTitle: "Skicka din länk till 1 person nu",
      actionBody: "Börja litet. En skickad länk är bättre än att fundera för länge.",
      actionLabel: "Kopiera min länk",
      actionMode: "copy-link" as const,
      helper: [
        "någon du redan pratar med",
        "någon som bryr sig om hälsa",
        "någon du litar på",
      ],
      liveTitle: "Det här händer just nu",
      liveBody: "Så fort någon använder din länk ser du första signalen här.",
      liveMeta: "Du är ett klick från att få systemet i rörelse",
      nextLevelTitle: "Nästa steg",
      nextLevelBody: "När du får din första signal låser du upp nästa nivå.",
      momentum: "Du har varit aktiv idag",
      shareMode: "start" as const,
    };
  }

  if (resultSignals === 0) {
    return {
      level: 2,
      statusTitle: "Level 2 – Första signal",
      statusBody: "Din länk används. Nu gäller det att bygga vidare medan tempot finns kvar.",
      nextGoal: "Nästa mål: första resultat",
      actionTitle: "Skicka din länk till 1 person till",
      actionBody: "Du har redan rörelse. Nu vill vi få den att upprepa sig snabbt.",
      actionLabel: "Kopiera min länk",
      actionMode: "copy-link" as const,
      helper: [
        "någon som redan visat lite intresse",
        "någon som brukar svara dig",
        "någon som vill förstå sin hälsa bättre",
      ],
      liveTitle: "Det här händer just nu",
      liveBody: visits === 1 ? "1 person har klickat på din länk." : `${visits} personer har klickat på din länk.`,
      liveMeta: "Du är nära ditt första resultat",
      nextLevelTitle: "Nästa nivå",
      nextLevelBody: "När du får ditt första lead eller partnerintresse öppnas nästa steg.",
      momentum: visits > 1 ? `Du har skapat ${visits} signaler hittills` : "Du har fått första signalen",
      shareMode: "build" as const,
    };
  }

  if (!duplicationReady || data.metrics.directPartners === 0) {
    return {
      level: 3,
      statusTitle: "Level 3 – Första resultat",
      statusBody: "Du har fått din första riktiga signal. Nu är det dags att skapa nästa lilla vinst.",
      nextGoal: "Nästa mål: första kund eller första partnerkontakt",
      actionTitle: "Skicka din länk till 1 person som kan vilja göra samma resa",
      actionBody: "Nu får du börja använda samma enkla system för att hitta första duplication-signalen.",
      actionLabel: "Bjud in partner",
      actionMode: "copy-link" as const,
      helper: [
        "någon som gillar struktur",
        "någon som vill bygga stegvis",
        "någon som skulle uppskatta att slippa jaga folk",
      ],
      liveTitle: "Det här händer just nu",
      liveBody: partnerSignals > 0
        ? `Du har ${partnerSignals} partnerintresse${partnerSignals > 1 ? "n" : ""} i rörelse.`
        : `Du har ${customerSignals} kundsignal${customerSignals > 1 ? "er" : ""} i rörelse.`,
      liveMeta: "Nu är du redo att bjuda in din första partner",
      nextLevelTitle: "Nästa nivå",
      nextLevelBody: "När du får första partnerkontakt eller första kund låser du upp nästa dupliceringssteg.",
      momentum: "Bra jobbat. Nu bygger du på ett riktigt resultat.",
      shareMode: "duplicate" as const,
    };
  }

  return {
    level: 4,
    statusTitle: "Level 4 – Duplication",
    statusBody: "Nu är du igång på riktigt. Fokus ligger på att hjälpa andra göra samma resa som du.",
    nextGoal: "Nästa mål: fler signaler från first line",
    actionTitle: "Hjälp en partner till sin första signal idag",
    actionBody: "Nu vinner du genom att hjälpa någon annan få fart, inte genom att bara producera mer själv.",
    actionLabel: "Öppna leads",
    actionMode: "leads" as const,
    helper: [
      "välj en partner nära dig",
      "landa i ett enda nästa steg",
      "skapa rörelse innan ni pratar teori",
    ],
    liveTitle: "Det här händer just nu",
    liveBody: "Det finns redan signaler i systemet. Nu gäller det att hålla rytmen levande.",
    liveMeta: "Systemet jobbar bäst när du upprepar det som redan fungerar",
    nextLevelTitle: "Nästa nivå",
    nextLevelBody: "Nästa steg är att få fler i första linjen att uppleva samma enkla start.",
    momentum: "Du har varit aktiv idag",
    shareMode: "support" as const,
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
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);
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
    section === "leads" || section === "network" || section === "overview" || section === "links" || section === "customers" || section === "journey"
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
      { label: "Din resa", href: "/dashboard/partner/journey", icon: dashboardIcons.dashboard },
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
  const fastStartJourney = data ? buildFastStartJourney(data, legalAccepted) : null;
  const firstActionEngine = data ? buildFirstActionEngine(data, legalAccepted) : null;
  const viewingAsAdmin = accessQuery.data?.portalUser?.role === "admin";
  const legalActionHref = viewingAsAdmin ? "/dashboard/admin/legal-preview" : "/dashboard/partner/legal";
  const showOverview = currentSection === "overview";
  const showLeads = currentSection === "leads";
  const showLinks = currentSection === "links";
  const showCustomers = currentSection === "customers";
  const showNetwork = currentSection === "network";
  const showJourney = currentSection === "journey";
  const partnerLink = data ? `${window.location.origin}/?ref=${data.partner.referral_code}` : "";
  const shareText = firstActionEngine?.shareMode === "duplicate"
    ? `Jag testar ett nytt digitalt upplägg som gör det enklare att komma igång stegvis. Kika här när du har två minuter: ${partnerLink}`
    : `Jag testar ett nytt upplägg för mätbar hälsa och ville skicka länken till dig. Kika här när du har två minuter: ${partnerLink}`;
  const smsShareHref = `sms:?&body=${encodeURIComponent(shareText)}`;
  const whatsappShareHref = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
  const firstResultProgress = data ? getFirstResultProgress(data) : [];
  const firstResultFocus = data ? buildFirstResultFocus(data) : null;
  const weeklyPlan = data ? buildWeeklyPlan(data) : null;
  const practicalSuggestions = data ? buildPracticalWorkSuggestions(data) : null;
  const duplicationPlaybook = data ? buildDuplicationPlaybook(data) : null;
  const duplicationRhythm = data ? buildDuplicationRhythm(data) : null;
  const startAction = data ? buildPartnerStartAction(data, legalAccepted) : null;
  const leadQueueSummary = data ? buildLeadQueueSummary(data.leads) : [];
  const partnerLeadQueueSummary = data ? buildLeadQueueSummary(data.partnerLeads) : [];
  const leadExecutionSummary = data ? buildLeadExecutionSummary(data.leads) : [];
  const partnerLeadExecutionSummary = data ? buildLeadExecutionSummary(data.partnerLeads) : [];
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
  const prioritizedCustomerLeads = data
    ? [...data.leads]
        .sort((a, b) => {
          const scoreDiff = getLeadPriorityScore(b) - getLeadPriorityScore(a);
          if (scoreDiff !== 0) {
            return scoreDiff;
          }

          return new Date(b.updated_at || b.created_at).getTime() - new Date(a.updated_at || a.created_at).getTime();
        })
        .slice(0, 3)
    : [];
  const prioritizedPartnerLeads = data
    ? [...data.partnerLeads]
        .sort((a, b) => {
          const scoreDiff = getLeadPriorityScore(b) - getLeadPriorityScore(a);
          if (scoreDiff !== 0) {
            return scoreDiff;
          }

          return new Date(b.updated_at || b.created_at).getTime() - new Date(a.updated_at || a.created_at).getTime();
        })
        .slice(0, 3)
    : [];
  const firstLineFocusQueue = data
    ? [
        data.team[0]
          ? {
              key: `downline-${data.team[0].partnerId}`,
              title: `Hjälp ${data.team[0].partnerName} vidare`,
              summary: "Din närmaste first line ger störst hävstång just nu om du håller stödet nära nästa aktivitet.",
              action: "Ta ett kort avstämningssamtal och landa i ett enda tydligt nästa steg denna vecka.",
            }
          : null,
        {
          key: "up-line-support",
          title: data.sponsor ? `Ta stöd av ${data.sponsor.name}` : "Ta stöd av Omega Balance-teamet",
          summary: data.sponsor
            ? "När dialog eller uppföljning fastnar blir nästa steg ofta lättare om du tar stöd uppåt tidigt."
            : "När du ligger nära toppen behöver du inte bära allt själv. Ta stöd uppåt så fort nästa steg blir oklart.",
          action: "Be om hjälp i skarpa lägen, helst kopplat till en verklig kontakt eller ett konkret nästa steg.",
        },
        {
          key: "duplicate-rhythm",
          title: "Skydda dupliceringsrytmen",
          summary: "Duplicering börjar när du hjälper någon annan till sitt första tydliga resultat, inte bara när du själv producerar mer.",
          action: data.team.length
            ? "Fokusera på en person i taget i din first line tills ni fått första tydliga signalen där."
            : "När din första direkta partner kommer in, hjälp den personen igång innan du försöker bredda för mycket.",
        },
      ].filter(Boolean) as Array<{
        key: string;
        title: string;
        summary: string;
        action: string;
      }>
    : [];
  const primaryActionCard = startAction || firstResultFocus
    ? {
        title: firstResultFocus?.title ?? startAction?.title ?? "Nästa steg",
        description: firstResultFocus?.reason ?? startAction?.description ?? journey?.nextBestAction ?? "",
        detail: firstResultFocus?.action ?? journey?.nextBestAction ?? startAction?.description ?? "",
        label: startAction?.label ?? "Öppna leads",
        mode: startAction?.mode ?? ("leads" as const),
      }
    : null;
  const followUpTargets = data
    ? prioritizedLeads.length
      ? prioritizedLeads.map((lead) => ({
          key: lead.id,
          name: lead.name,
          label: lead.type === "partner_lead" ? "Partnerlead" : "Kundlead",
          status: `${getLeadStatusLabel(lead.status)} • ${getLeadSituationLabel(lead)}`,
          action: getLeadNextAction(lead),
        }))
      : data.team[0]
        ? [
            {
              key: `team-${data.team[0].partnerId}`,
              name: data.team[0].partnerName,
              label: "Direkt partnerkontakt",
              status: "First line",
              action: "Ta en kort avstämning och hjälp personen till ett enda tydligt nästa steg denna vecka.",
            },
          ]
        : []
    : [];
  const currentProgressStep = firstResultProgress.find((step) => step.current);
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

  const markActionStarted = (
    message = "Bra. Du är igång.\n\nDin länk är nu aktiv.\n\nNästa steg är första signal.\n\nVill du ta nästa steg direkt: skicka den till 1 person du redan har kontakt med.",
  ) => {
    setActionFeedback(message);
  };

  const renderActionButton = (mode: "copy-link" | "links" | "leads" | "legal", label: string) => {
    if (mode === "copy-link") {
      return (
        <Button
          type="button"
          variant="outline"
          className="h-8 rounded-lg px-3 text-sm"
          onClick={() => {
            void navigator.clipboard.writeText(partnerLink);
            markActionStarted();
          }}
        >
          <Copy className="mr-2 h-3.5 w-3.5" />
          {label}
        </Button>
      );
    }

    if (mode === "links") {
      return (
        <Button asChild type="button" variant="outline" className="h-8 rounded-lg px-3 text-sm">
          <Link to="/dashboard/partner/links">{label}</Link>
        </Button>
      );
    }

    if (mode === "leads") {
      return (
        <Button asChild type="button" variant="outline" className="h-8 rounded-lg px-3 text-sm">
          <Link to="/dashboard/partner/leads">{label}</Link>
        </Button>
      );
    }

    return (
      <Button asChild type="button" variant="outline" className="h-8 rounded-lg px-3 text-sm">
        <Link to={legalActionHref}>{label}</Link>
      </Button>
    );
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
              title="Din Fast Start"
              description="Dina första 120 dagar ska kännas som en guidande partnerresa, inte som hela kompplanen på en gång."
            >
              <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr] xl:grid-cols-12">
                <div className="rounded-[1.2rem] border border-primary/20 bg-white p-5 shadow-card lg:col-span-1 xl:col-span-6">
                  <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Gör detta nu</p>
                  <p className="mt-3 text-2xl font-semibold tracking-tight text-foreground">
                    {firstActionEngine?.actionTitle ?? primaryActionCard?.title ?? journey.nextBestAction}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-subtle">
                    {firstActionEngine?.actionBody ?? primaryActionCard?.description ?? journey.summary}
                  </p>
                  <div className="mt-4">
                    <Button
                      type="button"
                      className="h-11 w-full rounded-xl px-5 text-sm shadow-sm sm:w-auto"
                      onClick={() => {
                        void navigator.clipboard.writeText(partnerLink);
                        markActionStarted();
                      }}
                    >
                      <Copy className="mr-2 h-4 w-4" />
                      {firstActionEngine?.actionLabel ?? "Kopiera min länk"}
                    </Button>
                    <p className="mt-3 text-sm text-subtle">Börja med 1 person du redan pratar med. Det räcker för att få systemet i rörelse.</p>
                  </div>
                  <div className="mt-4 rounded-[1rem] border border-border/70 bg-secondary/20 p-3.5">
                    <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Skicka till</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {(firstActionEngine?.helper ?? []).map((item) => (
                        <Badge key={item} variant="outline" className="rounded-full px-3 py-1 text-xs">
                          {item}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className={`mt-4 rounded-[1rem] border p-3.5 transition-all ${actionFeedback ? "border-emerald-300/70 bg-emerald-50 shadow-sm" : "border-border/70 bg-white/80"}`}>
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Startpunkt</p>
                      <Badge variant={actionFeedback ? "default" : "outline"} className="rounded-full px-3 py-1">
                        {actionFeedback ? "Steg 1 klart" : "Väntar"}
                      </Badge>
                    </div>
                    <div className="mt-3 flex items-start gap-3">
                      <div className={`mt-0.5 shrink-0 rounded-full ${actionFeedback ? "text-emerald-600" : "text-muted-foreground"}`}>
                        <CheckCircle2 className={`h-5 w-5 ${actionFeedback ? "" : "opacity-45"}`} />
                      </div>
                      <div className="space-y-2">
                      {(actionFeedback ?? "När du kopierar eller delar länken får du direkt kvitto på att du faktiskt har startat något.").split("\n\n").map((line) => (
                        <p key={line} className={`text-sm ${line === "Bra. Du är igång." ? "font-medium text-foreground" : "text-subtle"}`}>
                          {line}
                        </p>
                      ))}
                      </div>
                    </div>
                  </div>
                  <details className="mt-3 rounded-[1rem] border border-border/70 bg-white/80 p-3.5">
                    <summary className="cursor-pointer list-none text-sm font-medium text-foreground">
                      Fler sätt att dela
                    </summary>
                    <div className="mt-3 flex flex-wrap gap-2.5">
                      <Button asChild type="button" variant="outline" className="h-9 rounded-lg px-4 text-sm">
                        <a href={smsShareHref} onClick={() => markActionStarted()}>
                          Dela via SMS
                        </a>
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        className="h-9 rounded-lg px-4 text-sm"
                        onClick={() => {
                          void navigator.clipboard.writeText(shareText);
                          markActionStarted("Bra. Du är igång.\n\nDitt meddelande är nu klart att klistra in i Messenger.\n\nNästa steg är första signal.\n\nSkicka det till 1 person du redan har kontakt med.");
                        }}
                      >
                        Dela via Messenger
                      </Button>
                      <Button asChild type="button" variant="outline" className="h-9 rounded-lg px-4 text-sm">
                        <a href={whatsappShareHref} target="_blank" rel="noreferrer" onClick={() => markActionStarted()}>
                          Dela via WhatsApp
                        </a>
                      </Button>
                    </div>
                  </details>
                </div>

                <div className="rounded-[1.2rem] border border-border/70 bg-secondary/25 p-4 lg:col-span-1 xl:col-span-2">
                  <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Din status</p>
                  <p className="mt-3 text-lg font-semibold text-foreground">{firstActionEngine?.statusTitle ?? fastStartJourney?.currentTitle}</p>
                  <p className="mt-2 text-sm leading-6 text-subtle">{firstActionEngine?.statusBody ?? fastStartJourney?.currentFocus ?? journey.summary}</p>
                  <div className="mt-4 rounded-[1rem] border border-border/70 bg-white/80 p-3.5">
                    <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Momentum</p>
                    <p className="mt-2 text-sm text-foreground">{firstActionEngine?.momentum ?? fastStartJourney?.momentumMessage ?? journey.encouragement}</p>
                  </div>
                  <div className="mt-3 rounded-[1rem] border border-border/70 bg-white/80 p-3.5">
                    <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Nästa mål</p>
                    <p className="mt-2 text-sm text-foreground">{firstActionEngine?.nextGoal ?? journey.nextMilestone}</p>
                  </div>
                </div>

                <div className="rounded-[1.2rem] border border-border/70 bg-white/90 p-4 lg:col-span-1 xl:col-span-2">
                  <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">{firstActionEngine?.liveTitle ?? "Det här händer just nu"}</p>
                  <div className="mt-3 space-y-3">
                    <div className={`rounded-[1rem] border p-3.5 ${actionFeedback && (!data.metrics.clicks || data.metrics.clicks === 0) ? "border-amber-300/70 bg-amber-50/70" : "border-border/70 bg-secondary/20"}`}>
                      <p className="text-sm font-medium text-foreground">
                        {actionFeedback && (!data.metrics.clicks || data.metrics.clicks === 0)
                          ? "Väntar på första signal..."
                          : firstActionEngine?.liveBody ?? "Så fort första signalen kommer syns den här."}
                      </p>
                      <p className="mt-2 text-xs text-subtle">
                        {actionFeedback && (!data.metrics.clicks || data.metrics.clicks === 0)
                          ? "Du är nära första resultatet."
                          : firstActionEngine?.liveMeta ?? "Du är nära ditt första resultat"}
                      </p>
                      {actionFeedback && (!data.metrics.clicks || data.metrics.clicks === 0) ? (
                        <div className="mt-3 rounded-[0.85rem] border border-amber-300/70 bg-white/80 px-3 py-2 text-xs text-amber-950">
                          Din del är gjord. Nästa win är att någon klickar eller svarar.
                        </div>
                      ) : null}
                    </div>
                    {followUpTargets[0] ? (
                      <div className="rounded-[1rem] border border-border/70 bg-white/90 p-3.5">
                        <p className="text-sm font-medium text-foreground">{followUpTargets[0].name}</p>
                        <p className="mt-2 text-xs text-subtle">{followUpTargets[0].status}</p>
                        <p className="mt-2 text-sm text-foreground">{followUpTargets[0].action}</p>
                      </div>
                    ) : null}
                  </div>
                </div>

                <div className="rounded-[1.2rem] border border-border/70 bg-white/90 p-4 lg:col-span-1 xl:col-span-2">
                  <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">{firstActionEngine?.nextLevelTitle ?? "Nästa nivå"}</p>
                  <p className="mt-3 text-lg font-semibold text-foreground">
                    {firstActionEngine?.level === 3 ? "Nu är du redo för duplication" : "Ett steg till öppnar nästa nivå"}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-subtle">{firstActionEngine?.nextLevelBody ?? journey.nextBestAction}</p>
                  <div className="mt-4">
                    {firstActionEngine?.level === 3 ? (
                      <Button
                        type="button"
                        variant="outline"
                        className="h-9 rounded-lg px-4 text-sm"
                        onClick={() => {
                          void navigator.clipboard.writeText(shareText);
                          markActionStarted("Bra jobbat. Nu har du en partnerinbjudan klar att skicka.");
                        }}
                      >
                        Bjud in partner
                      </Button>
                    ) : primaryActionCard ? renderActionButton(primaryActionCard.mode, primaryActionCard.label) : null}
                  </div>
                </div>
              </div>

              {fastStartJourney ? (
                <div className="mt-4 rounded-[1.2rem] border border-border/70 bg-white p-4 shadow-card">
                  <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Stegvis väg framåt</p>
                      <p className="mt-2 text-lg font-semibold text-foreground">En sak i taget. När ett steg är klart öppnas nästa nivå.</p>
                      <p className="mt-2 text-sm leading-6 text-subtle">
                        Vi visar inte allt på en gång. Fokus är att du ska förstå vad som är viktigast nu och känna momentum när du går vidare.
                      </p>
                    </div>
                    <div className="rounded-[1rem] border border-border/70 bg-secondary/20 px-4 py-3">
                      <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Tid kvar i Fast Start</p>
                      <p className="mt-2 text-2xl font-semibold text-foreground">{fastStartJourney.daysLeft} dagar</p>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                    {fastStartJourney.steps.map((step) => (
                      <div
                        key={step.id}
                        className={`rounded-[1rem] border p-4 ${
                          step.status === "done"
                            ? "border-emerald-300/70 bg-emerald-50"
                            : step.status === "current"
                              ? "border-primary/40 bg-secondary/25"
                              : "border-border/70 bg-muted/30"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-sm font-medium text-foreground">{step.title}</p>
                          <Badge
                            variant={step.status === "done" ? "default" : step.status === "current" ? "secondary" : "outline"}
                            className="rounded-full px-3 py-1"
                          >
                            {step.status === "done" ? "Klar" : step.status === "current" ? "Pågår nu" : "Nästa nivå"}
                          </Badge>
                        </div>
                        <p className="mt-3 text-sm leading-6 text-subtle">{step.description}</p>
                        <div className="mt-3 rounded-[0.9rem] border border-border/70 bg-white/80 p-3">
                          <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Detta är målet</p>
                          <p className="mt-2 text-sm text-foreground">{step.target}</p>
                        </div>
                        <div className="mt-3 rounded-[0.9rem] border border-border/70 bg-white/80 p-3">
                          <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">När det är klart</p>
                          <p className="mt-2 text-sm text-foreground">{step.reward}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              <div className="mt-4 grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
                <div className="rounded-[1.2rem] border border-border/70 bg-white p-4">
                  <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Progress mot första resultat</p>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-[1rem] border border-border/70 bg-secondary/20 p-3.5">
                      <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Klara steg</p>
                      <p className="mt-2 text-2xl font-semibold text-foreground">
                        {journey.checklist.filter((item) => item.done).length} / {journey.checklist.length}
                      </p>
                      <p className="mt-1 text-xs text-subtle">Du bygger vidare ett steg i taget.</p>
                    </div>
                    <div className="rounded-[1rem] border border-border/70 bg-secondary/20 p-3.5">
                      <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Just nu</p>
                      <p className="mt-2 text-sm font-medium text-foreground">
                        {currentProgressStep?.label ?? journey.nextMilestone}
                      </p>
                      <p className="mt-1 text-xs text-subtle">
                        {currentProgressStep?.description ?? journey.nextBestAction}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid gap-4">
                  {weeklyPlan ? (
                    <div className="rounded-[1.2rem] border border-border/70 bg-white p-4">
                      <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Fokus denna vecka</p>
                      <div className="mt-3 space-y-2.5">
                        {weeklyPlan.items.slice(0, 2).map((item) => (
                          <div key={item} className="rounded-[1rem] border border-border/70 bg-secondary/20 px-3.5 py-3">
                            <p className="text-sm text-foreground">{item}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  <details className="rounded-[1.2rem] border border-border/70 bg-white p-4 shadow-card">
                    <summary className="cursor-pointer list-none text-sm font-medium text-foreground">
                      Visa mer stöd och överblick
                    </summary>
                    <div className="mt-4 grid gap-4">
                      <div className="rounded-[1rem] border border-border/70 bg-secondary/20 p-3.5">
                        <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Enkel checklista</p>
                        <div className="mt-3 space-y-2.5">
                          {journey.checklist.map((item) => (
                            <div
                              key={item.label}
                              className="flex items-center justify-between gap-4 rounded-[1rem] border border-border/70 bg-white/80 px-3.5 py-3"
                            >
                              <p className="text-sm text-foreground">{item.label}</p>
                              <Badge variant={item.done ? "default" : "outline"} className="rounded-full px-3 py-1">
                                {item.done ? "Klar" : "Kvar"}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>

                      {practicalSuggestions ? (
                        <div className="rounded-[1rem] border border-border/70 bg-secondary/20 p-3.5">
                          <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">{practicalSuggestions.title}</p>
                          <div className="mt-3 space-y-2.5">
                            {practicalSuggestions.items.map((item) => (
                              <div key={item} className="rounded-[1rem] border border-border/70 bg-white/80 px-3.5 py-3">
                                <p className="text-sm text-foreground">{item}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : null}

                      {firstLineFocusQueue.length ? (
                        <div className="rounded-[1rem] border border-border/70 bg-secondary/20 p-3.5">
                          <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Stöd för första linjen</p>
                          <div className="mt-3 space-y-3">
                            {firstLineFocusQueue.map((item) => (
                              <div key={item.key} className="rounded-[1rem] border border-border/70 bg-white/80 p-3.5">
                                <p className="text-sm font-medium text-foreground">{item.title}</p>
                                <p className="mt-2 text-sm leading-6 text-subtle">{item.summary}</p>
                                <p className="mt-2 text-xs leading-5 text-foreground/80">{item.action}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : null}

                      {duplicationPlaybook ? (
                        <div className="rounded-[1rem] border border-border/70 bg-secondary/20 p-3.5">
                          <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">{duplicationPlaybook.title}</p>
                          <p className="mt-2 text-sm leading-6 text-subtle">{duplicationPlaybook.description}</p>
                          <div className="mt-3 grid gap-3 md:grid-cols-2">
                            {duplicationPlaybook.cards.map((card) => (
                              <div key={card.title} className="rounded-[1rem] border border-border/70 bg-white/80 p-3.5">
                                <p className="text-sm font-medium text-foreground">{card.title}</p>
                                <p className="mt-2 text-sm leading-6 text-subtle">{card.summary}</p>
                                <p className="mt-2 text-xs leading-5 text-foreground/80">{card.action}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : null}

                      {duplicationRhythm ? (
                        <div className="rounded-[1rem] border border-border/70 bg-secondary/20 p-3.5">
                          <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">{duplicationRhythm.title}</p>
                          <div className="mt-3 space-y-2.5">
                            {duplicationRhythm.items.map((item) => (
                              <div key={item} className="rounded-[1rem] border border-border/70 bg-white/80 px-3.5 py-3">
                                <p className="text-sm text-foreground">{item}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : null}
                    </div>
                  </details>
                </div>
              </div>
            </DashboardSection>
          ) : null}

          {showOverview ? (
            <DashboardSection
              title="Snabbåtgärder"
              description="Tre snabba vägar när du vill agera direkt."
            >
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
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
                    Gå hit när du redan har signaler i gäng och vill följa upp dem vidare.
                  </p>
                  <Button asChild type="button" variant="outline" className="mt-3 inline-flex h-8 max-w-full self-start whitespace-normal rounded-lg px-3 text-sm leading-tight">
                    <Link to="/dashboard/partner/leads">öppna mina leads</Link>
                  </Button>
                </div>
              </div>
            </DashboardSection>
          ) : null}

          {showJourney ? (
            <DashboardSection
              title="Din resa"
              description="Du behöver inte kunna allt från start. Här ser du vägen framåt, steg för steg, så att du vet vad som är viktigast nu och vad som kommer senare."
            >
              <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
                <div className="rounded-[1.2rem] border border-border/70 bg-secondary/30 p-5">
                  <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Nu</p>
                  <p className="mt-3 text-2xl font-semibold tracking-tight text-foreground">Kom igång</p>
                  <p className="mt-2 text-sm leading-6 text-subtle">
                    Det här är första fasen. Målet är att få grunden på plats och skapa första rörelsen utan att tänka på allt annat samtidigt.
                  </p>
                  <div className="mt-4 space-y-2.5">
                    {[
                      "få ordning på dina länkar",
                      "förstå vad du delar",
                      "skicka din länk första gången",
                      "få första signalen",
                    ].map((item) => (
                      <div key={item} className="rounded-[1rem] border border-border/70 bg-white/80 px-3.5 py-3">
                        <p className="text-sm text-foreground">{item}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 rounded-[1rem] border border-emerald-300/70 bg-emerald-50 p-3.5">
                    <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Status</p>
                    <p className="mt-2 text-sm font-medium text-foreground">Pågår nu</p>
                    <p className="mt-2 text-sm text-subtle">Det här steget låser upp första riktiga resultatet.</p>
                  </div>
                </div>

                <div className="grid gap-4">
                  {[
                    {
                      eyebrow: "Öppnas snart",
                      title: "Första resultat",
                      body: "När du fått första signalen handlar nästa fas om att skapa första riktiga utfallet och upprepa det som fungerade.",
                      items: [
                        "få första lead eller kundsignal",
                        "se vad som faktiskt fungerar",
                        "upprepa samma beteende en gång till",
                        "bygga tro på att systemet fungerar",
                      ],
                      note: "Det här steget gör att du går från aktivitet till resultat.",
                    },
                    {
                      eyebrow: "Nästa nivå",
                      title: "Börja duplicera",
                      body: "När du själv fått rörelse är nästa steg att hjälpa någon annan komma igång på samma sätt.",
                      items: [
                        "bjuda in rätt person",
                        "hjälpa någon till sitt första steg",
                        "skapa första signalen i din närmaste linje",
                        "bygga något som går att upprepa",
                      ],
                      note: "Det här är där systemet börjar växa genom andra, inte bara genom dig.",
                    },
                    {
                      eyebrow: "Senare",
                      title: "Bygg vidare",
                      body: "Senare öppnas mer av affären och modellen upp, i takt med att det faktiskt blir relevant för dig.",
                      items: [
                        "kundmotor",
                        "teamrytmer",
                        "fler nivåer",
                        "kompplan och djupare förståelse",
                        "hur du bygger långsiktigt utan att göra allt själv",
                      ],
                      note: "Du behöver inte bära allt nu. Det här öppnas när du är redo.",
                    },
                  ].map((card) => (
                    <div key={card.title} className="rounded-[1.2rem] border border-border/70 bg-white p-5 shadow-card">
                      <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">{card.eyebrow}</p>
                      <p className="mt-3 text-xl font-semibold tracking-tight text-foreground">{card.title}</p>
                      <p className="mt-2 text-sm leading-6 text-subtle">{card.body}</p>
                      <div className="mt-4 space-y-2.5">
                        {card.items.map((item) => (
                          <div key={item} className="rounded-[1rem] border border-border/70 bg-secondary/20 px-3.5 py-3">
                            <p className="text-sm text-foreground">{item}</p>
                          </div>
                        ))}
                      </div>
                      <p className="mt-4 text-sm font-medium text-foreground/85">{card.note}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 rounded-[1.2rem] border border-border/70 bg-white/95 p-5 shadow-card">
                <p className="text-sm leading-7 text-subtle">
                  Du behöver inte ta alla steg i huvudet samtidigt. Det viktiga är att ta rätt nästa steg nu.
                </p>
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
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <MetricCard label="Mina leads" value={data.metrics.leads} helper="Alla leads där du är attribuerad partner." icon={<Link2 className="h-5 w-5" />} />
              <MetricCard label="Partnerleads" value={data.metrics.partnerLeads} helper="Nya intresseanmälningar för partnerskap." icon={<UserPlus2 className="h-5 w-5" />} />
              <MetricCard label="Mina kunder" value={data.metrics.customers} helper="Kunder som hittills kopplats till dig." icon={<Users className="h-5 w-5" />} />
              <MetricCard label="Direkta kontakter" value={data.metrics.directPartners} helper="Direkta partnerkontakter som kommit in via dig." icon={<Users className="h-5 w-5" />} />
            </div>
          ) : null}

          {showLeads ? (
            <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
              <DashboardSection title="Mina leads" description="Både kundleads och partnerleads sparas med din attribution.">
                <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {leadQueueSummary.map((item) => (
                    <div key={item.label} className="rounded-[1rem] border border-border/70 bg-secondary/20 px-3.5 py-3">
                      <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">{item.label}</p>
                      <p className="mt-2 text-2xl font-semibold text-foreground">{item.value}</p>
                    </div>
                  ))}
                </div>
                <div className="mb-4 grid gap-3 md:grid-cols-3">
                  {leadExecutionSummary.map((item) => (
                    <div key={item.label} className="rounded-[1rem] border border-border/70 bg-white/90 p-3.5 shadow-card">
                      <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">{item.label}</p>
                      <p className="mt-2 text-2xl font-semibold text-foreground">{item.value}</p>
                      <p className="mt-2 text-xs leading-5 text-subtle">{item.note}</p>
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
                <div className="mt-5 rounded-[1.2rem] border border-border/70 bg-white/95 p-4 shadow-card">
                    <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Ta först bland kundleads</p>
                  <div className="mt-3 space-y-3">
                    {prioritizedCustomerLeads.length ? (
                      prioritizedCustomerLeads.map((lead, index) => (
                        <div key={`${lead.id}-customer-priority`} className="rounded-[1rem] border border-border/70 bg-secondary/20 p-3.5">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="font-medium text-foreground">{index + 1}. {lead.name}</p>
                              <p className="text-xs text-subtle">{lead.email}</p>
                            </div>
                            <Badge variant={getLeadUrgencyVariant(lead)} className="rounded-full px-3 py-1">
                              {getLeadUrgencyLabel(lead)}
                            </Badge>
                          </div>
                          <p className="mt-3 text-sm text-foreground">{getLeadNextAction(lead)}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-subtle">Inga kundleads ännu. Fokusera först på att skapa första kundsignalen.</p>
                    )}
                  </div>
                </div>
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

          {showOverview ? (
            <DashboardSection
              title="Var din trafik svarar"
              description="Här ser du var din trafik faktiskt visar liv just nu. Det hjälper dig förstå vilka marknader som svarar på din länk."
            >
              <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-[0.9fr_0.9fr_1.2fr]">
                <div className="rounded-[1.2rem] border border-border/70 bg-secondary/20 p-4">
                  <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Toppländer</p>
                  <div className="mt-3 space-y-2">
                    {(data.marketInsights?.topCountries || []).map((row) => (
                      <div key={`partner-country-${row.label}`} className="flex items-center justify-between gap-3 text-sm">
                        <span className="truncate text-foreground">{row.label}</span>
                        <span className="font-medium text-foreground">{formatWholeNumber(row.visits)}</span>
                      </div>
                    ))}
                    {!data.marketInsights?.topCountries?.length ? <p className="text-sm text-subtle">Ingen marknadssignal än.</p> : null}
                  </div>
                </div>

                <div className="rounded-[1.2rem] border border-border/70 bg-secondary/20 p-4">
                  <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Toppstäder</p>
                  <div className="mt-3 space-y-2">
                    {(data.marketInsights?.topCities || []).map((row) => (
                      <div key={`partner-city-${row.label}`} className="flex items-center justify-between gap-3 text-sm">
                        <span className="truncate text-foreground">{row.label}</span>
                        <span className="font-medium text-foreground">{formatWholeNumber(row.visits)}</span>
                      </div>
                    ))}
                    {!data.marketInsights?.topCities?.length ? <p className="text-sm text-subtle">Ingen stadsdata än.</p> : null}
                  </div>
                </div>

                <div className="rounded-[1.2rem] border border-border/70 bg-white/95 p-4 shadow-card lg:col-span-2 xl:col-span-1">
                  <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Senaste geoträffar</p>
                  <div className="mt-4">
                    <DataTable
                      columns={["Senast", "Land", "Stad"]}
                      rows={(data.marketInsights?.recentLocations || []).map((row) => [
                        <span key={`${row.created_at}-time`} className="font-medium text-foreground">{formatDate(row.created_at)}</span>,
                        <span key={`${row.created_at}-country`}>{row.country || "-"}</span>,
                        <span key={`${row.created_at}-city`}>{row.city || "-"}</span>,
                      ])}
                      emptyState="Ingen geodata registrerad för din trafik ännu."
                    />
                  </div>
                  <div className="mt-4 rounded-[1rem] border border-border/70 bg-secondary/20 p-3.5 text-sm text-subtle">
                    Land är oftast säkrare än stad. Se stad som signal, inte exakt sanning.
                  </div>
                </div>
              </div>
            </DashboardSection>
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
            <div className="grid gap-8 lg:grid-cols-2">
              {showLeads ? (
                <DashboardSection title="Mina partnerleads" description="Här ser du partnerintresse och vad du bör göra härnäst.">
                <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {partnerLeadQueueSummary.map((item) => (
                    <div key={item.label} className="rounded-[1rem] border border-border/70 bg-secondary/20 px-3.5 py-3">
                      <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">{item.label}</p>
                      <p className="mt-2 text-2xl font-semibold text-foreground">{item.value}</p>
                    </div>
                  ))}
                </div>
                <div className="mb-4 grid gap-3 md:grid-cols-3">
                  {partnerLeadExecutionSummary.map((item) => (
                    <div key={item.label} className="rounded-[1rem] border border-border/70 bg-white/90 p-3.5 shadow-card">
                      <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">{item.label}</p>
                      <p className="mt-2 text-2xl font-semibold text-foreground">{item.value}</p>
                      <p className="mt-2 text-xs leading-5 text-subtle">{item.note}</p>
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
                  <div className="mt-5 rounded-[1.2rem] border border-border/70 bg-white/95 p-4 shadow-card">
                    <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Ta först bland partnerleads</p>
                    <div className="mt-3 space-y-3">
                      {prioritizedPartnerLeads.length ? (
                        prioritizedPartnerLeads.map((lead, index) => (
                          <div key={`${lead.id}-partner-priority`} className="rounded-[1rem] border border-border/70 bg-secondary/20 p-3.5">
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <p className="font-medium text-foreground">{index + 1}. {lead.name}</p>
                                <p className="text-xs text-subtle">{lead.email}</p>
                              </div>
                              <Badge variant={getLeadUrgencyVariant(lead)} className="rounded-full px-3 py-1">
                                {getLeadUrgencyLabel(lead)}
                              </Badge>
                            </div>
                            <p className="mt-3 text-sm text-foreground">{getLeadNextAction(lead)}</p>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-subtle">Inga partnerleads ännu. Fokusera först på att skapa första partnersignalen.</p>
                      )}
                    </div>
                  </div>
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
                          Du ligger nära toppen i den här modellen. Det betyder att stödet uppåt främst kommer direkt från Omega Balance-teamet.
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

                  {firstLineFocusQueue.length ? (
                    <div className="mb-4 rounded-[1.1rem] border border-border/70 bg-white/95 p-4 shadow-card">
                      <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Arbeta med first line nu</p>
                      <div className="mt-3 grid gap-3">
                        {firstLineFocusQueue.map((item) => (
                          <div key={item.key} className="rounded-[1rem] border border-border/70 bg-secondary/20 p-3.5">
                            <p className="text-sm font-medium text-foreground">{item.title}</p>
                            <p className="mt-2 text-sm leading-6 text-subtle">{item.summary}</p>
                            <p className="mt-2 text-xs leading-5 text-foreground/80">{item.action}</p>
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
