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
      return "Beh\u00f6ver kontakt";
    case "qualified":
      return "F\u00f6lj upp nu";
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
      return "Ta f\u00f6rsta kontakt i dag.";
    case "qualified":
      return "F\u00f6lj upp medan signalen fortfarande \u00e4r varm.";
    case "active":
      return lead.type === "partner_lead"
        ? "H\u00e5ll dialogen levande och f\u00f6rs\u00f6k boka n\u00e4sta steg."
        : "F\u00f6r dialogen vidare mot test, order eller tydligt beslut.";
    case "inactive":
      return "Parkera tillf\u00e4lligt och ta ny kontakt vid r\u00e4tt l\u00e4ge.";
    case "won":
      return "Bygg vidare p\u00e5 det som fungerade och skapa n\u00e4sta resultat.";
    case "lost":
      return "L\u00e4gg ingen energi h\u00e4r just nu.";
    default:
      return "Best\u00e4m n\u00e4sta tydliga steg.";
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
      return "St\u00e4ngd";
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
      return "H\u00f6g";
    case "active":
      return "Nu";
    case "inactive":
      return "L\u00e5g";
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
      title: "Bekr\u00e4fta grunden",
      description: "Godk\u00e4nn portalvillkor och integritet innan du g\u00e5r vidare.",
      mode: "legal" as const,
      label: "\u00d6ppna legal",
    };
  }

  if (!hasRequiredZzLinks(data)) {
    return {
      title: "L\u00e4gg in dina ZZ-l\u00e4nkar",
      description: "Test-, shop- och partnerl\u00e4nk beh\u00f6ver finnas p\u00e5 plats innan du b\u00f6rjar arbeta externt.",
      mode: "links" as const,
      label: "\u00d6ppna l\u00e4nkar",
    };
  }

  if (data.leads.length === 0 && data.partnerLeads.length === 0 && data.customers.length === 0 && data.metrics.directPartners === 0) {
    return {
      title: "Skapa f\u00f6rsta signalen",
      description: "N\u00e4r grunden \u00e4r klar \u00e4r n\u00e4sta steg att dela Omega-l\u00e4nken och f\u00e5 in f\u00f6rsta r\u00f6relsen.",
      mode: "copy-link" as const,
      label: "Kopiera Omega-l\u00e4nk",
    };
  }

  return {
    title: "Arbeta vidare i leads",
    description: "Du har redan signaler i g\u00e5ng. Forts\u00e4tt d\u00e4r arbetet faktiskt r\u00f6r sig just nu.",
    mode: "leads" as const,
    label: "\u00d6ppna leads",
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
      title: "Hj\u00e4lp f\u00f6rsta linjen ig\u00e5ng",
      reason: "Du har redan skapat egen r\u00f6relse. Nu blir n\u00e4sta h\u00e4vst\u00e5ng att hj\u00e4lpa n\u00e5gon n\u00e4ra dig till sin f\u00f6rsta signal.",
      action: "V\u00e4lj en partner i f\u00f6rsta linjen och hj\u00e4lp den personen till ett f\u00f6rsta tydligt steg denna vecka.",
    };
  }

  if (firstResultReached) {
    return {
      title: "Bygg p\u00e5 f\u00f6rsta resultatet",
      reason: "Nu g\u00e4ller det att upprepa det som fungerade medan tempot fortfarande finns kvar.",
      action: "Fokusera p\u00e5 ett andra resultat i samma riktning i st\u00e4llet f\u00f6r att sprida dig f\u00f6r brett.",
    };
  }

  if (activeLead) {
    return {
      title: "Driv aktiv dialog fram\u00e5t",
      reason: "Det finns redan r\u00f6relse. Det viktiga nu \u00e4r att h\u00e5lla tempot uppe tills du f\u00e5r ett tydligt utfall.",
      action: getLeadNextAction(activeLead),
    };
  }

  if (warmLead) {
    return {
      title: "F\u00f6lj upp varm lead nu",
      reason: "Det h\u00e4r \u00e4r l\u00e4get d\u00e4r f\u00f6rsta resultat ofta avg\u00f6rs.",
      action: `Ta n\u00e4sta kontakt med ${warmLead.name} medan signalen fortfarande \u00e4r varm.`,
    };
  }

  if (newLead) {
    return {
      title: "Ta f\u00f6rsta kontakt i dag",
      reason: "Ett nytt lead \u00e4r mest v\u00e4rdefullt tidigt, innan tempot sjunker.",
      action: `B\u00f6rja med ${newLead.name} och ta f\u00f6rsta kontakt i dag.`,
    };
  }

  return {
    title: "Skapa f\u00f6rsta signalen",
    reason: "Du beh\u00f6ver f\u00f6rsta r\u00f6relsen i systemet innan n\u00e5got annat blir viktigt.",
    action: "Dela din Omega-l\u00e4nk och f\u00f6rs\u00f6k f\u00e5 in ett f\u00f6rsta kund- eller partnerlead.",
  };
}

function buildWeeklyPlan(data: PartnerDashboardData) {
  const allLeads = [...data.leads, ...data.partnerLeads];
  const activeLead = allLeads.find((lead) => lead.status === "active");
  const warmLead = allLeads.find((lead) => lead.status === "qualified");
  const newLead = allLeads.find((lead) => lead.status === "new");

  if (data.metrics.directPartners > 0) {
    return {
      title: "Den h\u00e4r veckan",
      items: [
        "V\u00e4lj en person i f\u00f6rsta linjen som du aktivt hj\u00e4lper fram\u00e5t.",
        "S\u00e4tt ett enda tydligt m\u00e5l f\u00f6r den personen denna vecka.",
        "F\u00f6lj upp utfallet innan du sprider fokus vidare.",
      ],
    };
  }

  if (data.customers.length > 0 || data.metrics.directPartners > 0) {
    return {
      title: "Den h\u00e4r veckan",
      items: [
        "Upprepa samma aktivitet som gav ditt f\u00f6rsta resultat.",
        "Fokusera p\u00e5 ett andra resultat innan du breddar f\u00f6r mycket.",
        "Skydda tempot genom att f\u00f6lja upp det som redan \u00e4r ig\u00e5ng.",
      ],
    };
  }

  if (activeLead) {
    return {
      title: "Den h\u00e4r veckan",
      items: [
        `Driv dialogen med ${activeLead.name} till ett tydligt utfall.`,
        "L\u00e5t inte aktiv r\u00f6relse bli st\u00e5ende utan n\u00e4sta steg.",
        "Prioritera f\u00e4rre samtal med h\u00f6gre kvalitet framf\u00f6r fler l\u00f6sa kontakter.",
      ],
    };
  }

  if (warmLead) {
    return {
      title: "Den h\u00e4r veckan",
      items: [
        `F\u00f6lj upp ${warmLead.name} medan signalen fortfarande \u00e4r varm.`,
        "F\u00f6rs\u00f6k f\u00e5 ett tydligt besked i st\u00e4llet f\u00f6r att l\u00e4mna dialogen \u00f6ppen.",
        "Skriv kort vad n\u00e4sta steg \u00e4r direkt efter kontakten.",
      ],
    };
  }

  if (newLead) {
    return {
      title: "Den h\u00e4r veckan",
      items: [
        `Ta f\u00f6rsta kontakt med ${newLead.name}.`,
        "Skapa ett enkelt tempo: kontakt f\u00f6rst, funderingar sen.",
        "Fokusera p\u00e5 att f\u00e5 ett f\u00f6rsta svar, inte p\u00e5 att g\u00f6ra allt perfekt.",
      ],
    };
  }

  return {
    title: "Den h\u00e4r veckan",
    items: [
      "Dela din Omega-l\u00e4nk i ett sammanhang d\u00e4r du faktiskt f\u00e5r respons.",
      "Sikta p\u00e5 en f\u00f6rsta tydlig signal, inte maximal r\u00e4ckvidd.",
      "N\u00e4r f\u00f6rsta leaden kommer in, f\u00f6lj upp snabbt samma dag.",
    ],
  };
}

