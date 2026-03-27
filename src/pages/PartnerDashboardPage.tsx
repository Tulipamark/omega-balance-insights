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
      return "BehÃƒÂ¶ver kontakt";
    case "qualified":
      return "FÃƒÂ¶lj upp nu";
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
      return "Ta fÃƒÂ¶rsta kontakt i dag.";
    case "qualified":
      return "FÃƒÂ¶lj upp medan signalen fortfarande ÃƒÂ¤r varm.";
    case "active":
      return lead.type === "partner_lead"
        ? "HÃƒÂ¥ll dialogen levande och fÃƒÂ¶rsÃƒÂ¶k boka nÃƒÂ¤sta steg."
        : "FÃƒÂ¶r dialogen vidare mot test, order eller tydligt beslut.";
    case "inactive":
      return "Parkera tillfÃƒÂ¤lligt och ta ny kontakt vid rÃƒÂ¤tt lÃƒÂ¤ge.";
    case "won":
      return "Bygg vidare pÃƒÂ¥ det som fungerade och skapa nÃƒÂ¤sta resultat.";
    case "lost":
      return "LÃƒÂ¤gg ingen energi hÃƒÂ¤r just nu.";
    default:
      return "BestÃƒÂ¤m nÃƒÂ¤sta tydliga steg.";
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
      return "StÃƒÂ¤ngd";
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
      return "HÃƒÂ¶g";
    case "active":
      return "Nu";
    case "inactive":
      return "LÃƒÂ¥g";
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
      title: "BekrÃƒÂ¤fta grunden",
      description: "GodkÃƒÂ¤nn portalvillkor och integritet innan du gÃƒÂ¥r vidare.",
      mode: "legal" as const,
      label: "Ãƒâ€“ppna legal",
    };
  }

  if (!hasRequiredZzLinks(data)) {
    return {
      title: "LÃƒÂ¤gg in dina ZZ-lÃƒÂ¤nkar",
      description: "Test-, shop- och partnerlÃƒÂ¤nk behÃƒÂ¶ver finnas pÃƒÂ¥ plats innan du bÃƒÂ¶rjar arbeta externt.",
      mode: "links" as const,
      label: "Ãƒâ€“ppna lÃƒÂ¤nkar",
    };
  }

  if (data.leads.length === 0 && data.partnerLeads.length === 0 && data.customers.length === 0 && data.metrics.directPartners === 0) {
    return {
      title: "Skapa fÃƒÂ¶rsta signalen",
      description: "NÃƒÂ¤r grunden ÃƒÂ¤r klar ÃƒÂ¤r nÃƒÂ¤sta steg att dela Omega-lÃƒÂ¤nken och fÃƒÂ¥ in fÃƒÂ¶rsta rÃƒÂ¶relsen.",
      mode: "copy-link" as const,
      label: "Kopiera Omega-lÃƒÂ¤nk",
    };
  }

  return {
    title: "Arbeta vidare i leads",
    description: "Du har redan signaler i gÃƒÂ¥ng. FortsÃƒÂ¤tt dÃƒÂ¤r arbetet faktiskt rÃƒÂ¶r sig just nu.",
    mode: "leads" as const,
    label: "Ãƒâ€“ppna leads",
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
      title: "HjÃƒÂ¤lp fÃƒÂ¶rsta linjen igÃƒÂ¥ng",
      reason: "Du har redan skapat egen rÃƒÂ¶relse. Nu blir nÃƒÂ¤sta hÃƒÂ¤vstÃƒÂ¥ng att hjÃƒÂ¤lpa nÃƒÂ¥gon nÃƒÂ¤ra dig till sin fÃƒÂ¶rsta signal.",
      action: "VÃƒÂ¤lj en partner i fÃƒÂ¶rsta linjen och hjÃƒÂ¤lp den personen till ett fÃƒÂ¶rsta tydligt steg denna vecka.",
    };
  }

  if (firstResultReached) {
    return {
      title: "Bygg pÃƒÂ¥ fÃƒÂ¶rsta resultatet",
      reason: "Nu gÃƒÂ¤ller det att upprepa det som fungerade medan tempot fortfarande finns kvar.",
      action: "Fokusera pÃƒÂ¥ ett andra resultat i samma riktning i stÃƒÂ¤llet fÃƒÂ¶r att sprida dig fÃƒÂ¶r brett.",
    };
  }

  if (activeLead) {
    return {
      title: "Driv aktiv dialog framÃƒÂ¥t",
      reason: "Det finns redan rÃƒÂ¶relse. Det viktiga nu ÃƒÂ¤r att hÃƒÂ¥lla tempot uppe tills du fÃƒÂ¥r ett tydligt utfall.",
      action: getLeadNextAction(activeLead),
    };
  }

  if (warmLead) {
    return {
      title: "FÃƒÂ¶lj upp varm lead nu",
      reason: "Det hÃƒÂ¤r ÃƒÂ¤r lÃƒÂ¤get dÃƒÂ¤r fÃƒÂ¶rsta resultat ofta avgÃƒÂ¶rs.",
      action: `Ta nÃƒÂ¤sta kontakt med ${warmLead.name} medan signalen fortfarande ÃƒÂ¤r varm.`,
    };
  }

  if (newLead) {
    return {
      title: "Ta fÃƒÂ¶rsta kontakt i dag",
      reason: "Ett nytt lead ÃƒÂ¤r mest vÃƒÂ¤rdefullt tidigt, innan tempot sjunker.",
      action: `BÃƒÂ¶rja med ${newLead.name} och ta fÃƒÂ¶rsta kontakt i dag.`,
    };
  }

  return {
    title: "Skapa fÃƒÂ¶rsta signalen",
    reason: "Du behÃƒÂ¶ver fÃƒÂ¶rsta rÃƒÂ¶relsen i systemet innan nÃƒÂ¥got annat blir viktigt.",
    action: "Dela din Omega-lÃƒÂ¤nk och fÃƒÂ¶rsÃƒÂ¶k fÃƒÂ¥ in ett fÃƒÂ¶rsta kund- eller partnerlead.",
  };
}

function buildWeeklyPlan(data: PartnerDashboardData) {
  const allLeads = [...data.leads, ...data.partnerLeads];
  const activeLead = allLeads.find((lead) => lead.status === "active");
  const warmLead = allLeads.find((lead) => lead.status === "qualified");
  const newLead = allLeads.find((lead) => lead.status === "new");

  if (data.metrics.directPartners > 0) {
    return {
      title: "Den hÃƒÂ¤r veckan",
      items: [
        "VÃƒÂ¤lj en person i fÃƒÂ¶rsta linjen som du aktivt hjÃƒÂ¤lper framÃƒÂ¥t.",
        "SÃƒÂ¤tt ett enda tydligt mÃƒÂ¥l fÃƒÂ¶r den personen denna vecka.",
        "FÃƒÂ¶lj upp utfallet innan du sprider fokus vidare.",
      ],
    };
  }

  if (data.customers.length > 0 || data.metrics.directPartners > 0) {
    return {
      title: "Den hÃƒÂ¤r veckan",
      items: [
        "Upprepa samma aktivitet som gav ditt fÃƒÂ¶rsta resultat.",
        "Fokusera pÃƒÂ¥ ett andra resultat innan du breddar fÃƒÂ¶r mycket.",
        "Skydda tempot genom att fÃƒÂ¶lja upp det som redan ÃƒÂ¤r igÃƒÂ¥ng.",
      ],
    };
  }

  if (activeLead) {
    return {
      title: "Den hÃƒÂ¤r veckan",
      items: [
        `Driv dialogen med ${activeLead.name} till ett tydligt utfall.`,
        "LÃƒÂ¥t inte aktiv rÃƒÂ¶relse bli stÃƒÂ¥ende utan nÃƒÂ¤sta steg.",
        "Prioritera fÃƒÂ¤rre samtal med hÃƒÂ¶gre kvalitet framfÃƒÂ¶r fler lÃƒÂ¶sa kontakter.",
      ],
    };
  }

  if (warmLead) {
    return {
      title: "Den hÃƒÂ¤r veckan",
      items: [
        `FÃƒÂ¶lj upp ${warmLead.name} medan signalen fortfarande ÃƒÂ¤r varm.`,
        "FÃƒÂ¶rsÃƒÂ¶k fÃƒÂ¥ ett tydligt besked i stÃƒÂ¤llet fÃƒÂ¶r att lÃƒÂ¤mna dialogen ÃƒÂ¶ppen.",
        "Skriv kort vad nÃƒÂ¤sta steg ÃƒÂ¤r direkt efter kontakten.",
      ],
    };
  }

  if (newLead) {
    return {
      title: "Den hÃƒÂ¤r veckan",
      items: [
        `Ta fÃƒÂ¶rsta kontakt med ${newLead.name}.`,
        "Skapa ett enkelt tempo: kontakt fÃƒÂ¶rst, funderingar sen.",
        "Fokusera pÃƒÂ¥ att fÃƒÂ¥ ett fÃƒÂ¶rsta svar, inte pÃƒÂ¥ att gÃƒÂ¶ra allt perfekt.",
      ],
    };
  }

  return {
    title: "Den hÃƒÂ¤r veckan",
    items: [
      "Dela din Omega-lÃƒÂ¤nk i ett sammanhang dÃƒÂ¤r du faktiskt fÃƒÂ¥r respons.",
      "Sikta pÃƒÂ¥ en fÃƒÂ¶rsta tydlig signal, inte maximal rÃƒÂ¤ckvidd.",
      "NÃƒÂ¤r fÃƒÂ¶rsta leaden kommer in, fÃƒÂ¶lj upp snabbt samma dag.",
    ],
  };
}