function buildPracticalWorkSuggestions(data: PartnerDashboardData) {
  const allLeads = [...data.leads, ...data.partnerLeads];
  const firstResultReached = data.customers.length > 0 || data.metrics.directPartners > 0;
  const hasWarmDialog = allLeads.some((lead) => lead.status === "qualified" || lead.status === "active");

  if (data.metrics.directPartners > 0) {
    return {
      title: "Praktiskt arbetss\u00e4tt",
      items: [
        "Ta ett kort avst\u00e4mningssamtal med din n\u00e4rmaste partner och hj\u00e4lp personen att v\u00e4lja en enda n\u00e4sta aktivitet.",
        "Bjud hellre in till ett gemensamt Zoom-call \u00e4n att f\u00f6rs\u00f6ka f\u00f6rklara allt sj\u00e4lv i l\u00e5nga meddelanden.",
        "Be personen b\u00f6rja n\u00e4ra sitt eget n\u00e4tverk och f\u00f6lj upp direkt efter f\u00f6rsta kontakterna.",
      ],
    };
  }

  if (firstResultReached || hasWarmDialog) {
    return {
      title: "Praktiskt arbetss\u00e4tt",
      items: [
        "F\u00f6lj upp medan dialogen fortfarande lever och f\u00f6rs\u00f6k f\u00e5 ett tydligt n\u00e4sta steg i st\u00e4llet f\u00f6r l\u00f6sa svar.",
        "N\u00e4r intresse finns, bjud hellre vidare till samtal eller Zoom \u00e4n att skriva l\u00e4ngre och l\u00e4ngre f\u00f6rklaringar.",
        "Skriv kort efter varje kontakt vad som ska h\u00e4nda h\u00e4rn\u00e4st, s\u00e5 att tempot inte tappas bort.",
      ],
    };
  }

  return {
    title: "Praktiskt arbetss\u00e4tt",
    items: [
      "B\u00f6rja n\u00e4ra. V\u00e4lj n\u00e5gra personliga kontakter d\u00e4r det redan finns f\u00f6rtroende, i st\u00e4llet f\u00f6r att skriva till alla.",
      "Anv\u00e4nd sociala medier f\u00f6r att v\u00e4cka nyfikenhet och forts\u00e4tt sedan i dialog med dem som faktiskt svarar.",
      "N\u00e4r n\u00e5gon visar intresse, bjud vidare till samtal eller Zoom i st\u00e4llet f\u00f6r att f\u00f6rs\u00f6ka b\u00e4ra hela f\u00f6rklaringen sj\u00e4lv.",
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
      title: "S\u00e5 duplicerar du vidare",
      description: "Nu handlar det inte bara om din egen aktivitet, utan om att hj\u00e4lpa f\u00f6rsta linjen att arbeta p\u00e5 samma s\u00e4tt.",
      cards: [
        {
          title: "Personliga kontakter",
          summary: "Be partnern b\u00f6rja n\u00e4ra sitt eget n\u00e4tverk d\u00e4r f\u00f6rtroende redan finns.",
          action: "L\u00e5t personen v\u00e4lja n\u00e5gra namn i sin n\u00e4rhet innan ni breddar vidare.",
        },
        {
          title: "Sociala medier",
          summary: "Anv\u00e4nd sociala medier f\u00f6r att \u00f6ppna d\u00f6rrar, inte f\u00f6r att b\u00e4ra hela f\u00f6rklaringen.",
          action: "Be partnern f\u00f6lja upp dem som faktiskt svarar i st\u00e4llet f\u00f6r att jaga r\u00e4ckvidd.",
        },
        {
          title: "Zoom eller samtal",
          summary: "N\u00e4r intresset \u00e4r tydligt ska ni snabbare vidare till gemensamt samtal eller Zoom.",
          action: "Bjud hellre in till ett n\u00e4sta steg \u00e4n att f\u00f6rklara allt i text.",
        },
        {
          title: hasSponsor ? "St\u00f6d upp\u00e5t och ned\u00e5t" : "St\u00f6d fr\u00e5n Omega Balance-teamet",
          summary: hasSponsor
            ? `Du hj\u00e4lper ned\u00e5t och tar samtidigt hj\u00e4lp av ${data.sponsor?.name} upp\u00e5t n\u00e4r det beh\u00f6vs.`
            : "Du hj\u00e4lper din f\u00f6rsta linje vidare och tar samtidigt st\u00f6d direkt fr\u00e5n Omega Balance-teamet n\u00e4r det beh\u00f6vs.",
          action: "H\u00e5ll st\u00f6det n\u00e4ra n\u00e4sta aktivitet, inte som allm\u00e4n pepp eller teori.",
        },
      ],
    };
  }

  if (firstResultReached || hasWarmDialog) {
    return {
      title: "S\u00e5 bygger du vidare",
      description: "Du har redan r\u00f6relse. N\u00e4sta steg \u00e4r att g\u00f6ra arbetss\u00e4ttet tydligt och upprepningsbart.",
      cards: [
        {
          title: "Personliga kontakter",
          summary: "B\u00f6rja med personer d\u00e4r du naturligt kan ta n\u00e4sta kontakt utan att det k\u00e4nns krystat.",
          action: "V\u00e4lj hellre n\u00e5gra relevanta kontakter \u00e4n att skriva till m\u00e5nga samtidigt.",
        },
        {
          title: "Sociala medier",
          summary: "L\u00e5t sociala medier v\u00e4cka nyfikenhet, men ta dialogen vidare d\u00e4r riktig respons finns.",
          action: "Svara snabbt d\u00e4r n\u00e5gon visar intresse i st\u00e4llet f\u00f6r att sprida energin f\u00f6r brett.",
        },
        {
          title: "Zoom eller samtal",
          summary: "N\u00e4r fr\u00e5gorna blir fler \u00e4n ett par meddelanden \u00e4r det oftast dags f\u00f6r samtal.",
          action: "Flytta dialogen till Zoom eller telefon n\u00e4r du m\u00e4rker att intresset \u00e4r p\u00e5 riktigt.",
        },
        {
          title: hasSponsor ? "Ta hj\u00e4lp upp\u00e5t" : "Ta st\u00f6d fr\u00e5n Omega Balance-teamet",
          summary: hasSponsor
            ? `Du beh\u00f6ver inte b\u00e4ra allt sj\u00e4lv. Ta hj\u00e4lp av ${data.sponsor?.name} eller din up-line n\u00e4r du k\u00f6r fast.`
            : "Du beh\u00f6ver inte b\u00e4ra allt sj\u00e4lv. Ta st\u00f6d av Omega Balance-teamet n\u00e4r du k\u00f6r fast eller vill g\u00f6ra n\u00e4sta steg tydligare.",
          action: "Be om hj\u00e4lp n\u00e4r det kan \u00f6ka kvaliteten i ett samtal eller n\u00e4sta steg.",
        },
      ],
    };
  }

  return {
    title: "S\u00e5 kommer du ig\u00e5ng",
    description: "Det f\u00f6rsta arbetss\u00e4ttet ska vara enkelt nog att upprepa och tydligt nog att k\u00e4nnas naturligt.",
    cards: [
      {
        title: "Personliga kontakter",
        summary: "B\u00f6rja n\u00e4ra med n\u00e5gra personer d\u00e4r det redan finns f\u00f6rtroende.",
        action: "T\u00e4nk familj, v\u00e4nner, tidigare kollegor eller andra du kan kontakta utan att det k\u00e4nns konstlat.",
      },
      {
        title: "Sociala medier",
        summary: "Anv\u00e4nd sociala medier f\u00f6r att skapa nyfikenhet, inte f\u00f6r att jaga alla samtidigt.",
        action: "L\u00e4gg energi p\u00e5 dem som svarar eller visar verkligt intresse.",
      },
      {
        title: "Zoom eller samtal",
        summary: "Du beh\u00f6ver inte f\u00f6rklara allt sj\u00e4lv i text fr\u00e5n b\u00f6rjan.",
        action: "N\u00e4r intresse finns, bjud vidare till ett samtal eller Zoom i st\u00e4llet f\u00f6r att skriva l\u00e4ngre meddelanden.",
      },
      {
        title: hasSponsor ? "Ta hj\u00e4lp upp\u00e5t" : "St\u00f6d fr\u00e5n Omega Balance-teamet",
        summary: hasSponsor
          ? "N\u00e4r du k\u00f6r fast \u00e4r n\u00e4sta steg ofta att ta hj\u00e4lp av din up-line."
          : "N\u00e4r du k\u00f6r fast \u00e4r n\u00e4sta steg ofta att ta st\u00f6d direkt fr\u00e5n Omega Balance-teamet i st\u00e4llet f\u00f6r att tveka f\u00f6r l\u00e4nge sj\u00e4lv.",
        action: "Be om hj\u00e4lp n\u00e4r du har en verklig kontakt i g\u00e5ng eller vill g\u00f6ra n\u00e4sta steg tydligare.",
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
      title: "Duplicering b\u00f6rjar s\u00e5 h\u00e4r",
      items: [
        "Bygg f\u00f6rst din egen rytm tills du vet vad som faktiskt fungerar i praktiken.",
        "Spara kort vad du s\u00e4ger i f\u00f6rsta kontakt, hur du f\u00f6ljer upp och n\u00e4r du bjuder vidare till samtal eller Zoom.",
        hasSponsor
          ? "N\u00e4r n\u00e5got b\u00f6rjar fungera, st\u00e4m av med din up-line hur samma arbetss\u00e4tt kan g\u00f6ras enklare att upprepa."
          : "N\u00e4r n\u00e5got b\u00f6rjar fungera, h\u00e5ll arbetss\u00e4ttet enkelt nog att upprepa innan du f\u00f6rs\u00f6ker bredda det.",
      ],
    };
  }

  return {
    title: "Din dupliceringsrytm",
    items: [
      nearestDownline
        ? `Fokusera denna vecka p\u00e5 att hj\u00e4lpa ${nearestDownline.partnerName} till ett enda tydligt n\u00e4sta steg.`
        : "Fokusera denna vecka p\u00e5 din n\u00e4rmaste first line och h\u00e5ll st\u00f6det n\u00e4ra n\u00e4sta aktivitet.",
      "Anv\u00e4nd gemensamt samtal eller Zoom n\u00e4r det h\u00f6jer kvaliteten, i st\u00e4llet f\u00f6r att skriva l\u00e4ngre f\u00f6rklaringar i efterhand.",
      hasSponsor
        ? `N\u00e4r ni k\u00f6r fast, lyft l\u00e4get kort till ${data.sponsor?.name} med vad som redan \u00e4r gjort och vad n\u00e4sta hinder faktiskt \u00e4r.`
        : "N\u00e4r ni k\u00f6r fast, lyft bara det som beh\u00f6ver n\u00e4sta niv\u00e5 av st\u00f6d och h\u00e5ll resten n\u00e4ra vardagsarbetet.",
    ],
  };
}

function buildLeadQueueSummary(leads: Lead[]) {
  const urgent = leads.filter((lead) => lead.status === "new" || lead.status === "qualified").length;
  const active = leads.filter((lead) => lead.status === "active").length;
  const newLeads = leads.filter((lead) => lead.status === "new").length;
  const done = leads.filter((lead) => lead.status === "won").length;

  return [
    { label: "Br\u00e5dskande nu", value: urgent },
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
    { label: "Ta i dag", value: takeToday, note: "Nya kontakter som b\u00f6r f\u00e5 f\u00f6rsta svar snabbt." },
    { label: "F\u00f6lj upp nu", value: followUpNow, note: "Varmare dialoger som inte b\u00f6r tappa fart." },
    { label: "H\u00e5ll levande", value: activeDialogs, note: "Aktiva samtal som beh\u00f6ver n\u00e4sta steg, inte bara v\u00e4ntan." },
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
      label: "F\u00f6rsta aktivitet",
      description: "Ett lead eller en f\u00f6rsta signal har skapats.",
      done: hasLead,
      current: !hasLead,
    },
    {
      label: "Respons",
      description: "En dialog har kommit ig\u00e5ng och \u00e4r redo f\u00f6r tydlig uppf\u00f6ljning.",
      done: hasResponse,
      current: hasLead && !hasResponse,
    },
    {
      label: "F\u00f6rsta resultat",
      description: "En kundsignal eller tydlig partnerreaktion finns.",
      done: hasResult,
      current: hasResponse && !hasResult,
    },
    {
      label: "N\u00e4sta fas",
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
    { label: "Godk\u00e4nn portalvillkor och integritet", done: legalAccepted },
    { label: "L\u00e4gg in dina tre ZZ-l\u00e4nkar", done: zzLinksReady },
    { label: "Dela din referral-l\u00e4nk", done: data.partner.referral_code.length > 0 },
    { label: "Skapa f\u00f6rsta kundsignal", done: customerLeads > 0 || customers > 0 },
    { label: "Skapa f\u00f6rsta partnerintresse", done: partnerLeads > 0 },
    { label: "F\u00e5 f\u00f6rsta direkta partnerkontakt", done: directPartners > 0 },
  ];

  const completedMilestones = checklist.filter((item) => item.done).length;
  const encouragement =
    completedMilestones === 0
      ? "Du \u00e4r h\u00e4r och tittar in i portalen. Det i sig \u00e4r en bra b\u00f6rjan."
      : completedMilestones === 1
        ? "Bra start. Du har redan tagit f\u00f6rsta riktiga steget."
        : completedMilestones === 2
          ? "Snyggt jobbat. Du bygger faktiskt grunden, inte bara t\u00e4nker p\u00e5 den."
          : completedMilestones === 3
            ? "Det h\u00e4r b\u00f6rjar ta form p\u00e5 riktigt. Du har redan flera viktiga bitar p\u00e5 plats."
            : completedMilestones === 4
              ? "Starkt. Du har kommit f\u00f6rbi startstr\u00e4ckan och b\u00f6rjar skapa riktig r\u00f6relse."
              : completedMilestones === 5
                ? "Riktigt bra jobbat. Nu m\u00e4rks det att du bygger n\u00e5got som kan upprepas."
                : "Mycket fint jobbat. Du har tagit dig l\u00e5ngt och bygger nu vidare fr\u00e5n en stark grund.";

  if (!legalAccepted) {
    return {
      stageLabel: "Bekr\u00e4fta grunden",
      summary: "Innan du arbetar vidare i portalen beh\u00f6ver villkor och integritet vara godk\u00e4nda.",
      nextMilestone: "Godk\u00e4nda portalvillkor och integritet",
      nextBestAction: "L\u00e4s igenom dokumenten, bekr\u00e4fta att du f\u00f6rst\u00e5tt uppl\u00e4gget och slutf\u00f6r godk\u00e4nnandet.",
      encouragement,
      checklist,
    };
  }

  if (!zzLinksReady) {
    return {
      stageLabel: "L\u00e4gg grunden",
      summary: "Innan du driver trafik eller f\u00f6ljer upp leads beh\u00f6ver test-, shop- och partnerl\u00e4nken finnas p\u00e5 plats.",
      nextMilestone: "Tre Zinzino-destinationer sparade",
      nextBestAction: "G\u00e5 till L\u00e4nkar och l\u00e4gg in dina tre personliga ZZ-l\u00e4nkar innan du b\u00f6rjar arbeta externt.",
      encouragement,
      checklist,
    };
  }

  if (customers === 0 && customerLeads === 0 && partnerLeads === 0 && directPartners === 0) {
    return {
      stageLabel: "Kom ig\u00e5ng",
      summary: "Fokus just nu \u00e4r att skapa f\u00f6rsta riktiga r\u00f6relsen, inte att g\u00f6ra allt samtidigt.",
      nextMilestone: "F\u00f6rsta kundsignal eller f\u00f6rsta partnerintresse",
      nextBestAction: "Dela din l\u00e4nk och fokusera p\u00e5 att f\u00e5 din f\u00f6rsta kund eller ditt f\u00f6rsta partnerlead.",
      encouragement,
      checklist,
    };
  }

  if (customers === 0 && customerLeads <= 1 && partnerLeads <= 1 && directPartners === 0) {
    return {
      stageLabel: "F\u00f6rsta resultat",
      summary: "Du har b\u00f6rjat r\u00f6ra dig. Nu g\u00e4ller det att visa att det inte bara var ett enstaka f\u00f6rs\u00f6k.",
      nextMilestone: "Ett andra resultat i samma riktning",
      nextBestAction: "Upprepa det som gav f\u00f6rsta signalen och h\u00e5ll fokus p\u00e5 samma typ av aktivitet n\u00e5gra dagar till.",
      encouragement,
      checklist,
    };
  }

  if (directPartners === 0) {
    return {
      stageLabel: "Bygg upprepad aktivitet",
      summary: "Du har flera signaler ig\u00e5ng, men allt bygger fortfarande mest p\u00e5 din egen aktivitet.",
      nextMilestone: "F\u00f6rsta direkta partnerkontakt eller tydlig first-line-signal",
      nextBestAction: "Forts\u00e4tt skapa kund- och partnerintresse, men b\u00f6rja styra fokus mot att f\u00e5 in din f\u00f6rsta direkta partnerkontakt.",
      encouragement,
      checklist,
    };
  }

  if (directPartners > 0 && partnerLeads + customerLeads + customers < 4) {
    return {
      stageLabel: "Aktivera first line",
      summary: "Du \u00e4r inte l\u00e4ngre helt sj\u00e4lv i fl\u00f6det. N\u00e4sta steg \u00e4r att hj\u00e4lpa f\u00f6rsta linjen att b\u00f6rja r\u00f6ra sig.",
      nextMilestone: "F\u00f6rsta tydliga signalen fr\u00e5n first line",
      nextBestAction: "Hj\u00e4lp din f\u00f6rsta partner att f\u00e5 sitt f\u00f6rsta lead eller sin f\u00f6rsta kundsignal i st\u00e4llet f\u00f6r att bara producera sj\u00e4lv.",
      encouragement,
      checklist,
    };
  }

  return {
    stageLabel: "Tidig duplicering",
    summary: "Det finns tidiga signaler p\u00e5 att arbetet b\u00f6rjar upprepa sig genom andra. Nu handlar det om stabilitet, inte bara fart.",
    nextMilestone: "Fler \u00e5terkommande signaler fr\u00e5n first line",
    nextBestAction: "Skydda det som fungerar och hj\u00e4lp fler i f\u00f6rsta linjen att upprepa samma beteende.",
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
      title: "Steg 1: Kom ig\u00e5ng sj\u00e4lv",
      description: "L\u00e4gg grunden f\u00f6rst. D\u00e5 blir resten enklare att upprepa.",
      target: "Legal, l\u00e4nkar och din egen Omega-l\u00e4nk ska vara p\u00e5 plats.",
      reward: "Bra jobbat. Nu har du din egen grund p\u00e5 plats.",
      done: ownFoundationReady,
    },
    {
      id: "customers",
      title: "Steg 2: F\u00e5 dina f\u00f6rsta kunder",
      description: "Skapa f\u00f6rsta riktiga r\u00f6relsen med din l\u00e4nk och n\u00e5gra tydliga kundsignaler.",
      target: firstCustomersReached
        ? `${customerSignals} kundsignaler skapade hittills.`
        : "M\u00e5let \u00e4r att f\u00e5 in din f\u00f6rsta kundsignal och b\u00f6rja bygga en liten stabil kundbas.",
      reward: "Snyggt. Nu har du bevis p\u00e5 att modellen g\u00e5r att s\u00e4tta i r\u00f6relse.",
      done: firstCustomersReached,
    },
    {
      id: "start-two",
      title: "Steg 3: Hj\u00e4lp tv\u00e5 personer att komma ig\u00e5ng",
      description: "Nu b\u00f6rjar dupliceringen. N\u00e4sta niv\u00e5 \u00e4r att du inte bara bygger sj\u00e4lv.",
      target: twoStarted
        ? `${Math.max(data.metrics.directPartners, partnerSignals)} partnerstarter eller partnersignaler finns redan.`
        : "M\u00e5let \u00e4r att hj\u00e4lpa tv\u00e5 personer till en f\u00f6rsta tydlig start via ditt fl\u00f6de.",
      reward: "Bra d\u00e4r. Nu bygger du inte bara sj\u00e4lv, du b\u00f6rjar bygga vidare genom andra.",
      done: twoStarted,
    },
    {
      id: "activate-two",
      title: "Steg 4: Hj\u00e4lp dina tv\u00e5 att f\u00e5 fart",
      description: "Nu g\u00e4ller det att hj\u00e4lpa de f\u00f6rsta vidare s\u00e5 att arbetet kan upprepas utan att allt h\u00e4nger p\u00e5 dig.",
      target: firstLineMoving
        ? "Det finns tydliga first-line-signaler att bygga vidare p\u00e5."
        : "M\u00e5let \u00e4r att dina tv\u00e5 f\u00f6rsta inte bara startar, utan b\u00f6rjar f\u00e5 egen r\u00f6relse.",
      reward: "Starkt jobbat. Nu har du byggt en riktig startmotor, inte bara en eng\u00e5ngsinsats.",
      done: firstLineMoving,
    },
  ];

  const currentStepIndex = steps.findIndex((step) => !step.done);

  return {
    launchDay,
    daysLeft,
    completedSteps: steps.filter((step) => step.done).length,
    totalSteps: steps.length,
    currentTitle: currentStepIndex === -1 ? "Fast Start genomf\u00f6rd" : steps[currentStepIndex].title,
    currentFocus:
      currentStepIndex === -1
        ? "Nu handlar det om att upprepa det som fungerar och hj\u00e4lpa fler i din f\u00f6rsta linje fram\u00e5t."
        : steps[currentStepIndex].description,
    momentumMessage:
      currentStepIndex <= 0
        ? "En sak i taget. Grunden f\u00f6rst, tempo sedan."
        : currentStepIndex === 1
          ? "Bra jobbat. Nu har du en grund att bygga riktiga kundsignaler ovanp\u00e5."
          : currentStepIndex === 2
            ? "Nu b\u00f6rjar det bli en verksamhet, inte bara en egen aktivitet."
            : currentStepIndex === 3
              ? "Nu flyttas fokus fr\u00e5n din egen fart till hur v\u00e4l du hj\u00e4lper andra i g\u00e5ng."
              : "Snyggt jobbat. Nu kan du b\u00f6rja bygga vidare med mycket b\u00e4ttre rytm.",
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
      statusTitle: "Level 1 - Aktivering",
      statusBody: "Du har inte hela grunden p\u00e5 plats \u00e4n. Fixa den f\u00f6rst s\u00e5 blir resten mycket enklare.",
      nextGoal: "N\u00e4sta m\u00e5l: f\u00e5 grunden helt klar",
      actionTitle: "F\u00e5 grunden klar nu",
      actionBody: "Godk\u00e4nn legal och l\u00e4gg in dina l\u00e4nkar innan du b\u00f6rjar driva r\u00f6relse.",
      actionLabel: !legalAccepted ? "\u00d6ppna legal" : "\u00d6ppna l\u00e4nkar",
      actionMode: !legalAccepted ? ("legal" as const) : ("links" as const),
      helper: [
        "G\u00f6r klart legal f\u00f6rst",
        "L\u00e4gg in test-, shop- och partnerl\u00e4nk",
        "Se till att du sj\u00e4lv kan st\u00e5 f\u00f6r det du delar",
      ],
      liveTitle: "Det h\u00e4r h\u00e4nder just nu",
      liveBody: "S\u00e5 fort grunden \u00e4r klar kan systemet b\u00f6rja jobba \u00e5t dig.",
      liveMeta: "Du \u00e4r n\u00e4ra f\u00f6rsta riktiga start",
      nextLevelTitle: "N\u00e4sta steg",
      nextLevelBody: "N\u00e4r grunden \u00e4r klar l\u00e5ser du upp f\u00f6rsta aktiveringen.",
      momentum: "Du \u00e4r h\u00e4r nu. F\u00e5 grunden klar och g\u00e5 vidare.",
      shareMode: "setup" as const,
    };
  }

  if (visits === 0) {
    return {
      level: 1,
      statusTitle: "Level 1 - Aktivering",
      statusBody: "Du har kommit ig\u00e5ng. Nu beh\u00f6ver du skapa f\u00f6rsta r\u00f6relsen.",
      nextGoal: "N\u00e4sta m\u00e5l: f\u00f6rsta signal",
      actionTitle: "Skicka din l\u00e4nk till 1 person nu",
      actionBody: "Din l\u00e4nk \u00e4r redo. B\u00f6rja med att dela den med 1 person du redan har kontakt med.",
      actionLabel: "Kopiera min l\u00e4nk",
      actionMode: "copy-link" as const,
      helper: [
        "n\u00e5gon du redan pratar med",
        "n\u00e5gon som bryr sig om h\u00e4lsa",
        "n\u00e5gon du litar p\u00e5",
      ],
      liveTitle: "Det h\u00e4r h\u00e4nder just nu",
      liveBody: "S\u00e5 fort n\u00e5gon anv\u00e4nder din l\u00e4nk ser du f\u00f6rsta signalen h\u00e4r.",
      liveMeta: "Du \u00e4r ett klick fr\u00e5n att f\u00e5 systemet i r\u00f6relse",
      nextLevelTitle: "N\u00e4sta steg",
      nextLevelBody: "N\u00e4r du f\u00e5r din f\u00f6rsta signal l\u00e5ser du upp n\u00e4sta niv\u00e5.",
      momentum: "Du har varit aktiv idag",
      shareMode: "start" as const,
    };
  }

  if (resultSignals === 0) {
    return {
      level: 2,
      statusTitle: "Level 2 - F\u00f6rsta signal",
      statusBody: "Din l\u00e4nk anv\u00e4nds. Nu g\u00e4ller det att bygga vidare medan tempot finns kvar.",
      nextGoal: "N\u00e4sta m\u00e5l: f\u00f6rsta resultat",
      actionTitle: "Skicka din l\u00e4nk till 1 person till",
      actionBody: "Du har redan r\u00f6relse. Nu vill vi f\u00e5 den att upprepa sig snabbt.",
      actionLabel: "Kopiera min l\u00e4nk",
      actionMode: "copy-link" as const,
      helper: [
        "n\u00e5gon som redan visat lite intresse",
        "n\u00e5gon som brukar svara dig",
        "n\u00e5gon som vill f\u00f6rst\u00e5 sin h\u00e4lsa b\u00e4ttre",
      ],
      liveTitle: "Det h\u00e4r h\u00e4nder just nu",
      liveBody: visits === 1 ? "1 person har klickat p\u00e5 din l\u00e4nk." : `${visits} personer har klickat p\u00e5 din l\u00e4nk.`,
      liveMeta: "Du \u00e4r n\u00e4ra ditt f\u00f6rsta resultat",
      nextLevelTitle: "N\u00e4sta niv\u00e5",
      nextLevelBody: "N\u00e4r du f\u00e5r ditt f\u00f6rsta lead eller partnerintresse \u00f6ppnas n\u00e4sta steg.",
      momentum: visits > 1 ? `Du har skapat ${visits} signaler hittills` : "Du har f\u00e5tt f\u00f6rsta signalen",
      shareMode: "build" as const,
    };
  }

  if (!duplicationReady || data.metrics.directPartners === 0) {
    return {
      level: 3,
      statusTitle: "Level 3 - F\u00f6rsta resultat",
      statusBody: "Du har f\u00e5tt din f\u00f6rsta riktiga signal. Nu \u00e4r det dags att skapa n\u00e4sta lilla vinst.",
      nextGoal: "N\u00e4sta m\u00e5l: f\u00f6rsta kund eller f\u00f6rsta partnerkontakt",
      actionTitle: "Skicka din l\u00e4nk till 1 person som kan vilja g\u00f6ra samma resa",
      actionBody: "Nu f\u00e5r du b\u00f6rja anv\u00e4nda samma enkla system f\u00f6r att hitta f\u00f6rsta duplication-signalen.",
      actionLabel: "Bjud in partner",
      actionMode: "copy-link" as const,
      helper: [
        "n\u00e5gon som gillar struktur",
        "n\u00e5gon som vill bygga stegvis",
        "n\u00e5gon som skulle uppskatta att slippa jaga folk",
      ],
      liveTitle: "Det h\u00e4r h\u00e4nder just nu",
      liveBody: partnerSignals > 0
        ? `Du har ${partnerSignals} partnerintresse${partnerSignals > 1 ? "n" : ""} i r\u00f6relse.`
        : `Du har ${customerSignals} kundsignal${customerSignals > 1 ? "er" : ""} i r\u00f6relse.`,
      liveMeta: "Nu \u00e4r du redo att bjuda in din f\u00f6rsta partner",
      nextLevelTitle: "N\u00e4sta niv\u00e5",
      nextLevelBody: "N\u00e4r du f\u00e5r f\u00f6rsta partnerkontakt eller f\u00f6rsta kund l\u00e5ser du upp n\u00e4sta dupliceringssteg.",
      momentum: "Bra jobbat. Nu bygger du p\u00e5 ett riktigt resultat.",
      shareMode: "duplicate" as const,
    };
  }

  return {
    level: 4,
    statusTitle: "Level 4 - Duplication",
    statusBody: "Nu \u00e4r du ig\u00e5ng p\u00e5 riktigt. Fokus ligger p\u00e5 att hj\u00e4lpa andra g\u00f6ra samma resa som du.",
    nextGoal: "N\u00e4sta m\u00e5l: fler signaler fr\u00e5n first line",
    actionTitle: "Hj\u00e4lp en partner till sin f\u00f6rsta signal idag",
    actionBody: "Nu vinner du genom att hj\u00e4lpa n\u00e5gon annan f\u00e5 fart, inte genom att bara producera mer sj\u00e4lv.",
    actionLabel: "\u00d6ppna leads",
    actionMode: "leads" as const,
    helper: [
      "v\u00e4lj en partner n\u00e4ra dig",
      "landa i ett enda n\u00e4sta steg",
      "skapa r\u00f6relse innan ni pratar teori",
    ],
    liveTitle: "Det h\u00e4r h\u00e4nder just nu",
    liveBody: "Det finns redan signaler i systemet. Nu g\u00e4ller det att h\u00e5lla rytmen levande.",
    liveMeta: "Systemet jobbar b\u00e4st n\u00e4r du upprepar det som redan fungerar",
    nextLevelTitle: "N\u00e4sta niv\u00e5",
    nextLevelBody: "N\u00e4sta steg \u00e4r att f\u00e5 fler i f\u00f6rsta linjen att uppleva samma enkla start.",
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
      setZzLinkStatus("Dina ZZ-l\u00e4nkar \u00e4r sparade.");
      await queryClient.invalidateQueries({ queryKey: ["partner-dashboard", partnerId] });
      await queryClient.invalidateQueries({ queryKey: ["admin-dashboard"] });
    },
    onError: (error) => {
      setZzLinkStatus(error instanceof Error ? error.message : "Kunde inte spara dina ZZ-l\u00e4nkar.");
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
      { label: "\u00d6versikt", href: "/dashboard/partner/overview", icon: dashboardIcons.dashboard },
      { label: "Leads", href: "/dashboard/partner/leads", icon: dashboardIcons.leads },
      { label: "L\u00e4nkar", href: "/dashboard/partner/links", icon: Link2 },
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
  const customerShareText = partnerLink
    ? `Hej! Jag testar just nu ett enkelt uppl\u00e4gg f\u00f6r m\u00e4tbar h\u00e4lsa. Om du vill kan du kika h\u00e4r n\u00e4r du har tv\u00e5 minuter: ${partnerLink}`
    : "";
  const partnerShareText = partnerLink
    ? `Hej! Jag testar just nu ett digitalt uppl\u00e4gg d\u00e4r man kan bygga stegvis utan att beh\u00f6va g\u00f6ra allt sj\u00e4lv fr\u00e5n start. Kika g\u00e4rna h\u00e4r n\u00e4r du har tv\u00e5 minuter om du vill se vad det handlar om: ${partnerLink}`
    : "";
  const shareText = firstActionEngine?.shareMode === "duplicate" ? partnerShareText : customerShareText;
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
              title: `Hj\u00e4lp ${data.team[0].partnerName} vidare`,
              summary: "Din n\u00e4rmaste first line ger st\u00f6rst h\u00e4vst\u00e5ng just nu om du h\u00e5ller st\u00f6det n\u00e4ra n\u00e4sta aktivitet.",
              action: "Ta ett kort avst\u00e4mningssamtal och landa i ett enda tydligt n\u00e4sta steg denna vecka.",
            }
          : null,
        {
          key: "up-line-support",
          title: data.sponsor ? `Ta st\u00f6d av ${data.sponsor.name}` : "Ta st\u00f6d av Omega Balance-teamet",
          summary: data.sponsor
            ? "N\u00e4r dialog eller uppf\u00f6ljning fastnar blir n\u00e4sta steg ofta l\u00e4ttare om du tar st\u00f6d upp\u00e5t tidigt."
            : "N\u00e4r du ligger n\u00e4ra toppen beh\u00f6ver du inte b\u00e4ra allt sj\u00e4lv. Ta st\u00f6d upp\u00e5t s\u00e5 fort n\u00e4sta steg blir oklart.",
          action: "Be om hj\u00e4lp i skarpa l\u00e4gen, helst kopplat till en verklig kontakt eller ett konkret n\u00e4sta steg.",
        },
        {
          key: "duplicate-rhythm",
          title: "Skydda dupliceringsrytmen",
          summary: "Duplicering b\u00f6rjar n\u00e4r du hj\u00e4lper n\u00e5gon annan till sitt f\u00f6rsta tydliga resultat, inte bara n\u00e4r du sj\u00e4lv producerar mer.",
          action: data.team.length
            ? "Fokusera p\u00e5 en person i taget i din first line tills ni f\u00e5tt f\u00f6rsta tydliga signalen d\u00e4r."
            : "N\u00e4r din f\u00f6rsta direkta partner kommer in, hj\u00e4lp den personen ig\u00e5ng innan du f\u00f6rs\u00f6ker bredda f\u00f6r mycket.",
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
        title: firstResultFocus?.title ?? startAction?.title ?? "N\u00e4sta steg",
        description: firstResultFocus?.reason ?? startAction?.description ?? journey?.nextBestAction ?? "",
        detail: firstResultFocus?.action ?? journey?.nextBestAction ?? startAction?.description ?? "",
        label: startAction?.label ?? "\u00d6ppna leads",
        mode: startAction?.mode ?? ("leads" as const),
      }
    : null;
  const followUpTargets = data
    ? prioritizedLeads.length
      ? prioritizedLeads.map((lead) => ({
          key: lead.id,
          name: lead.name,
          label: lead.type === "partner_lead" ? "Partnerlead" : "Kundlead",
          status: `${getLeadStatusLabel(lead.status)} - ${getLeadSituationLabel(lead)}`,
          action: getLeadNextAction(lead),
        }))
      : data.team[0]
        ? [
            {
              key: `team-${data.team[0].partnerId}`,
              name: data.team[0].partnerName,
              label: "Direkt partnerkontakt",
              status: "First line",
              action: "Ta en kort avst\u00e4mning och hj\u00e4lp personen till ett enda tydligt n\u00e4sta steg denna vecka.",
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
    message = "Bra. Du \u00e4r ig\u00e5ng.\n\nDin l\u00e4nk \u00e4r nu aktiv.\n\nN\u00e4sta steg \u00e4r f\u00f6rsta signal.\n\nVill du ta n\u00e4sta steg direkt: skicka den till 1 person du redan har kontakt med.",
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
      subtitle="Din egen vy \u00f6ver referral-l\u00e4nk, leads, kunder och direkta partnerkontakter. Bara det som h\u00f6r till dig visas h\u00e4r."
      roleLabel={isDemo ? "Partnerdemo" : "Partner"}
      navigation={navigation}
      onSignOut={isDemo ? undefined : () => void signOutPortalUser()}
    >
      <Dialog open={zzLinksOpen} onOpenChange={setZzLinksOpen}>
        <DialogContent className="max-w-2xl rounded-[1.75rem] border-border/70 bg-white/95 p-6 shadow-card md:p-7">
            <DialogHeader>
              <DialogTitle>Mina ZZ-l\u00e4nkar</DialogTitle>
              <DialogDescription>
                L\u00e4gg in dina riktiga Zinzino-l\u00e4nkar h\u00e4r. Just nu anv\u00e4nder vi test-, shop- och partnerl\u00e4nken i fl\u00f6det.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="partner-zz-test">Testl\u00e4nk</Label>
              <Input
                id="partner-zz-test"
                value={zzTestUrl}
                onChange={(event) => setZzTestUrl(event.target.value)}
                placeholder="https://..."
                className="rounded-xl"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="partner-zz-shop">Shopl\u00e4nk</Label>
              <Input
                id="partner-zz-shop"
                value={zzShopUrl}
                onChange={(event) => setZzShopUrl(event.target.value)}
                placeholder="https://..."
                className="rounded-xl"
              />
            </div>

              <div className="grid gap-2">
                <Label htmlFor="partner-zz-partner">Partnerl\u00e4nk</Label>
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
              {zzLinkStatus ? zzLinkStatus : "Du kan uppdatera l\u00e4nkarna sj\u00e4lv n\u00e4r dina Zinzino-destinationer \u00e4ndras."}
            </div>
            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={() => setZzLinksOpen(false)}>
                St\u00e4ng
              </Button>
              <Button type="button" onClick={() => zzLinksMutation.mutate()} disabled={zzLinksMutation.isPending}>
                {zzLinksMutation.isPending ? "Sparar..." : "Spara l\u00e4nkar"}
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
              Du ser just nu partnerns vy i f\u00f6rhandsl\u00e4ge som admin.
            </div>
          ) : null}

          {showOverview && journey ? (
            <DashboardSection
              title="Din Fast Start"
              description="Dina f\u00f6rsta 120 dagar ska k\u00e4nnas som en guidande partnerresa, inte som hela kompplanen p\u00e5 en g\u00e5ng."
            >
              <div className="grid gap-4 xl:grid-cols-12">
                <div className="rounded-[1.2rem] border border-primary/20 bg-white p-4 shadow-card sm:p-5 xl:col-span-6">
                  <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">G\u00f6r detta nu</p>
                  <p className="mt-3 text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
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
                      {firstActionEngine?.actionLabel ?? "Kopiera min l\u00e4nk"}
                    </Button>
                    <p className="mt-3 text-sm text-subtle">B\u00f6rja med 1 person du redan har kontakt med.</p>
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
                        {actionFeedback ? "Steg 1 klart" : "V\u00e4ntar"}
                      </Badge>
                    </div>
                    <div className="mt-3 flex items-start gap-3">
                      <div className={`mt-0.5 shrink-0 rounded-full ${actionFeedback ? "text-emerald-600" : "text-muted-foreground"}`}>
                        <CheckCircle2 className={`h-5 w-5 ${actionFeedback ? "" : "opacity-45"}`} />
                      </div>
                      <div className="space-y-2">
                      {(actionFeedback ?? "N\u00e4r du kopierar eller delar l\u00e4nken f\u00e5r du direkt kvitto p\u00e5 att du faktiskt har startat n\u00e5got.").split("\n\n").map((line) => (
                        <p key={line} className={`text-sm ${line === "Bra. Du \u00e4r ig\u00e5ng." ? "font-medium text-foreground" : "text-subtle"}`}> 
                          {line}
                        </p>
                      ))}
                      </div>
                    </div>
                  </div>
                  <details className="mt-3 rounded-[1rem] border border-border/70 bg-white/80 p-3.5">
                    <summary className="cursor-pointer list-none text-sm font-medium text-foreground">
                      Fler s\u00e4tt att dela
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
                          markActionStarted("Bra. Du \u00e4r ig\u00e5ng.\n\nDitt meddelande \u00e4r nu klart att klistra in i Messenger.\n\nN\u00e4sta steg \u00e4r f\u00f6rsta signal.\n\nSkicka det till 1 person du redan har kontakt med.");
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
                  <details className="mt-3 rounded-[1rem] border border-border/70 bg-white/80 p-3.5 md:hidden">
                    <summary className="cursor-pointer list-none text-sm font-medium text-foreground">
                      F\u00e4rdiga texter att skicka
                    </summary>
                    <div className="mt-3 grid gap-3">
                      <div className="rounded-[1rem] border border-border/70 bg-white/80 p-3.5">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">F\u00e4rdig kundtext</p>
                            <p className="mt-1 text-sm font-medium text-foreground">N\u00e4r du vill skicka l\u00e4nken till n\u00e5gon som kan vara nyfiken p\u00e5 testet</p>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            className="h-8 rounded-lg px-3 text-sm"
                            onClick={() => {
                              void navigator.clipboard.writeText(customerShareText);
                              markActionStarted("Bra. Du \u00e4r ig\u00e5ng.\n\nDin kundtext \u00e4r nu kopierad.\n\nN\u00e4sta steg \u00e4r f\u00f6rsta signal.\n\nSkicka den till 1 person du redan har kontakt med.");
                            }}
                          >
                            <Copy className="mr-2 h-3.5 w-3.5" />
                            Kopiera
                          </Button>
                        </div>
                        <div className="mt-3 rounded-[0.9rem] border border-border/60 bg-secondary/20 p-3 text-sm leading-6 text-foreground/85">
                          {customerShareText}
                        </div>
                      </div>
                      <div className="rounded-[1rem] border border-border/70 bg-white/80 p-3.5">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">F\u00e4rdig partnertext</p>
                            <p className="mt-1 text-sm font-medium text-foreground">N\u00e4r du vill visa modellen f\u00f6r n\u00e5gon som kan vilja bygga vidare</p>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            className="h-8 rounded-lg px-3 text-sm"
                            onClick={() => {
                              void navigator.clipboard.writeText(partnerShareText);
                              markActionStarted("Bra. Du \u00e4r ig\u00e5ng.\n\nDin partnertext \u00e4r nu kopierad.\n\nN\u00e4sta steg \u00e4r f\u00f6rsta signal.\n\nSkicka den till 1 person du redan har kontakt med.");
                            }}
                          >
                            <Copy className="mr-2 h-3.5 w-3.5" />
                            Kopiera
                          </Button>
                        </div>
                        <div className="mt-3 rounded-[0.9rem] border border-border/60 bg-secondary/20 p-3 text-sm leading-6 text-foreground/85">
                          {partnerShareText}
                        </div>
                      </div>
                    </div>
                  </details>
                  <div className="mt-3 hidden gap-3 md:grid lg:grid-cols-2">
                    <div className="rounded-[1rem] border border-border/70 bg-white/80 p-3.5">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">F\u00e4rdig kundtext</p>
                          <p className="mt-1 text-sm font-medium text-foreground">N\u00e4r du vill skicka l\u00e4nken till n\u00e5gon som kan vara nyfiken p\u00e5 testet</p>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          className="h-8 rounded-lg px-3 text-sm"
                          onClick={() => {
                            void navigator.clipboard.writeText(customerShareText);
                            markActionStarted("Bra. Du \u00e4r ig\u00e5ng.\n\nDin kundtext \u00e4r nu kopierad.\n\nN\u00e4sta steg \u00e4r f\u00f6rsta signal.\n\nSkicka den till 1 person du redan har kontakt med.");
                          }}
                        >
                          <Copy className="mr-2 h-3.5 w-3.5" />
                          Kopiera
                        </Button>
                      </div>
                      <div className="mt-3 rounded-[0.9rem] border border-border/60 bg-secondary/20 p-3 text-sm leading-6 text-foreground/85">
                        {customerShareText}
                      </div>
                    </div>
                    <div className="rounded-[1rem] border border-border/70 bg-white/80 p-3.5">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">F\u00e4rdig partnertext</p>
                          <p className="mt-1 text-sm font-medium text-foreground">N\u00e4r du vill visa modellen f\u00f6r n\u00e5gon som kan vilja bygga vidare</p>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          className="h-8 rounded-lg px-3 text-sm"
                          onClick={() => {
                            void navigator.clipboard.writeText(partnerShareText);
                            markActionStarted("Bra. Du \u00e4r ig\u00e5ng.\n\nDin partnertext \u00e4r nu kopierad.\n\nN\u00e4sta steg \u00e4r f\u00f6rsta signal.\n\nSkicka den till 1 person du redan har kontakt med.");
                          }}
                        >
                          <Copy className="mr-2 h-3.5 w-3.5" />
                          Kopiera
                        </Button>
                      </div>
                      <div className="mt-3 rounded-[0.9rem] border border-border/60 bg-secondary/20 p-3 text-sm leading-6 text-foreground/85">
                        {partnerShareText}
                      </div>
                    </div>
                  </div>
                </div>

                <details className="rounded-[1.2rem] border border-border/70 bg-secondary/25 p-4 xl:hidden">
                  <summary className="cursor-pointer list-none text-sm font-medium text-foreground">
                    Mer \u00f6verblick
                  </summary>
                  <div className="mt-4 grid gap-4">
                    <div className="rounded-[1rem] border border-border/70 bg-white/80 p-3.5">
                      <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Din status</p>
                      <p className="mt-2 text-base font-semibold text-foreground">{firstActionEngine?.statusTitle ?? fastStartJourney?.currentTitle}</p>
                      <p className="mt-2 text-sm leading-6 text-subtle">{firstActionEngine?.statusBody ?? fastStartJourney?.currentFocus ?? journey.summary}</p>
                    </div>
                    <div className="rounded-[1rem] border border-border/70 bg-white/80 p-3.5">
                      <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">{firstActionEngine?.liveTitle ?? "Det h\u00e4r h\u00e4nder just nu"}</p>
                      <p className="mt-2 text-sm font-medium text-foreground">
                        {actionFeedback && (!data.metrics.clicks || data.metrics.clicks === 0)
                          ? "V\u00e4ntar p\u00e5 f\u00f6rsta signal..."
                          : firstActionEngine?.liveBody ?? "S\u00e5 fort f\u00f6rsta signalen kommer syns den h\u00e4r."}
                      </p>
                      <p className="mt-2 text-xs text-subtle">
                        {actionFeedback && (!data.metrics.clicks || data.metrics.clicks === 0)
                          ? "Du \u00e4r n\u00e4ra f\u00f6rsta resultatet."
                          : firstActionEngine?.liveMeta ?? "Du \u00e4r n\u00e4ra ditt f\u00f6rsta resultat"}
                      </p>
                    </div>
                    <div className="rounded-[1rem] border border-border/70 bg-white/80 p-3.5">
                      <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">{firstActionEngine?.nextLevelTitle ?? "N\u00e4sta niv\u00e5"}</p>
                      <p className="mt-2 text-base font-semibold text-foreground">
                        {firstActionEngine?.level === 3 ? "Nu \u00e4r du redo f\u00f6r duplication" : "Ett steg till \u00f6ppnar n\u00e4sta niv\u00e5"}
                      </p>
                      <p className="mt-2 text-sm leading-6 text-subtle">{firstActionEngine?.nextLevelBody ?? journey.nextBestAction}</p>
                    </div>
                  </div>
                </details>

                <div className="hidden rounded-[1.2rem] border border-border/70 bg-secondary/25 p-4 xl:col-span-2 xl:block">
                  <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Din status</p>
                  <p className="mt-3 text-lg font-semibold text-foreground">{firstActionEngine?.statusTitle ?? fastStartJourney?.currentTitle}</p>
                  <p className="mt-2 text-sm leading-6 text-subtle">{firstActionEngine?.statusBody ?? fastStartJourney?.currentFocus ?? journey.summary}</p>
                  <div className="mt-4 rounded-[1rem] border border-border/70 bg-white/80 p-3.5">
                    <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Momentum</p>
                    <p className="mt-2 text-sm text-foreground">{firstActionEngine?.momentum ?? fastStartJourney?.momentumMessage ?? journey.encouragement}</p>
                  </div>
                  <div className="mt-3 rounded-[1rem] border border-border/70 bg-white/80 p-3.5">
                    <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">N\u00e4sta m\u00e5l</p>
                    <p className="mt-2 text-sm text-foreground">{firstActionEngine?.nextGoal ?? journey.nextMilestone}</p>
                  </div>
                </div>

                <div className="hidden rounded-[1.2rem] border border-border/70 bg-white/90 p-4 xl:col-span-2 xl:block">
                  <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">{firstActionEngine?.liveTitle ?? "Det h\u00e4r h\u00e4nder just nu"}</p>
                  <div className="mt-3 space-y-3">
                    <div className={`rounded-[1rem] border p-3.5 ${actionFeedback && (!data.metrics.clicks || data.metrics.clicks === 0) ? "border-amber-300/70 bg-amber-50/70" : "border-border/70 bg-secondary/20"}`}>
                      <p className="text-sm font-medium text-foreground">
                        {actionFeedback && (!data.metrics.clicks || data.metrics.clicks === 0)
                          ? "V\u00e4ntar p\u00e5 f\u00f6rsta signal..."
                          : firstActionEngine?.liveBody ?? "S\u00e5 fort f\u00f6rsta signalen kommer syns den h\u00e4r."}
                      </p>
                      <p className="mt-2 text-xs text-subtle">
                        {actionFeedback && (!data.metrics.clicks || data.metrics.clicks === 0)
                          ? "Du \u00e4r n\u00e4ra f\u00f6rsta resultatet."
                          : firstActionEngine?.liveMeta ?? "Du \u00e4r n\u00e4ra ditt f\u00f6rsta resultat"}
                      </p>
                      {actionFeedback && (!data.metrics.clicks || data.metrics.clicks === 0) ? (
                        <div className="mt-3 rounded-[0.85rem] border border-amber-300/70 bg-white/80 px-3 py-2 text-xs text-amber-950">
                          Din del \u00e4r gjord. N\u00e4sta win \u00e4r att n\u00e5gon klickar eller svarar.
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

                <div className="hidden rounded-[1.2rem] border border-border/70 bg-white/90 p-4 xl:col-span-2 xl:block">
                  <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">{firstActionEngine?.nextLevelTitle ?? "N\u00e4sta niv\u00e5"}</p>
                  <p className="mt-3 text-lg font-semibold text-foreground">
                    {firstActionEngine?.level === 3 ? "Nu \u00e4r du redo f\u00f6r duplication" : "Ett steg till \u00f6ppnar n\u00e4sta niv\u00e5"}
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
                      <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Stegvis v\u00e4g fram\u00e5t</p>
                      <p className="mt-2 text-lg font-semibold text-foreground">En sak i taget. N\u00e4r ett steg \u00e4r klart \u00f6ppnas n\u00e4sta niv\u00e5.</p>
                      <p className="mt-2 text-sm leading-6 text-subtle">
                        Vi visar inte allt p\u00e5 en g\u00e5ng. Fokus \u00e4r att du ska f\u00f6rst\u00e5 vad som \u00e4r viktigast nu och k\u00e4nna momentum n\u00e4r du g\u00e5r vidare.
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
                            {step.status === "done" ? "Klar" : step.status === "current" ? "P\u00e5g\u00e5r nu" : "N\u00e4sta niv\u00e5"}
                          </Badge>
                        </div>
                        <p className="mt-3 text-sm leading-6 text-subtle">{step.description}</p>
                        <div className="mt-3 rounded-[0.9rem] border border-border/70 bg-white/80 p-3">
                          <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Detta \u00e4r m\u00e5let</p>
                          <p className="mt-2 text-sm text-foreground">{step.target}</p>
                        </div>
                        <div className="mt-3 rounded-[0.9rem] border border-border/70 bg-white/80 p-3">
                          <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">N\u00e4r det \u00e4r klart</p>
                          <p className="mt-2 text-sm text-foreground">{step.reward}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              <div className="mt-4 grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
                <div className="rounded-[1.2rem] border border-border/70 bg-white p-4">
                  <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Progress mot f\u00f6rsta resultat</p>
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
                      Visa mer st\u00f6d och \u00f6verblick
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
                          <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">St\u00f6d f\u00f6r f\u00f6rsta linjen</p>
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
              title="Snabb\u00e5tg\u00e4rder"
              description="Tre snabba v\u00e4gar n\u00e4r du vill agera direkt."
            >
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <div className="flex h-full flex-col justify-between rounded-[1.1rem] border border-border/70 bg-white/95 p-4 shadow-card">
                  <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Dela Omega-l\u00e4nken</p>
                  <p className="mt-2 text-sm leading-6 text-subtle">
                    N\u00e4r grunden \u00e4r klar \u00e4r detta l\u00e4nken du anv\u00e4nder f\u00f6r att skapa ny r\u00f6relse.
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    className="mt-3 inline-flex h-8 max-w-full self-start whitespace-normal rounded-lg px-3 text-sm leading-tight"
                    onClick={() => navigator.clipboard.writeText(partnerLink)}
                  >
                    <Copy className="mr-2 h-3.5 w-3.5 shrink-0" />
                    Kopiera l\u00e4nk
                  </Button>
                </div>

                <div className="flex h-full flex-col justify-between rounded-[1.1rem] border border-border/70 bg-white/95 p-4 shadow-card">
                  <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Se ZZ-l\u00e4nkar</p>
                  <p className="mt-2 text-sm leading-6 text-subtle">
                    B\u00f6rja h\u00e4r om dina test-, shop- eller partnerl\u00e4nkar saknas.
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    className="mt-3 inline-flex h-8 max-w-full self-start whitespace-normal rounded-lg px-3 text-sm leading-tight"
                    onClick={openZzLinksDialog}
                  >
                    Redigera mina l\u00e4nkar
                  </Button>
                </div>

                <div className="flex h-full flex-col justify-between rounded-[1.1rem] border border-border/70 bg-white/95 p-4 shadow-card">
                  <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Arbeta med leads</p>
                  <p className="mt-2 text-sm leading-6 text-subtle">
                    G\u00e5 hit n\u00e4r du redan har signaler i g\u00e5ng och vill f\u00f6lja upp dem vidare.
                  </p>
                  <Button asChild type="button" variant="outline" className="mt-3 inline-flex h-8 max-w-full self-start whitespace-normal rounded-lg px-3 text-sm leading-tight">
                    <Link to="/dashboard/partner/leads">\u00d6ppna mina leads</Link>
                  </Button>
                </div>
              </div>
            </DashboardSection>
          ) : null}

          {showJourney ? (
            <DashboardSection
              title="Din resa"
              description="Du beh\u00f6ver inte kunna allt fr\u00e5n start. H\u00e4r ser du v\u00e4gen fram\u00e5t, steg f\u00f6r steg, s\u00e5 att du vet vad som \u00e4r viktigast nu och vad som kommer senare."
            >
              <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
                <div className="rounded-[1.2rem] border border-border/70 bg-secondary/30 p-5">
                  <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Nu</p>
                  <p className="mt-3 text-2xl font-semibold tracking-tight text-foreground">Kom ig\u00e5ng</p>
                  <p className="mt-2 text-sm leading-6 text-subtle">
                    Det h\u00e4r \u00e4r f\u00f6rsta fasen. M\u00e5let \u00e4r att f\u00e5 grunden p\u00e5 plats och skapa f\u00f6rsta r\u00f6relsen utan att t\u00e4nka p\u00e5 allt annat samtidigt.
                  </p>
                  <div className="mt-4 space-y-2.5">
                    {[
                      "f\u00e5 ordning p\u00e5 dina l\u00e4nkar",
                      "f\u00f6rst\u00e5 vad du delar",
                      "skicka din l\u00e4nk f\u00f6rsta g\u00e5ngen",
                      "f\u00e5 f\u00f6rsta signalen",
                    ].map((item) => (
                      <div key={item} className="rounded-[1rem] border border-border/70 bg-white/80 px-3.5 py-3">
                        <p className="text-sm text-foreground">{item}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 rounded-[1rem] border border-emerald-300/70 bg-emerald-50 p-3.5">
                    <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Status</p>
                    <p className="mt-2 text-sm font-medium text-foreground">P\u00e5g\u00e5r nu</p>
                    <p className="mt-2 text-sm text-subtle">Det h\u00e4r steget l\u00e5ser upp f\u00f6rsta riktiga resultatet.</p>
                  </div>
                </div>

                <div className="grid gap-4">
                  {[
                    {
                      eyebrow: "\u00d6ppnas snart",
                      title: "F\u00f6rsta resultat",
                      body: "N\u00e4r du f\u00e5tt f\u00f6rsta signalen handlar n\u00e4sta fas om att skapa f\u00f6rsta riktiga utfallet och upprepa det som fungerade.",
                      items: [
                        "f\u00e5 f\u00f6rsta lead eller kundsignal",
                        "se vad som faktiskt fungerar",
                        "upprepa samma beteende en g\u00e5ng till",
                        "bygga tro p\u00e5 att systemet fungerar",
                      ],
                      note: "Det h\u00e4r steget g\u00f6r att du g\u00e5r fr\u00e5n aktivitet till resultat.",
                    },
                    {
                      eyebrow: "N\u00e4sta niv\u00e5",
                      title: "B\u00f6rja duplicera",
                      body: "N\u00e4r du sj\u00e4lv f\u00e5tt r\u00f6relse \u00e4r n\u00e4sta steg att hj\u00e4lpa n\u00e5gon annan komma ig\u00e5ng p\u00e5 samma s\u00e4tt.",
                      items: [
                        "bjuda in r\u00e4tt person",
                        "hj\u00e4lpa n\u00e5gon till sitt f\u00f6rsta steg",
                        "skapa f\u00f6rsta signalen i din n\u00e4rmaste linje",
                        "bygga n\u00e5got som g\u00e5r att upprepa",
                      ],
                      note: "Det h\u00e4r \u00e4r d\u00e4r systemet b\u00f6rjar v\u00e4xa genom andra, inte bara genom dig.",
                    },
                    {
                      eyebrow: "Senare",
                      title: "Bygg vidare",
                      body: "Senare \u00f6ppnas mer av aff\u00e4ren och modellen upp, i takt med att det faktiskt blir relevant f\u00f6r dig.",
                      items: [
                        "kundmotor",
                        "teamrytmer",
                        "fler niv\u00e5er",
                        "kompplan och djupare f\u00f6rst\u00e5else",
                        "hur du bygger l\u00e5ngsiktigt utan att g\u00f6ra allt sj\u00e4lv",
                      ],
                      note: "Du beh\u00f6ver inte b\u00e4ra allt nu. Det h\u00e4r \u00f6ppnas n\u00e4r du \u00e4r redo.",
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
                  Du beh\u00f6ver inte ta alla steg i huvudet samtidigt. Det viktiga \u00e4r att ta r\u00e4tt n\u00e4sta steg nu.
                </p>
              </div>
            </DashboardSection>
          ) : null}

          {showLinks ? (
            <DashboardSection
              title="Min Omega-l\u00e4nk"
              description="L\u00e4nken du normalt delar vidare."
            >
              <div className="flex flex-col gap-4 rounded-[1.2rem] border border-border/70 bg-secondary/40 p-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">L\u00e4nken du delar</p>
                  <p className="mt-2 break-all font-medium text-foreground">{partnerLink}</p>
                  <p className="mt-2 text-sm leading-6 text-subtle">
                    Anv\u00e4nd den h\u00e4r l\u00e4nken i f\u00f6rsta hand. Vi skickar vidare till r\u00e4tt Zinzino-l\u00e4nk i bakgrunden.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  className="h-8 rounded-lg px-3 text-sm"
                  onClick={() => navigator.clipboard.writeText(partnerLink)}
                >
                  <Copy className="mr-2 h-3.5 w-3.5" />
                  Kopiera l\u00e4nk
                </Button>
              </div>
            </DashboardSection>
          ) : null}

          {showLinks ? (
            <DashboardSection
              title="Mina ZZ-l\u00e4nkar"
              description="Dina personliga destinationsl\u00e4nkar till Zinzino."
            >
              <div className="mb-4 flex items-center justify-between gap-3 rounded-[1.1rem] border border-border/70 bg-secondary/30 p-4">
                <p className="text-sm leading-6 text-subtle">
                  L\u00e4gg in och uppdatera dina egna test-, shop- och partnerl\u00e4nkar h\u00e4r.
                </p>
                <Button type="button" variant="outline" className="h-8 rounded-lg px-3 text-sm" onClick={openZzLinksDialog}>
                  Redigera mina l\u00e4nkar
                </Button>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {[
                  { label: "Testl\u00e4nk", value: data.zzLinks.test },
                  { label: "Shopl\u00e4nk", value: data.zzLinks.shop },
                  { label: "Partnerl\u00e4nk", value: data.zzLinks.partner },
                ].map((linkItem) => (
                  <div key={linkItem.label} className="rounded-[1.1rem] border border-border/70 bg-white/95 p-4 shadow-card">
                    <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">{linkItem.label}</p>
                  {linkItem.value ? (
                      <>
                        <p className="mt-3 break-all text-sm text-foreground">{linkItem.value}</p>
                        <p className="mt-2 text-xs leading-5 text-subtle">
                          Detta \u00e4r din bakomliggande Zinzino-l\u00e4nk. Dela normalt din Omega-l\u00e4nk ovan och anv\u00e4nd denna n\u00e4r du beh\u00f6ver g\u00e5 direkt.
                        </p>
                        <Button
                          type="button"
                          variant="outline"
                          className="mt-3 h-8 rounded-lg px-3 text-sm"
                          onClick={() => navigator.clipboard.writeText(linkItem.value as string)}
                        >
                          <Copy className="mr-2 h-3.5 w-3.5" />
                          Kopiera l\u00e4nk
                        </Button>
                      </>
                    ) : (
                      <p className="mt-3 text-sm leading-6 text-subtle">
                        Ingen l\u00e4nk sparad \u00e4nnu. L\u00e4gg in den via knappen ovan.
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </DashboardSection>
          ) : null}

          {showOverview ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <MetricCard label="Mina leads" value={data.metrics.leads} helper="Alla leads d\u00e4r du \u00e4r attribuerad partner." icon={<Link2 className="h-5 w-5" />} />
              <MetricCard label="Partnerleads" value={data.metrics.partnerLeads} helper="Nya intresseanm\u00e4lningar f\u00f6r partnerskap." icon={<UserPlus2 className="h-5 w-5" />} />
              <MetricCard label="Mina kunder" value={data.metrics.customers} helper="Kunder som hittills kopplats till dig." icon={<Users className="h-5 w-5" />} />
              <MetricCard label="Direkta kontakter" value={data.metrics.directPartners} helper="Direkta partnerkontakter som kommit in via dig." icon={<Users className="h-5 w-5" />} />
            </div>
          ) : null}

          {showLeads ? (
            <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
              <DashboardSection title="Mina leads" description="B\u00e5de kundleads och partnerleads sparas med din attribution.">
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
                    { value: "urgent", label: "Br\u00e5dskande" },
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
                  columns={["Namn", "Typ", "L\u00e4ge", "Br\u00e5dskande", "N\u00e4sta steg", "Senast aktiv"]}
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
                    <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Ta f\u00f6rst bland kundleads</p>
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
                      <p className="text-sm text-subtle">Inga kundleads \u00e4nnu. Fokusera f\u00f6rst p\u00e5 att skapa f\u00f6rsta kundsignalen.</p>
                    )}
                  </div>
                </div>
              </DashboardSection>

              {showLeads ? (
                <DashboardSection title="F\u00f6rst att f\u00f6lja upp" description="Systemet lyfter de leads som just nu \u00e4r mest relevanta f\u00f6r att f\u00e5 f\u00f6rsta r\u00f6relse eller f\u00f6rsta resultat.">
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
                                Br\u00e5dskande: {getLeadUrgencyLabel(lead)}
                              </Badge>
                            </div>
                            <p className="mt-3 text-sm text-foreground">{getLeadNextAction(lead)}</p>
                            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-subtle">
                              <span>{lead.type === "partner_lead" ? "Partnerlead" : "Kundlead"}</span>
                          <span>-</span>
                              <span>{formatDate(lead.updated_at || lead.created_at)}</span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="rounded-[1rem] border border-border/70 bg-white/85 p-3.5">
                          <p className="text-sm text-subtle">Inga prioriterade leads \u00e4nnu. Fokusera f\u00f6rst p\u00e5 att skapa din f\u00f6rsta signal.</p>
                          <Button
                            type="button"
                            variant="outline"
                            className="mt-3 h-8 rounded-lg px-3 text-sm"
                            onClick={() => navigator.clipboard.writeText(partnerLink)}
                          >
                            <Copy className="mr-2 h-3.5 w-3.5" />
                            Kopiera Omega-l\u00e4nken
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
              description="H\u00e4r ser du var din trafik faktiskt visar liv just nu. Det hj\u00e4lper dig f\u00f6rst\u00e5 vilka marknader som svarar p\u00e5 din l\u00e4nk."
            >
              <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-[0.9fr_0.9fr_1.2fr]">
                <div className="rounded-[1.2rem] border border-border/70 bg-secondary/20 p-4">
                  <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Toppl\u00e4nder</p>
                  <div className="mt-3 space-y-2">
                    {(data.marketInsights?.topCountries || []).map((row) => (
                      <div key={`partner-country-${row.label}`} className="flex items-center justify-between gap-3 text-sm">
                        <span className="truncate text-foreground">{row.label}</span>
                        <span className="font-medium text-foreground">{formatWholeNumber(row.visits)}</span>
                      </div>
                    ))}
                    {!data.marketInsights?.topCountries?.length ? <p className="text-sm text-subtle">Ingen marknadssignal \u00e4n.</p> : null}
                  </div>
                </div>

                <div className="rounded-[1.2rem] border border-border/70 bg-secondary/20 p-4">
                  <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Toppst\u00e4der</p>
                  <div className="mt-3 space-y-2">
                    {(data.marketInsights?.topCities || []).map((row) => (
                      <div key={`partner-city-${row.label}`} className="flex items-center justify-between gap-3 text-sm">
                        <span className="truncate text-foreground">{row.label}</span>
                        <span className="font-medium text-foreground">{formatWholeNumber(row.visits)}</span>
                      </div>
                    ))}
                    {!data.marketInsights?.topCities?.length ? <p className="text-sm text-subtle">Ingen stadsdata \u00e4n.</p> : null}
                  </div>
                </div>

                <div className="rounded-[1.2rem] border border-border/70 bg-white/95 p-4 shadow-card lg:col-span-2 xl:col-span-1">
                  <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Senaste geotr\u00e4ffar</p>
                  <div className="mt-4">
                    <DataTable
                      columns={["Senast", "Land", "Stad"]}
                      rows={(data.marketInsights?.recentLocations || []).map((row) => [
                        <span key={`${row.created_at}-time`} className="font-medium text-foreground">{formatDate(row.created_at)}</span>,
                        <span key={`${row.created_at}-country`}>{row.country || "-"}</span>,
                        <span key={`${row.created_at}-city`}>{row.city || "-"}</span>,
                      ])}
                      emptyState="Ingen geodata registrerad f\u00f6r din trafik \u00e4nnu."
                    />
                  </div>
                  <div className="mt-4 rounded-[1rem] border border-border/70 bg-secondary/20 p-3.5 text-sm text-subtle">
                    Land \u00e4r oftast s\u00e4krare \u00e4n stad. Se stad som signal, inte exakt sanning.
                  </div>
                </div>
              </div>
            </DashboardSection>
          ) : null}

          {showCustomers ? (
            <DashboardSection title="Kundsignaler" description="Kundrelationer som hittills kopplats till dig via systemet. Detta \u00e4r inte officiell ZZ-utbetalning eller kompensation.">
              <div className="rounded-[1.2rem] border border-border/70 bg-accent/50 p-4">
                <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Attribuerade kunder</p>
                <p className="mt-3 font-serif text-4xl font-semibold tracking-tight text-foreground">
                  {new Intl.NumberFormat("sv-SE", { maximumFractionDigits: 0 }).format(data.customers.length)}
                </p>
                <p className="mt-2 text-sm leading-6 text-subtle">
                  Tidiga kommersiella signaler runt ditt fl\u00f6de, inte payout eller bonus.
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
                  emptyState="Inga attribuerade kunder \u00e4nnu."
                />
              </div>
            </DashboardSection>
          ) : null}

          {showLeads || showNetwork ? (
            <div className="grid gap-8 lg:grid-cols-2">
              {showLeads ? (
                <DashboardSection title="Mina partnerleads" description="H\u00e4r ser du partnerintresse och vad du b\u00f6r g\u00f6ra h\u00e4rn\u00e4st.">
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
                      { value: "urgent", label: "Br\u00e5dskande" },
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
                    columns={["S\u00f6kande", "K\u00e4lla", "L\u00e4ge", "Br\u00e5dskande", "N\u00e4sta steg", "Senast aktiv"]}
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
                    <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Ta f\u00f6rst bland partnerleads</p>
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
                        <p className="text-sm text-subtle">Inga partnerleads \u00e4nnu. Fokusera f\u00f6rst p\u00e5 att skapa f\u00f6rsta partnersignalen.</p>
                      )}
                    </div>
                  </div>
                </DashboardSection>
              ) : null}

              {showNetwork ? (
                <DashboardSection title="Direkta partnerkontakter" description="Personer du har bjudit in eller f\u00e5tt in i ditt n\u00e4rmaste partnerled. Sj\u00e4lva placeringen och ranken hanteras i Zinzino.">
                  <div className="mb-4 grid gap-3 lg:grid-cols-2">
                    <div className="rounded-[1.1rem] border border-border/70 bg-secondary/20 p-4">
                      <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Vem hj\u00e4lper dig nu</p>
                      {data.sponsor ? (
                        <>
                          <p className="mt-3 text-sm font-medium text-foreground">{data.sponsor.name}</p>
                          <p className="mt-1 text-sm text-subtle">{data.sponsor.email}</p>
                          <p className="mt-3 text-sm leading-6 text-subtle">
                            Om du fastnar i n\u00e4sta steg ska du i f\u00f6rsta hand ta hj\u00e4lp av din n\u00e4rmaste up-line.
                          </p>
                        </>
                      ) : (
                        <p className="mt-3 text-sm leading-6 text-subtle">
                          Du ligger n\u00e4ra toppen i den h\u00e4r modellen. Det betyder att st\u00f6det upp\u00e5t fr\u00e4mst kommer direkt fr\u00e5n Omega Balance-teamet.
                        </p>
                      )}
                    </div>

                    <div className="rounded-[1.1rem] border border-border/70 bg-secondary/20 p-4">
                      <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Vem ska du hj\u00e4lpa nu</p>
                      {data.team.length ? (
                        <>
                          <p className="mt-3 text-sm font-medium text-foreground">{data.team[0].partnerName}</p>
                          <p className="mt-1 text-sm text-subtle">{data.team[0].email}</p>
                          <p className="mt-3 text-sm leading-6 text-subtle">
                            B\u00f6rja med din n\u00e4rmaste downline och hj\u00e4lp den personen till sitt f\u00f6rsta tydliga steg innan du breddar st\u00f6det.
                          </p>
                        </>
                      ) : (
                        <p className="mt-3 text-sm leading-6 text-subtle">
                          N\u00e4r du f\u00e5r in din f\u00f6rsta direkta partner b\u00f6rjar dupliceringen h\u00e4r. D\u00e5 \u00e4r n\u00e4sta steg att hj\u00e4lpa den personen ig\u00e5ng.
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
                    columns={["Partner", "Niv\u00e5", "Tillagd"]}
                    rows={data.team.map((member) => [
                      <div key={`${member.partnerId}-member`}>
                        <p className="font-medium text-foreground">{member.partnerName}</p>
                        <p className="text-xs text-subtle">{member.email}</p>
                      </div>,
                      <Badge key={`${member.partnerId}-level`} variant="secondary" className="rounded-full px-3 py-1">
                        Niv\u00e5 {member.level}
                      </Badge>,
                      <span key={`${member.partnerId}-joined`}>{formatDate(member.createdAt)}</span>,
                    ])}
                    emptyState="Inga direkta partnerkontakter \u00e4nnu."
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