function buildPracticalWorkSuggestions(data: PartnerDashboardData) {
  const allLeads = [...data.leads, ...data.partnerLeads];
  const firstResultReached = data.customers.length > 0 || data.metrics.directPartners > 0;
  const hasWarmDialog = allLeads.some((lead) => lead.status === "qualified" || lead.status === "active");

  if (data.metrics.directPartners > 0) {
    return {
      title: "Praktiskt arbetssÃƒÂ¤tt",
      items: [
        "Ta ett kort avstÃƒÂ¤mningssamtal med din nÃƒÂ¤rmaste partner och hjÃƒÂ¤lp personen att vÃƒÂ¤lja en enda nÃƒÂ¤sta aktivitet.",
        "Bjud hellre in till ett gemensamt Zoom-call ÃƒÂ¤n att fÃƒÂ¶rsÃƒÂ¶ka fÃƒÂ¶rklara allt sjÃƒÂ¤lv i lÃƒÂ¥nga meddelanden.",
        "Be personen bÃƒÂ¶rja nÃƒÂ¤ra sitt eget nÃƒÂ¤tverk och fÃƒÂ¶lj upp direkt efter fÃƒÂ¶rsta kontakterna.",
      ],
    };
  }

  if (firstResultReached || hasWarmDialog) {
    return {
      title: "Praktiskt arbetssÃƒÂ¤tt",
      items: [
        "FÃƒÂ¶lj upp medan dialogen fortfarande lever och fÃƒÂ¶rsÃƒÂ¶k fÃƒÂ¥ ett tydligt nÃƒÂ¤sta steg i stÃƒÂ¤llet fÃƒÂ¶r lÃƒÂ¶sa svar.",
        "NÃƒÂ¤r intresse finns, bjud hellre vidare till samtal eller Zoom ÃƒÂ¤n att skriva lÃƒÂ¤ngre och lÃƒÂ¤ngre fÃƒÂ¶rklaringar.",
        "Skriv kort efter varje kontakt vad som ska hÃƒÂ¤nda hÃƒÂ¤rnÃƒÂ¤st, sÃƒÂ¥ att tempot inte tappas bort.",
      ],
    };
  }

  return {
    title: "Praktiskt arbetssÃƒÂ¤tt",
    items: [
      "BÃƒÂ¶rja nÃƒÂ¤ra. VÃƒÂ¤lj nÃƒÂ¥gra personliga kontakter dÃƒÂ¤r det redan finns fÃƒÂ¶rtroende, i stÃƒÂ¤llet fÃƒÂ¶r att skriva till alla.",
      "AnvÃƒÂ¤nd sociala medier fÃƒÂ¶r att vÃƒÂ¤cka nyfikenhet och fortsÃƒÂ¤tt sedan i dialog med dem som faktiskt svarar.",
      "NÃƒÂ¤r nÃƒÂ¥gon visar intresse, bjud vidare till samtal eller Zoom i stÃƒÂ¤llet fÃƒÂ¶r att fÃƒÂ¶rsÃƒÂ¶ka bÃƒÂ¤ra hela fÃƒÂ¶rklaringen sjÃƒÂ¤lv.",
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
      title: "SÃƒÂ¥ duplicerar du vidare",
      description: "Nu handlar det inte bara om din egen aktivitet, utan om att hjÃƒÂ¤lpa fÃƒÂ¶rsta linjen att arbeta pÃƒÂ¥ samma sÃƒÂ¤tt.",
      cards: [
        {
          title: "Personliga kontakter",
          summary: "Be partnern bÃƒÂ¶rja nÃƒÂ¤ra sitt eget nÃƒÂ¤tverk dÃƒÂ¤r fÃƒÂ¶rtroende redan finns.",
          action: "LÃƒÂ¥t personen vÃƒÂ¤lja nÃƒÂ¥gra namn i sin nÃƒÂ¤rhet innan ni breddar vidare.",
        },
        {
          title: "Sociala medier",
          summary: "AnvÃƒÂ¤nd sociala medier fÃƒÂ¶r att ÃƒÂ¶ppna dÃƒÂ¶rrar, inte fÃƒÂ¶r att bÃƒÂ¤ra hela fÃƒÂ¶rklaringen.",
          action: "Be partnern fÃƒÂ¶lja upp dem som faktiskt svarar i stÃƒÂ¤llet fÃƒÂ¶r att jaga rÃƒÂ¤ckvidd.",
        },
        {
          title: "Zoom eller samtal",
          summary: "NÃƒÂ¤r intresset ÃƒÂ¤r tydligt ska ni snabbare vidare till gemensamt samtal eller Zoom.",
          action: "Bjud hellre in till ett nÃƒÂ¤sta steg ÃƒÂ¤n att fÃƒÂ¶rklara allt i text.",
        },
        {
          title: hasSponsor ? "StÃƒÂ¶d uppÃƒÂ¥t och nedÃƒÂ¥t" : "StÃƒÂ¶d frÃƒÂ¥n Omega Balance-teamet",
          summary: hasSponsor
            ? `Du hjÃƒÂ¤lper nedÃƒÂ¥t och tar samtidigt hjÃƒÂ¤lp av ${data.sponsor?.name} uppÃƒÂ¥t nÃƒÂ¤r det behÃƒÂ¶vs.`
            : "Du hjÃƒÂ¤lper din fÃƒÂ¶rsta linje vidare och tar samtidigt stÃƒÂ¶d direkt frÃƒÂ¥n Omega Balance-teamet nÃƒÂ¤r det behÃƒÂ¶vs.",
          action: "HÃƒÂ¥ll stÃƒÂ¶det nÃƒÂ¤ra nÃƒÂ¤sta aktivitet, inte som allmÃƒÂ¤n pepp eller teori.",
        },
      ],
    };
  }

  if (firstResultReached || hasWarmDialog) {
    return {
      title: "SÃƒÂ¥ bygger du vidare",
      description: "Du har redan rÃƒÂ¶relse. NÃƒÂ¤sta steg ÃƒÂ¤r att gÃƒÂ¶ra arbetssÃƒÂ¤ttet tydligt och upprepningsbart.",
      cards: [
        {
          title: "Personliga kontakter",
          summary: "BÃƒÂ¶rja med personer dÃƒÂ¤r du naturligt kan ta nÃƒÂ¤sta kontakt utan att det kÃƒÂ¤nns krystat.",
          action: "VÃƒÂ¤lj hellre nÃƒÂ¥gra relevanta kontakter ÃƒÂ¤n att skriva till mÃƒÂ¥nga samtidigt.",
        },
        {
          title: "Sociala medier",
          summary: "LÃƒÂ¥t sociala medier vÃƒÂ¤cka nyfikenhet, men ta dialogen vidare dÃƒÂ¤r riktig respons finns.",
          action: "Svara snabbt dÃƒÂ¤r nÃƒÂ¥gon visar intresse i stÃƒÂ¤llet fÃƒÂ¶r att sprida energin fÃƒÂ¶r brett.",
        },
        {
          title: "Zoom eller samtal",
          summary: "NÃƒÂ¤r frÃƒÂ¥gorna blir fler ÃƒÂ¤n ett par meddelanden ÃƒÂ¤r det oftast dags fÃƒÂ¶r samtal.",
          action: "Flytta dialogen till Zoom eller telefon nÃƒÂ¤r du mÃƒÂ¤rker att intresset ÃƒÂ¤r pÃƒÂ¥ riktigt.",
        },
        {
          title: hasSponsor ? "Ta hjÃƒÂ¤lp uppÃƒÂ¥t" : "Ta stÃƒÂ¶d frÃƒÂ¥n Omega Balance-teamet",
          summary: hasSponsor
            ? `Du behÃƒÂ¶ver inte bÃƒÂ¤ra allt sjÃƒÂ¤lv. Ta hjÃƒÂ¤lp av ${data.sponsor?.name} eller din up-line nÃƒÂ¤r du kÃƒÂ¶r fast.`
            : "Du behÃƒÂ¶ver inte bÃƒÂ¤ra allt sjÃƒÂ¤lv. Ta stÃƒÂ¶d av Omega Balance-teamet nÃƒÂ¤r du kÃƒÂ¶r fast eller vill gÃƒÂ¶ra nÃƒÂ¤sta steg tydligare.",
          action: "Be om hjÃƒÂ¤lp nÃƒÂ¤r det kan ÃƒÂ¶ka kvaliteten i ett samtal eller nÃƒÂ¤sta steg.",
        },
      ],
    };
  }

  return {
    title: "SÃƒÂ¥ kommer du igÃƒÂ¥ng",
    description: "Det fÃƒÂ¶rsta arbetssÃƒÂ¤ttet ska vara enkelt nog att upprepa och tydligt nog att kÃƒÂ¤nnas naturligt.",
    cards: [
      {
        title: "Personliga kontakter",
        summary: "BÃƒÂ¶rja nÃƒÂ¤ra med nÃƒÂ¥gra personer dÃƒÂ¤r det redan finns fÃƒÂ¶rtroende.",
        action: "TÃƒÂ¤nk familj, vÃƒÂ¤nner, tidigare kollegor eller andra du kan kontakta utan att det kÃƒÂ¤nns konstlat.",
      },
      {
        title: "Sociala medier",
        summary: "AnvÃƒÂ¤nd sociala medier fÃƒÂ¶r att skapa nyfikenhet, inte fÃƒÂ¶r att jaga alla samtidigt.",
        action: "LÃƒÂ¤gg energi pÃƒÂ¥ dem som svarar eller visar verkligt intresse.",
      },
      {
        title: "Zoom eller samtal",
        summary: "Du behÃƒÂ¶ver inte fÃƒÂ¶rklara allt sjÃƒÂ¤lv i text frÃƒÂ¥n bÃƒÂ¶rjan.",
        action: "NÃƒÂ¤r intresse finns, bjud vidare till ett samtal eller Zoom i stÃƒÂ¤llet fÃƒÂ¶r att skriva lÃƒÂ¤ngre meddelanden.",
      },
      {
        title: hasSponsor ? "Ta hjÃƒÂ¤lp uppÃƒÂ¥t" : "StÃƒÂ¶d frÃƒÂ¥n Omega Balance-teamet",
        summary: hasSponsor
          ? "NÃƒÂ¤r du kÃƒÂ¶r fast ÃƒÂ¤r nÃƒÂ¤sta steg ofta att ta hjÃƒÂ¤lp av din up-line."
          : "NÃƒÂ¤r du kÃƒÂ¶r fast ÃƒÂ¤r nÃƒÂ¤sta steg ofta att ta stÃƒÂ¶d direkt frÃƒÂ¥n Omega Balance-teamet i stÃƒÂ¤llet fÃƒÂ¶r att tveka fÃƒÂ¶r lÃƒÂ¤nge sjÃƒÂ¤lv.",
        action: "Be om hjÃƒÂ¤lp nÃƒÂ¤r du har en verklig kontakt i gÃƒÂ¥ng eller vill gÃƒÂ¶ra nÃƒÂ¤sta steg tydligare.",
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
      title: "Duplicering bÃƒÂ¶rjar sÃƒÂ¥ hÃƒÂ¤r",
      items: [
        "Bygg fÃƒÂ¶rst din egen rytm tills du vet vad som faktiskt fungerar i praktiken.",
        "Spara kort vad du sÃƒÂ¤ger i fÃƒÂ¶rsta kontakt, hur du fÃƒÂ¶ljer upp och nÃƒÂ¤r du bjuder vidare till samtal eller Zoom.",
        hasSponsor
          ? "NÃƒÂ¤r nÃƒÂ¥got bÃƒÂ¶rjar fungera, stÃƒÂ¤m av med din up-line hur samma arbetssÃƒÂ¤tt kan gÃƒÂ¶ras enklare att upprepa."
          : "NÃƒÂ¤r nÃƒÂ¥got bÃƒÂ¶rjar fungera, hÃƒÂ¥ll arbetssÃƒÂ¤ttet enkelt nog att upprepa innan du fÃƒÂ¶rsÃƒÂ¶ker bredda det.",
      ],
    };
  }

  return {
    title: "Din dupliceringsrytm",
    items: [
      nearestDownline
        ? `Fokusera denna vecka pÃƒÂ¥ att hjÃƒÂ¤lpa ${nearestDownline.partnerName} till ett enda tydligt nÃƒÂ¤sta steg.`
        : "Fokusera denna vecka pÃƒÂ¥ din nÃƒÂ¤rmaste first line och hÃƒÂ¥ll stÃƒÂ¶det nÃƒÂ¤ra nÃƒÂ¤sta aktivitet.",
      "AnvÃƒÂ¤nd gemensamt samtal eller Zoom nÃƒÂ¤r det hÃƒÂ¶jer kvaliteten, i stÃƒÂ¤llet fÃƒÂ¶r att skriva lÃƒÂ¤ngre fÃƒÂ¶rklaringar i efterhand.",
      hasSponsor
        ? `NÃƒÂ¤r ni kÃƒÂ¶r fast, lyft lÃƒÂ¤get kort till ${data.sponsor?.name} med vad som redan ÃƒÂ¤r gjort och vad nÃƒÂ¤sta hinder faktiskt ÃƒÂ¤r.`
        : "NÃƒÂ¤r ni kÃƒÂ¶r fast, lyft bara det som behÃƒÂ¶ver nÃƒÂ¤sta nivÃƒÂ¥ av stÃƒÂ¶d och hÃƒÂ¥ll resten nÃƒÂ¤ra vardagsarbetet.",
    ],
  };
}

function buildLeadQueueSummary(leads: Lead[]) {
  const urgent = leads.filter((lead) => lead.status === "new" || lead.status === "qualified").length;
  const active = leads.filter((lead) => lead.status === "active").length;
  const newLeads = leads.filter((lead) => lead.status === "new").length;
  const done = leads.filter((lead) => lead.status === "won").length;

  return [
    { label: "BrÃƒÂ¥dskande nu", value: urgent },
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
    { label: "Ta i dag", value: takeToday, note: "Nya kontakter som bÃƒÂ¶r fÃƒÂ¥ fÃƒÂ¶rsta svar snabbt." },
    { label: "FÃƒÂ¶lj upp nu", value: followUpNow, note: "Varmare dialoger som inte bÃƒÂ¶r tappa fart." },
    { label: "HÃƒÂ¥ll levande", value: activeDialogs, note: "Aktiva samtal som behÃƒÂ¶ver nÃƒÂ¤sta steg, inte bara vÃƒÂ¤ntan." },
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
      label: "FÃƒÂ¶rsta aktivitet",
      description: "Ett lead eller en fÃƒÂ¶rsta signal har skapats.",
      done: hasLead,
      current: !hasLead,
    },
    {
      label: "Respons",
      description: "En dialog har kommit igÃƒÂ¥ng och ÃƒÂ¤r redo fÃƒÂ¶r tydlig uppfÃƒÂ¶ljning.",
      done: hasResponse,
      current: hasLead && !hasResponse,
    },
    {
      label: "FÃƒÂ¶rsta resultat",
      description: "En kundsignal eller tydlig partnerreaktion finns.",
      done: hasResult,
      current: hasResponse && !hasResult,
    },
    {
      label: "NÃƒÂ¤sta fas",
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
      setZzLinkStatus("Dina ZZ-lÃƒÂ¤nkar ÃƒÂ¤r sparade.");
      await queryClient.invalidateQueries({ queryKey: ["partner-dashboard", partnerId] });
      await queryClient.invalidateQueries({ queryKey: ["admin-dashboard"] });
    },
    onError: (error) => {
      setZzLinkStatus(error instanceof Error ? error.message : "Kunde inte spara dina ZZ-lÃƒÂ¤nkar.");
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
      { label: "Ãƒâ€“versikt", href: "/dashboard/partner/overview", icon: dashboardIcons.dashboard },
      { label: "Leads", href: "/dashboard/partner/leads", icon: dashboardIcons.leads },
      { label: "LÃƒÂ¤nkar", href: "/dashboard/partner/links", icon: Link2 },
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
  const topTodayQueue = [
    startAction
      ? {
          key: "start-action",
          title: startAction.title,
          summary: startAction.description,
          action: startAction.label,
          mode: startAction.mode,
        }
      : null,
    firstResultFocus
      ? {
          key: "first-result",
          title: firstResultFocus.title,
          summary: firstResultFocus.reason,
          action: firstResultFocus.action,
          mode: "focus" as const,
        }
      : null,
    prioritizedLeads[0]
      ? {
          key: `lead-${prioritizedLeads[0].id}`,
          title: `FÃƒÂ¶lj upp ${prioritizedLeads[0].name}`,
          summary: `${getLeadStatusLabel(prioritizedLeads[0].status)} Ã¢â‚¬Â¢ ${getLeadSituationLabel(prioritizedLeads[0])}`,
          action: getLeadNextAction(prioritizedLeads[0]),
          mode: "leads" as const,
        }
      : null,
    weeklyPlan?.items[0]
      ? {
          key: "weekly-rhythm",
          title: weeklyPlan.title,
          summary: "Det viktigaste rytmsteget att hÃƒÂ¥lla fast vid just nu.",
          action: weeklyPlan.items[0],
          mode: "focus" as const,
        }
      : null,
  ].filter(Boolean).slice(0, 4) as Array<{
    key: string;
    title: string;
    summary: string;
    action: string;
    mode: "copy-link" | "links" | "leads" | "legal" | "focus";
  }>;
  const firstLineFocusQueue = data
    ? [
        data.team[0]
          ? {
              key: `downline-${data.team[0].partnerId}`,
              title: `HjÃƒÂ¤lp ${data.team[0].partnerName} vidare`,
              summary: "Din nÃƒÂ¤rmaste first line ger stÃƒÂ¶rst hÃƒÂ¤vstÃƒÂ¥ng just nu om du hÃƒÂ¥ller stÃƒÂ¶det nÃƒÂ¤ra nÃƒÂ¤sta aktivitet.",
              action: "Ta ett kort avstÃƒÂ¤mningssamtal och landa i ett enda tydligt nÃƒÂ¤sta steg denna vecka.",
            }
          : null,
        {
          key: "up-line-support",
          title: data.sponsor ? `Ta stÃƒÂ¶d av ${data.sponsor.name}` : "Ta stÃƒÂ¶d av Omega Balance-teamet",
          summary: data.sponsor
            ? "NÃƒÂ¤r dialog eller uppfÃƒÂ¶ljning fastnar blir nÃƒÂ¤sta steg ofta lÃƒÂ¤ttare om du tar stÃƒÂ¶d uppÃƒÂ¥t tidigt."
            : "NÃƒÂ¤r du ligger nÃƒÂ¤ra toppen behÃƒÂ¶ver du inte bÃƒÂ¤ra allt sjÃƒÂ¤lv. Ta stÃƒÂ¶d uppÃƒÂ¥t sÃƒÂ¥ fort nÃƒÂ¤sta steg blir oklart.",
          action: "Be om hjÃƒÂ¤lp i skarpa lÃƒÂ¤gen, helst kopplat till en verklig kontakt eller ett konkret nÃƒÂ¤sta steg.",
        },
        {
          key: "duplicate-rhythm",
          title: "Skydda dupliceringsrytmen",
          summary: "Duplicering bÃƒÂ¶rjar nÃƒÂ¤r du hjÃƒÂ¤lper nÃƒÂ¥gon annan till sitt fÃƒÂ¶rsta tydliga resultat, inte bara nÃƒÂ¤r du sjÃƒÂ¤lv producerar mer.",
          action: data.team.length
            ? "Fokusera pÃƒÂ¥ en person i taget i din first line tills ni fÃƒÂ¥tt fÃƒÂ¶rsta tydliga signalen dÃƒÂ¤r."
            : "NÃƒÂ¤r din fÃƒÂ¶rsta direkta partner kommer in, hjÃƒÂ¤lp den personen igÃƒÂ¥ng innan du fÃƒÂ¶rsÃƒÂ¶ker bredda fÃƒÂ¶r mycket.",
        },
      ].filter(Boolean) as Array<{
        key: string;
        title: string;
        summary: string;
        action: string;
      }>
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
      subtitle="Din egen vy ÃƒÂ¶ver referral-lÃƒÂ¤nk, leads, kunder och direkta partnerkontakter. Bara det som hÃƒÂ¶r till dig visas hÃƒÂ¤r."
      roleLabel={isDemo ? "Partnerdemo" : "Partner"}
      navigation={navigation}
      onSignOut={isDemo ? undefined : () => void signOutPortalUser()}
    >
      <Dialog open={zzLinksOpen} onOpenChange={setZzLinksOpen}>
        <DialogContent className="max-w-2xl rounded-[1.75rem] border-border/70 bg-white/95 p-6 shadow-card md:p-7">
            <DialogHeader>
              <DialogTitle>Mina ZZ-lÃƒÂ¤nkar</DialogTitle>
              <DialogDescription>
                LÃƒÂ¤gg in dina riktiga Zinzino-lÃƒÂ¤nkar hÃƒÂ¤r. Just nu anvÃƒÂ¤nder vi test-, shop- och partnerlÃƒÂ¤nken i flÃƒÂ¶det.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="partner-zz-test">TestlÃƒÂ¤nk</Label>
              <Input
                id="partner-zz-test"
                value={zzTestUrl}
                onChange={(event) => setZzTestUrl(event.target.value)}
                placeholder="https://..."
                className="rounded-xl"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="partner-zz-shop">ShoplÃƒÂ¤nk</Label>
              <Input
                id="partner-zz-shop"
                value={zzShopUrl}
                onChange={(event) => setZzShopUrl(event.target.value)}
                placeholder="https://..."
                className="rounded-xl"
              />
            </div>

              <div className="grid gap-2">
                <Label htmlFor="partner-zz-partner">PartnerlÃƒÂ¤nk</Label>
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
              {zzLinkStatus ? zzLinkStatus : "Du kan uppdatera lÃƒÂ¤nkarna sjÃƒÂ¤lv nÃƒÂ¤r dina Zinzino-destinationer ÃƒÂ¤ndras."}
            </div>
            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={() => setZzLinksOpen(false)}>
                StÃƒÂ¤ng
              </Button>
              <Button type="button" onClick={() => zzLinksMutation.mutate()} disabled={zzLinksMutation.isPending}>
                {zzLinksMutation.isPending ? "Sparar..." : "Spara lÃƒÂ¤nkar"}
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
              Du tittar pÃƒÂ¥ partnervyn som admin. Den hÃƒÂ¤r sidan anvÃƒÂ¤nds fÃƒÂ¶r att granska partnerupplevelsen, inte fÃƒÂ¶r att ÃƒÂ¤ndra adminbehÃƒÂ¶righet.
            </div>
          ) : null}

          {showOverview && journey ? (
            <DashboardSection
              title="Dina fÃƒÂ¶rsta 30 dagar"
              description="En enkel kompass fÃƒÂ¶r vad som ÃƒÂ¤r viktigast just nu. Det hÃƒÂ¤r ÃƒÂ¤r inte ZZ-rank eller payout, utan din nÃƒÂ¤sta tydliga riktning."
            >
              <div className="grid gap-3 xl:grid-cols-[1.1fr_0.9fr]">
                <div className="rounded-[1.2rem] border border-border/70 bg-secondary/30 p-4">
                  <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Nuvarande lÃƒÂ¤ge</p>
                  <p className="mt-3 font-serif text-3xl font-semibold tracking-tight text-foreground">{journey.stageLabel}</p>
                  <p className="mt-2 text-sm leading-6 text-subtle">{journey.summary}</p>
                  <div className="mt-4 rounded-[1rem] border border-border/70 bg-white/80 p-3.5">
                    <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Bra jobbat hittills</p>
                    <p className="mt-2 text-sm text-foreground">{journey.encouragement}</p>
                  </div>

                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    <div className="rounded-[1rem] border border-border/70 bg-white/80 p-3.5">
                      <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">NÃƒÂ¤sta milstolpe</p>
                      <p className="mt-2 text-sm text-foreground">{journey.nextMilestone}</p>
                    </div>
                    <div className="rounded-[1rem] border border-border/70 bg-white/80 p-3.5">
                      <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">NÃƒÂ¤sta bÃƒÂ¤sta steg</p>
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
                        <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">NÃƒÂ¤sta handling</p>
                        <p className="mt-2 text-sm text-foreground">{firstResultFocus.action}</p>
                      </div>
                    </div>
                  ) : null}

                  {startAction ? (
                    <div className="rounded-[1.2rem] border border-border/70 bg-white p-4">
                      <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">GÃƒÂ¶r detta nu</p>
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

                  {topTodayQueue.length ? (
                    <div className="rounded-[1.2rem] border border-border/70 bg-white p-4">
                      <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Ta detta nu</p>
                      <div className="mt-3 space-y-3">
                        {topTodayQueue.map((item) => (
                          <div key={item.key} className="rounded-[1rem] border border-border/70 bg-secondary/20 p-3.5">
                            <p className="text-sm font-medium text-foreground">{item.title}</p>
                            <p className="mt-2 text-sm leading-6 text-subtle">{item.summary}</p>
                            <p className="mt-2 text-xs leading-5 text-foreground/80">{item.action}</p>
                            <div className="mt-3">
                              {item.mode === "copy-link" ? (
                                <Button
                                  type="button"
                                  variant="outline"
                                  className="h-8 rounded-lg px-3 text-sm"
                                  onClick={() => navigator.clipboard.writeText(partnerLink)}
                                >
                                  <Copy className="mr-2 h-3.5 w-3.5" />
                                  Kopiera lÃƒÂ¤nk
                                </Button>
                              ) : item.mode === "links" ? (
                                <Button asChild type="button" variant="outline" className="h-8 rounded-lg px-3 text-sm">
                                  <Link to="/dashboard/partner/links">Ãƒâ€“ppna lÃƒÂ¤nkar</Link>
                                </Button>
                              ) : item.mode === "leads" ? (
                                <Button asChild type="button" variant="outline" className="h-8 rounded-lg px-3 text-sm">
                                  <Link to="/dashboard/partner/leads">Ãƒâ€“ppna leads</Link>
                                </Button>
                              ) : item.mode === "legal" ? (
                                <Button asChild type="button" variant="outline" className="h-8 rounded-lg px-3 text-sm">
                                  <Link to={legalActionHref}>Ãƒâ€“ppna legal</Link>
                                </Button>
                              ) : null}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  <div className="rounded-[1.2rem] border border-border/70 bg-white p-4">
                    <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Progress mot fÃƒÂ¶rsta resultat</p>
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
              title="SnabbÃƒÂ¥tgÃƒÂ¤rder"
              description="Tre snabba vÃƒÂ¤gar nÃƒÂ¤r du vill agera direkt."
            >
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                <div className="flex h-full flex-col justify-between rounded-[1.1rem] border border-border/70 bg-white/95 p-4 shadow-card">
                  <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Dela Omega-lÃƒÂ¤nken</p>
                  <p className="mt-2 text-sm leading-6 text-subtle">
                    NÃƒÂ¤r grunden ÃƒÂ¤r klar ÃƒÂ¤r detta lÃƒÂ¤nken du anvÃƒÂ¤nder fÃƒÂ¶r att skapa ny rÃƒÂ¶relse.
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    className="mt-3 inline-flex h-8 max-w-full self-start whitespace-normal rounded-lg px-3 text-sm leading-tight"
                    onClick={() => navigator.clipboard.writeText(partnerLink)}
                  >
                    <Copy className="mr-2 h-3.5 w-3.5 shrink-0" />
                    Kopiera lÃƒÂ¤nk
                  </Button>
                </div>

                <div className="flex h-full flex-col justify-between rounded-[1.1rem] border border-border/70 bg-white/95 p-4 shadow-card">
                  <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Se ZZ-lÃƒÂ¤nkar</p>
                  <p className="mt-2 text-sm leading-6 text-subtle">
                    BÃƒÂ¶rja hÃƒÂ¤r om dina test-, shop- eller partnerlÃƒÂ¤nkar saknas.
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    className="mt-3 inline-flex h-8 max-w-full self-start whitespace-normal rounded-lg px-3 text-sm leading-tight"
                    onClick={openZzLinksDialog}
                  >
                    Redigera mina lÃƒÂ¤nkar
                  </Button>
                </div>

                <div className="flex h-full flex-col justify-between rounded-[1.1rem] border border-border/70 bg-white/95 p-4 shadow-card">
                  <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Arbeta med leads</p>
                  <p className="mt-2 text-sm leading-6 text-subtle">
                    GÃƒÂ¥ hit nÃƒÂ¤r du redan har signaler i gÃƒÂ¥ng och vill fÃƒÂ¶lja upp dem vidare.
                  </p>
                  <Button asChild type="button" variant="outline" className="mt-3 inline-flex h-8 max-w-full self-start whitespace-normal rounded-lg px-3 text-sm leading-tight">
                    <Link to="/dashboard/partner/leads">Ãƒâ€“ppna mina leads</Link>
                  </Button>
                </div>
              </div>
            </DashboardSection>
          ) : null}

          {showLinks ? (
            <DashboardSection
              title="Min Omega-lÃƒÂ¤nk"
              description="LÃƒÂ¤nken du normalt delar vidare."
            >
              <div className="flex flex-col gap-4 rounded-[1.2rem] border border-border/70 bg-secondary/40 p-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">LÃƒÂ¤nken du delar</p>
                  <p className="mt-2 break-all font-medium text-foreground">{partnerLink}</p>
                  <p className="mt-2 text-sm leading-6 text-subtle">
                    AnvÃƒÂ¤nd den hÃƒÂ¤r lÃƒÂ¤nken i fÃƒÂ¶rsta hand. Vi skickar vidare till rÃƒÂ¤tt Zinzino-lÃƒÂ¤nk i bakgrunden.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  className="h-8 rounded-lg px-3 text-sm"
                  onClick={() => navigator.clipboard.writeText(partnerLink)}
                >
                  <Copy className="mr-2 h-3.5 w-3.5" />
                  Kopiera lÃƒÂ¤nk
                </Button>
              </div>
            </DashboardSection>
          ) : null}

          {showLinks ? (
            <DashboardSection
              title="Mina ZZ-lÃƒÂ¤nkar"
              description="Dina personliga destinationslÃƒÂ¤nkar till Zinzino."
            >
              <div className="mb-4 flex items-center justify-between gap-3 rounded-[1.1rem] border border-border/70 bg-secondary/30 p-4">
                <p className="text-sm leading-6 text-subtle">
                  LÃƒÂ¤gg in och uppdatera dina egna test-, shop- och partnerlÃƒÂ¤nkar hÃƒÂ¤r.
                </p>
                <Button type="button" variant="outline" className="h-8 rounded-lg px-3 text-sm" onClick={openZzLinksDialog}>
                  Redigera mina lÃƒÂ¤nkar
                </Button>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {[
                  { label: "TestlÃƒÂ¤nk", value: data.zzLinks.test },
                  { label: "ShoplÃƒÂ¤nk", value: data.zzLinks.shop },
                  { label: "PartnerlÃƒÂ¤nk", value: data.zzLinks.partner },
                ].map((linkItem) => (
                  <div key={linkItem.label} className="rounded-[1.1rem] border border-border/70 bg-white/95 p-4 shadow-card">
                    <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">{linkItem.label}</p>
                  {linkItem.value ? (
                      <>
                        <p className="mt-3 break-all text-sm text-foreground">{linkItem.value}</p>
                        <p className="mt-2 text-xs leading-5 text-subtle">
                          Detta ÃƒÂ¤r din bakomliggande Zinzino-lÃƒÂ¤nk. Dela normalt din Omega-lÃƒÂ¤nk ovan och anvÃƒÂ¤nd denna nÃƒÂ¤r du behÃƒÂ¶ver gÃƒÂ¥ direkt.
                        </p>
                        <Button
                          type="button"
                          variant="outline"
                          className="mt-3 h-8 rounded-lg px-3 text-sm"
                          onClick={() => navigator.clipboard.writeText(linkItem.value as string)}
                        >
                          <Copy className="mr-2 h-3.5 w-3.5" />
                          Kopiera lÃƒÂ¤nk
                        </Button>
                      </>
                    ) : (
                      <p className="mt-3 text-sm leading-6 text-subtle">
                        Ingen lÃƒÂ¤nk sparad ÃƒÂ¤nnu. LÃƒÂ¤gg in den via knappen ovan.
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </DashboardSection>
          ) : null}

          {showOverview ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <MetricCard label="Mina leads" value={data.metrics.leads} helper="Alla leads dÃƒÂ¤r du ÃƒÂ¤r attribuerad partner." icon={<Link2 className="h-5 w-5" />} />
              <MetricCard label="Partnerleads" value={data.metrics.partnerLeads} helper="Nya intresseanmÃƒÂ¤lningar fÃƒÂ¶r partnerskap." icon={<UserPlus2 className="h-5 w-5" />} />
              <MetricCard label="Mina kunder" value={data.metrics.customers} helper="Kunder som hittills kopplats till dig." icon={<Users className="h-5 w-5" />} />
              <MetricCard label="Direkta kontakter" value={data.metrics.directPartners} helper="Direkta partnerkontakter som kommit in via dig." icon={<Users className="h-5 w-5" />} />
            </div>
          ) : null}

          {showLeads ? (
            <div className="grid gap-8 xl:grid-cols-[1.1fr_0.9fr]">
              <DashboardSection title="Mina leads" description="BÃƒÂ¥de kundleads och partnerleads sparas med din attribution.">
                <div className="mb-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
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
                    { value: "urgent", label: "BrÃƒÂ¥dskande" },
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
                  columns={["Namn", "Typ", "LÃƒÂ¤ge", "BrÃƒÂ¥dskande", "NÃƒÂ¤sta steg", "Senast aktiv"]}
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
                  <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Ta fÃƒÂ¶rst bland kundleads</p>
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
                      <p className="text-sm text-subtle">Inga kundleads ÃƒÂ¤nnu. Fokusera fÃƒÂ¶rst pÃƒÂ¥ att skapa fÃƒÂ¶rsta kundsignalen.</p>
                    )}
                  </div>
                </div>
              </DashboardSection>

              {showLeads ? (
                <DashboardSection title="FÃƒÂ¶rst att fÃƒÂ¶lja upp" description="Systemet lyfter de leads som just nu ÃƒÂ¤r mest relevanta fÃƒÂ¶r att fÃƒÂ¥ fÃƒÂ¶rsta rÃƒÂ¶relse eller fÃƒÂ¶rsta resultat.">
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
                                BrÃƒÂ¥dskande: {getLeadUrgencyLabel(lead)}
                              </Badge>
                            </div>
                            <p className="mt-3 text-sm text-foreground">{getLeadNextAction(lead)}</p>
                            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-subtle">
                              <span>{lead.type === "partner_lead" ? "Partnerlead" : "Kundlead"}</span>
                              <span>Ã¢â‚¬Â¢</span>
                              <span>{formatDate(lead.updated_at || lead.created_at)}</span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="rounded-[1rem] border border-border/70 bg-white/85 p-3.5">
                          <p className="text-sm text-subtle">Inga prioriterade leads ÃƒÂ¤nnu. Fokusera fÃƒÂ¶rst pÃƒÂ¥ att skapa din fÃƒÂ¶rsta signal.</p>
                          <Button
                            type="button"
                            variant="outline"
                            className="mt-3 h-8 rounded-lg px-3 text-sm"
                            onClick={() => navigator.clipboard.writeText(partnerLink)}
                          >
                            <Copy className="mr-2 h-3.5 w-3.5" />
                            Kopiera Omega-lÃƒÂ¤nken
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
            <DashboardSection title="Kundsignaler" description="Kundrelationer som hittills kopplats till dig via systemet. Detta ÃƒÂ¤r inte officiell ZZ-utbetalning eller kompensation.">
              <div className="rounded-[1.2rem] border border-border/70 bg-accent/50 p-4">
                <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Attribuerade kunder</p>
                <p className="mt-3 font-serif text-4xl font-semibold tracking-tight text-foreground">
                  {new Intl.NumberFormat("sv-SE", { maximumFractionDigits: 0 }).format(data.customers.length)}
                </p>
                <p className="mt-2 text-sm leading-6 text-subtle">
                  Tidiga kommersiella signaler runt ditt flÃƒÂ¶de, inte payout eller bonus.
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
                  emptyState="Inga attribuerade kunder ÃƒÂ¤nnu."
                />
              </div>
            </DashboardSection>
          ) : null}

          {showLeads || showNetwork ? (
            <div className="grid gap-8 xl:grid-cols-2">
              {showLeads ? (
                <DashboardSection title="Mina partnerleads" description="HÃƒÂ¤r ser du partnerintresse och vad du bÃƒÂ¶r gÃƒÂ¶ra hÃƒÂ¤rnÃƒÂ¤st.">
                <div className="mb-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
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
                      { value: "urgent", label: "BrÃƒÂ¥dskande" },
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
                    columns={["SÃƒÂ¶kande", "KÃƒÂ¤lla", "LÃƒÂ¤ge", "BrÃƒÂ¥dskande", "NÃƒÂ¤sta steg", "Senast aktiv"]}
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
                    <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Ta fÃƒÂ¶rst bland partnerleads</p>
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
                        <p className="text-sm text-subtle">Inga partnerleads ÃƒÂ¤nnu. Fokusera fÃƒÂ¶rst pÃƒÂ¥ att skapa fÃƒÂ¶rsta partnersignalen.</p>
                      )}
                    </div>
                  </div>
                </DashboardSection>
              ) : null}

              {showNetwork ? (
                <DashboardSection title="Direkta partnerkontakter" description="Personer du har bjudit in eller fÃƒÂ¥tt in i ditt nÃƒÂ¤rmaste partnerled. SjÃƒÂ¤lva placeringen och ranken hanteras i Zinzino.">
                  <div className="mb-4 grid gap-3 lg:grid-cols-2">
                    <div className="rounded-[1.1rem] border border-border/70 bg-secondary/20 p-4">
                      <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Vem hjÃƒÂ¤lper dig nu</p>
                      {data.sponsor ? (
                        <>
                          <p className="mt-3 text-sm font-medium text-foreground">{data.sponsor.name}</p>
                          <p className="mt-1 text-sm text-subtle">{data.sponsor.email}</p>
                          <p className="mt-3 text-sm leading-6 text-subtle">
                            Om du fastnar i nÃƒÂ¤sta steg ska du i fÃƒÂ¶rsta hand ta hjÃƒÂ¤lp av din nÃƒÂ¤rmaste up-line.
                          </p>
                        </>
                      ) : (
                        <p className="mt-3 text-sm leading-6 text-subtle">
                          Du ligger nÃƒÂ¤ra toppen i den hÃƒÂ¤r modellen. Det betyder att stÃƒÂ¶det uppÃƒÂ¥t frÃƒÂ¤mst kommer direkt frÃƒÂ¥n Omega Balance-teamet.
                        </p>
                      )}
                    </div>

                    <div className="rounded-[1.1rem] border border-border/70 bg-secondary/20 p-4">
                      <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Vem ska du hjÃƒÂ¤lpa nu</p>
                      {data.team.length ? (
                        <>
                          <p className="mt-3 text-sm font-medium text-foreground">{data.team[0].partnerName}</p>
                          <p className="mt-1 text-sm text-subtle">{data.team[0].email}</p>
                          <p className="mt-3 text-sm leading-6 text-subtle">
                            BÃƒÂ¶rja med din nÃƒÂ¤rmaste downline och hjÃƒÂ¤lp den personen till sitt fÃƒÂ¶rsta tydliga steg innan du breddar stÃƒÂ¶det.
                          </p>
                        </>
                      ) : (
                        <p className="mt-3 text-sm leading-6 text-subtle">
                          NÃƒÂ¤r du fÃƒÂ¥r in din fÃƒÂ¶rsta direkta partner bÃƒÂ¶rjar dupliceringen hÃƒÂ¤r. DÃƒÂ¥ ÃƒÂ¤r nÃƒÂ¤sta steg att hjÃƒÂ¤lpa den personen igÃƒÂ¥ng.
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
                    columns={["Partner", "NivÃƒÂ¥", "Tillagd"]}
                    rows={data.team.map((member) => [
                      <div key={`${member.partnerId}-member`}>
                        <p className="font-medium text-foreground">{member.partnerName}</p>
                        <p className="text-xs text-subtle">{member.email}</p>
                      </div>,
                      <Badge key={`${member.partnerId}-level`} variant="secondary" className="rounded-full px-3 py-1">
                        NivÃƒÂ¥ {member.level}
                      </Badge>,
                      <span key={`${member.partnerId}-joined`}>{formatDate(member.createdAt)}</span>,
                    ])}
                    emptyState="Inga direkta partnerkontakter ÃƒÂ¤nnu."
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
