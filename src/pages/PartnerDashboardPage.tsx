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
      return "BehÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶ver kontakt";
    case "qualified":
      return "FÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶lj upp nu";
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
      return "Ta fÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶rsta kontakt i dag.";
    case "qualified":
      return "FÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶lj upp medan signalen fortfarande ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤r varm.";
    case "active":
      return lead.type === "partner_lead"
        ? "HÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¥ll dialogen levande och fÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶rsÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶k boka nÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤sta steg."
        : "FÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶r dialogen vidare mot test, order eller tydligt beslut.";
    case "inactive":
      return "Parkera tillfÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤lligt och ta ny kontakt vid rÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤tt lÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤ge.";
    case "won":
      return "Bygg vidare pÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¥ det som fungerade och skapa nÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤sta resultat.";
    case "lost":
      return "LÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤gg ingen energi hÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤r just nu.";
    default:
      return "BestÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤m nÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤sta tydliga steg.";
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
      return "StÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤ngd";
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
      return "HÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶g";
    case "active":
      return "Nu";
    case "inactive":
      return "LÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¥g";
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
      title: "HjÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤lp fÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶rsta linjen igÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¥ng",
      reason: "Du har redan skapat egen rÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶relse. Nu blir nÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤sta hÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤vstÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¥ng att hjÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤lpa nÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¥gon nÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤ra dig till sin fÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶rsta signal.",
      action: "VÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤lj en partner i fÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶rsta linjen och hjÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤lp den personen till ett fÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶rsta tydligt steg denna vecka.",
    };
  }

  if (firstResultReached) {
    return {
      title: "Bygg pÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¥ fÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶rsta resultatet",
      reason: "Nu gÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤ller det att upprepa det som fungerade medan tempot fortfarande finns kvar.",
      action: "Fokusera pÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¥ ett andra resultat i samma riktning i stÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤llet fÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶r att sprida dig fÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶r brett.",
    };
  }

  if (activeLead) {
    return {
      title: "Driv aktiv dialog framÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¥t",
      reason: "Det finns redan rÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶relse. Det viktiga nu ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤r att hÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¥lla tempot uppe tills du fÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¥r ett tydligt utfall.",
      action: getLeadNextAction(activeLead),
    };
  }

  if (warmLead) {
    return {
      title: "FÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶lj upp varm lead nu",
      reason: "Det hÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤r ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤r lÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤get dÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤r fÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶rsta resultat ofta avgÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶rs.",
      action: `Ta nÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤sta kontakt med ${warmLead.name} medan signalen fortfarande ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤r varm.`,
    };
  }

  if (newLead) {
    return {
      title: "Ta fÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶rsta kontakt i dag",
      reason: "Ett nytt lead ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤r mest vÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤rdefullt tidigt, innan tempot sjunker.",
      action: `BÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶rja med ${newLead.name} och ta fÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶rsta kontakt i dag.`,
    };
  }

  return {
    title: "Skapa fÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶rsta signalen",
    reason: "Du behÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶ver fÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶rsta rÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶relsen i systemet innan nÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¥got annat blir viktigt.",
    action: "Dela din Omega-lÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤nk och fÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶rsÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶k fÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¥ in ett fÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶rsta kund- eller partnerlead.",
  };
}

function buildWeeklyPlan(data: PartnerDashboardData) {
  const allLeads = [...data.leads, ...data.partnerLeads];
  const activeLead = allLeads.find((lead) => lead.status === "active");
  const warmLead = allLeads.find((lead) => lead.status === "qualified");
  const newLead = allLeads.find((lead) => lead.status === "new");

  if (data.metrics.directPartners > 0) {
    return {
      title: "Den hÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤r veckan",
      items: [
        "VÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤lj en person i fÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶rsta linjen som du aktivt hjÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤lper framÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¥t.",
        "SÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤tt ett enda tydligt mÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¥l fÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶r den personen denna vecka.",
        "FÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶lj upp utfallet innan du sprider fokus vidare.",
      ],
    };
  }

  if (data.customers.length > 0 || data.metrics.directPartners > 0) {
    return {
      title: "Den hÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤r veckan",
      items: [
        "Upprepa samma aktivitet som gav ditt fÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶rsta resultat.",
        "Fokusera pÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¥ ett andra resultat innan du breddar fÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶r mycket.",
        "Skydda tempot genom att fÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶lja upp det som redan ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤r igÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¥ng.",
      ],
    };
  }

  if (activeLead) {
    return {
      title: "Den hÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤r veckan",
      items: [
        `Driv dialogen med ${activeLead.name} till ett tydligt utfall.`,
        "LÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¥t inte aktiv rÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶relse bli stÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¥ende utan nÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤sta steg.",
        "Prioritera fÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤rre samtal med hÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶gre kvalitet framfÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶r fler lÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶sa kontakter.",
      ],
    };
  }

  if (warmLead) {
    return {
      title: "Den hÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤r veckan",
      items: [
        `FÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶lj upp ${warmLead.name} medan signalen fortfarande ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤r varm.`,
        "FÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶rsÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶k fÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¥ ett tydligt besked i stÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤llet fÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶r att lÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤mna dialogen ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶ppen.",
        "Skriv kort vad nÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤sta steg ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤r direkt efter kontakten.",
      ],
    };
  }

  if (newLead) {
    return {
      title: "Den hÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤r veckan",
      items: [
        `Ta fÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶rsta kontakt med ${newLead.name}.`,
        "Skapa ett enkelt tempo: kontakt fÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶rst, funderingar sen.",
        "Fokusera pÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¥ att fÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¥ ett fÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶rsta svar, inte pÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¥ att gÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶ra allt perfekt.",
      ],
    };
  }

  return {
    title: "Den hÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤r veckan",
    items: [
      "Dela din Omega-lÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤nk i ett sammanhang dÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤r du faktiskt fÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¥r respons.",
      "Sikta pÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¥ en fÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶rsta tydlig signal, inte maximal rÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤ckvidd.",
      "NÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤r fÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶rsta leaden kommer in, fÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶lj upp snabbt samma dag.",
    ],
  };
}

function buildPracticalWorkSuggestions(data: PartnerDashboardData) {
  const allLeads = [...data.leads, ...data.partnerLeads];
  const firstResultReached = data.customers.length > 0 || data.metrics.directPartners > 0;
  const hasWarmDialog = allLeads.some((lead) => lead.status === "qualified" || lead.status === "active");

  if (data.metrics.directPartners > 0) {
    return {
      title: "Praktiskt arbetssÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤tt",
      items: [
        "Ta ett kort avstÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤mningssamtal med din nÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤rmaste partner och hjÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤lp personen att vÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤lja en enda nÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤sta aktivitet.",
        "Bjud hellre in till ett gemensamt Zoom-call ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤n att fÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶rsÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶ka fÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶rklara allt sjÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤lv i lÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¥nga meddelanden.",
        "Be personen bÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶rja nÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤ra sitt eget nÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤tverk och fÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶lj upp direkt efter fÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶rsta kontakterna.",
      ],
    };
  }

  if (firstResultReached || hasWarmDialog) {
    return {
      title: "Praktiskt arbetssÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤tt",
      items: [
        "FÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶lj upp medan dialogen fortfarande lever och fÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶rsÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶k fÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¥ ett tydligt nÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤sta steg i stÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤llet fÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶r lÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶sa svar.",
        "NÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤r intresse finns, bjud hellre vidare till samtal eller Zoom ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤n att skriva lÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤ngre och lÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤ngre fÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶rklaringar.",
        "Skriv kort efter varje kontakt vad som ska hÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤nda hÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤rnÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤st, sÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¥ att tempot inte tappas bort.",
      ],
    };
  }

  return {
    title: "Praktiskt arbetssÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤tt",
    items: [
      "BÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶rja nÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤ra. VÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤lj nÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¥gra personliga kontakter dÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤r det redan finns fÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶rtroende, i stÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤llet fÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶r att skriva till alla.",
      "AnvÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤nd sociala medier fÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶r att vÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤cka nyfikenhet och fortsÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤tt sedan i dialog med dem som faktiskt svarar.",
      "NÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤r nÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¥gon visar intresse, bjud vidare till samtal eller Zoom i stÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤llet fÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶r att fÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶rsÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶ka bÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤ra hela fÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶rklaringen sjÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤lv.",
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
      title: "SÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¥ duplicerar du vidare",
      description: "Nu handlar det inte bara om din egen aktivitet, utan om att hjÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤lpa fÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶rsta linjen att arbeta pÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¥ samma sÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤tt.",
      cards: [
        {
          title: "Personliga kontakter",
          summary: "Be partnern bÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶rja nÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤ra sitt eget nÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤tverk dÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤r fÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶rtroende redan finns.",
          action: "LÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¥t personen vÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤lja nÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¥gra namn i sin nÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤rhet innan ni breddar vidare.",
        },
        {
          title: "Sociala medier",
          summary: "AnvÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤nd sociala medier fÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶r att ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶ppna dÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶rrar, inte fÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶r att bÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤ra hela fÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶rklaringen.",
          action: "Be partnern fÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶lja upp dem som faktiskt svarar i stÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤llet fÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶r att jaga rÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤ckvidd.",
        },
        {
          title: "Zoom eller samtal",
          summary: "NÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤r intresset ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤r tydligt ska ni snabbare vidare till gemensamt samtal eller Zoom.",
          action: "Bjud hellre in till ett nÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤sta steg ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤n att fÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶rklara allt i text.",
        },
        {
          title: hasSponsor ? "StÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶d uppÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¥t och nedÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¥t" : "StÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶d frÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¥n Omega Balance-teamet",
          summary: hasSponsor
            ? `Du hjÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤lper nedÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¥t och tar samtidigt hjÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤lp av ${data.sponsor?.name} uppÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¥t nÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤r det behÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶vs.`
            : "Du hjÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤lper din fÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶rsta linje vidare och tar samtidigt stÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶d direkt frÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¥n Omega Balance-teamet nÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤r det behÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶vs.",
          action: "HÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¥ll stÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶det nÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤ra nÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤sta aktivitet, inte som allmÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤n pepp eller teori.",
        },
      ],
    };
  }

  if (firstResultReached || hasWarmDialog) {
    return {
      title: "SÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¥ bygger du vidare",
      description: "Du har redan rÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶relse. NÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤sta steg ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤r att gÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶ra arbetssÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤ttet tydligt och upprepningsbart.",
      cards: [
        {
          title: "Personliga kontakter",
          summary: "BÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶rja med personer dÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤r du naturligt kan ta nÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤sta kontakt utan att det kÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤nns krystat.",
          action: "VÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤lj hellre nÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¥gra relevanta kontakter ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤n att skriva till mÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¥nga samtidigt.",
        },
        {
          title: "Sociala medier",
          summary: "LÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¥t sociala medier vÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤cka nyfikenhet, men ta dialogen vidare dÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤r riktig respons finns.",
          action: "Svara snabbt dÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤r nÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¥gon visar intresse i stÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤llet fÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶r att sprida energin fÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶r brett.",
        },
        {
          title: "Zoom eller samtal",
          summary: "NÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤r frÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¥gorna blir fler ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤n ett par meddelanden ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤r det oftast dags fÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶r samtal.",
          action: "Flytta dialogen till Zoom eller telefon nÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤r du mÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤rker att intresset ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤r pÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¥ riktigt.",
        },
        {
          title: hasSponsor ? "Ta hjÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤lp uppÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¥t" : "Ta stÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶d frÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¥n Omega Balance-teamet",
          summary: hasSponsor
            ? `Du behÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶ver inte bÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤ra allt sjÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤lv. Ta hjÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤lp av ${data.sponsor?.name} eller din up-line nÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤r du kÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶r fast.`
            : "Du behÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶ver inte bÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤ra allt sjÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤lv. Ta stÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶d av Omega Balance-teamet nÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤r du kÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶r fast eller vill gÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶ra nÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤sta steg tydligare.",
          action: "Be om hjÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤lp nÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤r det kan ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶ka kvaliteten i ett samtal eller nÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤sta steg.",
        },
      ],
    };
  }

  return {
    title: "SÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¥ kommer du igÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¥ng",
    description: "Det fÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶rsta arbetssÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤ttet ska vara enkelt nog att upprepa och tydligt nog att kÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤nnas naturligt.",
    cards: [
      {
        title: "Personliga kontakter",
        summary: "BÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶rja nÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤ra med nÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¥gra personer dÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤r det redan finns fÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶rtroende.",
        action: "TÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤nk familj, vÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤nner, tidigare kollegor eller andra du kan kontakta utan att det kÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤nns konstlat.",
      },
      {
        title: "Sociala medier",
        summary: "AnvÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤nd sociala medier fÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶r att skapa nyfikenhet, inte fÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶r att jaga alla samtidigt.",
        action: "LÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤gg energi pÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¥ dem som svarar eller visar verkligt intresse.",
      },
      {
        title: "Zoom eller samtal",
        summary: "Du behÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶ver inte fÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶rklara allt sjÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤lv i text frÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¥n bÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶rjan.",
        action: "NÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤r intresse finns, bjud vidare till ett samtal eller Zoom i stÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤llet fÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶r att skriva lÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤ngre meddelanden.",
      },
      {
        title: hasSponsor ? "Ta hjÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤lp uppÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¥t" : "StÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶d frÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¥n Omega Balance-teamet",
        summary: hasSponsor
          ? "NÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤r du kÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶r fast ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤r nÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤sta steg ofta att ta hjÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤lp av din up-line."
          : "NÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤r du kÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶r fast ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤r nÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤sta steg ofta att ta stÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶d direkt frÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¥n Omega Balance-teamet i stÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤llet fÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶r att tveka fÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶r lÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤nge sjÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤lv.",
        action: "Be om hjÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤lp nÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤r du har en verklig kontakt i gÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¥ng eller vill gÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶ra nÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤sta steg tydligare.",
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
      title: "Duplicering bÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶rjar sÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¥ hÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤r",
      items: [
        "Bygg fÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶rst din egen rytm tills du vet vad som faktiskt fungerar i praktiken.",
        "Spara kort vad du sÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤ger i fÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶rsta kontakt, hur du fÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶ljer upp och nÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤r du bjuder vidare till samtal eller Zoom.",
        hasSponsor
          ? "NÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤r nÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¥got bÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶rjar fungera, stÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤m av med din up-line hur samma arbetssÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤tt kan gÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶ras enklare att upprepa."
          : "NÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤r nÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¥got bÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶rjar fungera, hÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¥ll arbetssÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤ttet enkelt nog att upprepa innan du fÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶rsÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶ker bredda det.",
      ],
    };
  }

  return {
    title: "Din dupliceringsrytm",
    items: [
      nearestDownline
        ? `Fokusera denna vecka pÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¥ att hjÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤lpa ${nearestDownline.partnerName} till ett enda tydligt nÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤sta steg.`
        : "Fokusera denna vecka pÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¥ din nÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤rmaste first line och hÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¥ll stÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶det nÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤ra nÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤sta aktivitet.",
      "AnvÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤nd gemensamt samtal eller Zoom nÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤r det hÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶jer kvaliteten, i stÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤llet fÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶r att skriva lÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤ngre fÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶rklaringar i efterhand.",
      hasSponsor
        ? `NÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤r ni kÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶r fast, lyft lÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤get kort till ${data.sponsor?.name} med vad som redan ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤r gjort och vad nÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤sta hinder faktiskt ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤r.`
        : "NÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤r ni kÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶r fast, lyft bara det som behÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶ver nÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤sta nivÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¥ av stÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶d och hÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¥ll resten nÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤ra vardagsarbetet.",
    ],
  };
}

function buildLeadQueueSummary(leads: Lead[]) {
  const urgent = leads.filter((lead) => lead.status === "new" || lead.status === "qualified").length;
  const active = leads.filter((lead) => lead.status === "active").length;
  const newLeads = leads.filter((lead) => lead.status === "new").length;
  const done = leads.filter((lead) => lead.status === "won").length;

  return [
    { label: "BrÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¥dskande nu", value: urgent },
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
    { label: "Ta i dag", value: takeToday, note: "Nya kontakter som bÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶r fÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¥ fÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶rsta svar snabbt." },
    { label: "FÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶lj upp nu", value: followUpNow, note: "Varmare dialoger som inte bÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤r tappa fart." },
    { label: "HÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¥ll levande", value: activeDialogs, note: "Aktiva samtal som behÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶ver nÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤sta steg, inte bara vÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤ntan." },
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
      label: "FÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶rsta aktivitet",
      description: "Ett lead eller en fÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶rsta signal har skapats.",
      done: hasLead,
      current: !hasLead,
    },
    {
      label: "Respons",
      description: "En dialog har kommit igÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¥ng och ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤r redo fÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶r tydlig uppfÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶ljning.",
      done: hasResponse,
      current: hasLead && !hasResponse,
    },
    {
      label: "FÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶rsta resultat",
      description: "En kundsignal eller tydlig partnerreaktion finns.",
      done: hasResult,
      current: hasResponse && !hasResult,
    },
    {
      label: "NÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤sta fas",
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
    { label: "GodkÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤nn portalvillkor och integritet", done: legalAccepted },
    { label: "LÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤gg in dina tre ZZ-lÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤nkar", done: zzLinksReady },
    { label: "Dela din referral-lÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤nk", done: data.partner.referral_code.length > 0 },
    { label: "Skapa fÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶rsta kundsignal", done: customerLeads > 0 || customers > 0 },
    { label: "Skapa fÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶rsta partnerintresse", done: partnerLeads > 0 },
    { label: "FÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¥ fÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶rsta direkta partnerkontakt", done: directPartners > 0 },
  ];

  const completedMilestones = checklist.filter((item) => item.done).length;
  const encouragement =
    completedMilestones === 0
      ? "Du ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤r hÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤r och tittar in i portalen. Det i sig ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤r en bra bÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶rjan."
      : completedMilestones === 1
        ? "Bra start. Du har redan tagit fÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶rsta riktiga steget."
        : completedMilestones === 2
          ? "Snyggt jobbat. Du bygger faktiskt grunden, inte bara tÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤nker pÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¥ den."
          : completedMilestones === 3
            ? "Det hÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤r bÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶rjar ta form pÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¥ riktigt. Du har redan flera viktiga bitar pÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¥ plats."
            : completedMilestones === 4
              ? "Starkt. Du har kommit fÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶rbi startstrÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤ckan och bÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶rjar skapa riktig rÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶relse."
              : completedMilestones === 5
                ? "Riktigt bra jobbat. Nu mÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤rks det att du bygger nÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¥got som kan upprepas."
                : "Mycket fint jobbat. Du har tagit dig lÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¥ngt och bygger nu vidare frÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¥n en stark grund.";

  if (!legalAccepted) {
    return {
      stageLabel: "BekrÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤fta grunden",
      summary: "Innan du arbetar vidare i portalen behÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶ver villkor och integritet vara godkÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤nda.",
      nextMilestone: "GodkÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤nda portalvillkor och integritet",
      nextBestAction: "LÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤s igenom dokumenten, bekrÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤fta att du fÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶rstÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¥tt upplÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤gget och slutfÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶r godkÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤nnandet.",
      encouragement,
      checklist,
    };
  }

  if (!zzLinksReady) {
    return {
      stageLabel: "LÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤gg grunden",
      summary: "Innan du driver trafik eller fÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶ljer upp leads behÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶ver test-, shop- och partnerlÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤nken finnas pÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¥ plats.",
      nextMilestone: "Tre Zinzino-destinationer sparade",
      nextBestAction: "GÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¥ till LÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤nkar och lÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤gg in dina tre personliga ZZ-lÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤nkar innan du bÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶rjar arbeta externt.",
      encouragement,
      checklist,
    };
  }

  if (customers === 0 && customerLeads === 0 && partnerLeads === 0 && directPartners === 0) {
    return {
      stageLabel: "Kom igÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¥ng",
      summary: "Fokus just nu ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤r att skapa fÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶rsta riktiga rÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶relsen, inte att gÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶ra allt samtidigt.",
      nextMilestone: "FÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶rsta kundsignal eller fÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶rsta partnerintresse",
      nextBestAction: "Dela din lÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤nk och fokusera pÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¥ att fÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¥ din fÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶rsta kund eller ditt fÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶rsta partnerlead.",
      encouragement,
      checklist,
    };
  }

  if (customers === 0 && customerLeads <= 1 && partnerLeads <= 1 && directPartners === 0) {
    return {
      stageLabel: "FÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶rsta resultat",
      summary: "Du har bÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶rjat rÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶ra dig. Nu gÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤ller det att visa att det inte bara var ett enstaka fÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶rsÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶k.",
      nextMilestone: "Ett andra resultat i samma riktning",
      nextBestAction: "Upprepa det som gav fÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶rsta signalen och hÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¥ll fokus pÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¥ samma typ av aktivitet nÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¥gra dagar till.",
      encouragement,
      checklist,
    };
  }

  if (directPartners === 0) {
    return {
      stageLabel: "Bygg upprepad aktivitet",
      summary: "Du har flera signaler igÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¥ng, men allt bygger fortfarande mest pÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¥ din egen aktivitet.",
      nextMilestone: "FÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶rsta direkta partnerkontakt eller tydlig first-line-signal",
      nextBestAction: "FortsÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤tt skapa kund- och partnerintresse, men bÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶rja styra fokus mot att fÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¥ in din fÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶rsta direkta partnerkontakt.",
      encouragement,
      checklist,
    };
  }

  if (directPartners > 0 && partnerLeads + customerLeads + customers < 4) {
    return {
      stageLabel: "Aktivera first line",
      summary: "Du ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤r inte lÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤ngre helt sjÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤lv i flÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶det. NÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤sta steg ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤r att hjÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤lpa fÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶rsta linjen att bÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶rja rÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶ra sig.",
      nextMilestone: "FÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶rsta tydliga signalen frÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¥n first line",
      nextBestAction: "HjÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤lp din fÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶rsta partner att fÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¥ sitt fÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶rsta lead eller sin fÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶rsta kundsignal i stÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤llet fÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶r att bara producera sjÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤lv.",
      encouragement,
      checklist,
    };
  }

  return {
    stageLabel: "Tidig duplicering",
    summary: "Det finns tidiga signaler pÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¥ att arbetet bÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶rjar upprepa sig genom andra. Nu handlar det om stabilitet, inte bara fart.",
    nextMilestone: "Fler ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¥terkommande signaler frÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¥n first line",
    nextBestAction: "Skydda det som fungerar och hjÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤lp fler i fÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶rsta linjen att upprepa samma beteende.",
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
      title: "Steg 1: Kom igÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¥ng sjÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤lv",
      description: "LÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤gg grunden fÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶rst. DÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¥ blir resten enklare att upprepa.",
      target: "Legal, lÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤nkar och din egen Omega-lÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤nk ska vara pÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¥ plats.",
      reward: "Bra jobbat. Nu har du din egen grund pÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¥ plats.",
      done: ownFoundationReady,
    },
    {
      id: "customers",
      title: "Steg 2: FÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¥ dina fÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶rsta kunder",
      description: "Skapa fÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶rsta riktiga rÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶relsen med din lÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤nk och nÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¥gra tydliga kundsignaler.",
      target: firstCustomersReached
        ? `${customerSignals} kundsignaler skapade hittills.`
        : "MÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¥let ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤r att fÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¥ in din fÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶rsta kundsignal och bÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶rja bygga en liten stabil kundbas.",
      reward: "Snyggt. Nu har du bevis pÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¥ att modellen gÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¥r att sÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤tta i rÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶relse.",
      done: firstCustomersReached,
    },
    {
      id: "start-two",
      title: "Steg 3: HjÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤lp tvÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¥ personer att komma igÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¥ng",
      description: "Nu bÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶rjar dupliceringen. NÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤sta nivÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¥ ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤r att du inte bara bygger sjÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤lv.",
      target: twoStarted
        ? `${Math.max(data.metrics.directPartners, partnerSignals)} partnerstarter eller partnersignaler finns redan.`
        : "MÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¥let ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤r att hjÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤lpa tvÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¥ personer till en fÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶rsta tydlig start via ditt flÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶de.",
      reward: "Bra dÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤r. Nu bygger du inte bara sjÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤lv, du bÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶rjar bygga vidare genom andra.",
      done: twoStarted,
    },
    {
      id: "activate-two",
      title: "Steg 4: HjÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤lp dina tvÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¥ att fÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¥ fart",
      description: "Nu gÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤ller det att hjÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤lpa de fÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶rsta vidare sÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¥ att arbetet kan upprepas utan att allt hÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤nger pÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¥ dig.",
      target: firstLineMoving
        ? "Det finns tydliga first-line-signaler att bygga vidare pÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¥."
        : "MÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¥let ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤r att dina tvÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¥ fÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶rsta inte bara startar, utan bÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶rjar fÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¥ egen rÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶relse.",
      reward: "Starkt jobbat. Nu har du byggt en riktig startmotor, inte bara en engÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¥ngsinsats.",
      done: firstLineMoving,
    },
  ];

  const currentStepIndex = steps.findIndex((step) => !step.done);

  return {
    launchDay,
    daysLeft,
    completedSteps: steps.filter((step) => step.done).length,
    totalSteps: steps.length,
    currentTitle: currentStepIndex === -1 ? "Fast Start genomfÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶rd" : steps[currentStepIndex].title,
    currentFocus:
      currentStepIndex === -1
        ? "Nu handlar det om att upprepa det som fungerar och hjÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤lpa fler i din fÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶rsta linje framÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¥t."
        : steps[currentStepIndex].description,
    momentumMessage:
      currentStepIndex <= 0
        ? "En sak i taget. Grunden fÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶rst, tempo sedan."
        : currentStepIndex === 1
          ? "Bra jobbat. Nu har du en grund att bygga riktiga kundsignaler ovanpÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¥."
          : currentStepIndex === 2
            ? "Nu bÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶rjar det bli en verksamhet, inte bara en egen aktivitet."
            : currentStepIndex === 3
              ? "Nu flyttas fokus frÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¥n din egen fart till hur vÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤l du hjÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤lper andra i gÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¥ng."
              : "Snyggt jobbat. Nu kan du bÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶rja bygga vidare med mycket bÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤ttre rytm.",
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
      statusTitle: "Level 2 ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã…â€œ FÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶rsta signal",
      statusBody: "Din lÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤nk anvÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤nds. Nu gÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤ller det att bygga vidare medan tempot finns kvar.",
      nextGoal: "NÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤sta mÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¥l: fÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶rsta resultat",
      actionTitle: "Skicka din lÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤nk till 1 person till",
      actionBody: "Du har redan rÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶relse. Nu vill vi fÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¥ den att upprepa sig snabbt.",
      actionLabel: "Kopiera min lÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤nk",
      actionMode: "copy-link" as const,
      helper: [
        "nÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¥gon som redan visat lite intresse",
        "nÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¥gon som brukar svara dig",
        "nÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¥gon som vill fÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶rstÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¥ sin hÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤lsa bÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤ttre",
      ],
      liveTitle: "Det hÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤r hÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤nder just nu",
      liveBody: visits === 1 ? "1 person har klickat pÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¥ din lÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤nk." : `${visits} personer har klickat pÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¥ din lÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤nk.`,
      liveMeta: "Du ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤r nÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤ra ditt fÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶rsta resultat",
      nextLevelTitle: "NÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤sta nivÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¥",
      nextLevelBody: "NÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤r du fÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¥r ditt fÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶rsta lead eller partnerintresse ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶ppnas nÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤sta steg.",
      momentum: visits > 1 ? `Du har skapat ${visits} signaler hittills` : "Du har fÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¥tt fÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶rsta signalen",
      shareMode: "build" as const,
    };
  }

  if (!duplicationReady || data.metrics.directPartners === 0) {
    return {
      level: 3,
      statusTitle: "Level 3 ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã…â€œ FÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶rsta resultat",
      statusBody: "Du har fÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¥tt din fÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶rsta riktiga signal. Nu ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤r det dags att skapa nÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤sta lilla vinst.",
      nextGoal: "NÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤sta mÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¥l: fÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶rsta kund eller fÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶rsta partnerkontakt",
      actionTitle: "Skicka din lÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤nk till 1 person som kan vilja gÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶ra samma resa",
      actionBody: "Nu fÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¥r du bÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶rja anvÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤nda samma enkla system fÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶r att hitta fÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶rsta duplication-signalen.",
      actionLabel: "Bjud in partner",
      actionMode: "copy-link" as const,
      helper: [
        "nÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¥gon som gillar struktur",
        "nÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¥gon som vill bygga stegvis",
        "nÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¥gon som skulle uppskatta att slippa jaga folk",
      ],
      liveTitle: "Det hÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤r hÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤nder just nu",
      liveBody: partnerSignals > 0
        ? `Du har ${partnerSignals} partnerintresse${partnerSignals > 1 ? "n" : ""} i rÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶relse.`
        : `Du har ${customerSignals} kundsignal${customerSignals > 1 ? "er" : ""} i rÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶relse.`,
      liveMeta: "Nu ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤r du redo att bjuda in din fÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶rsta partner",
      nextLevelTitle: "NÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤sta nivÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¥",
      nextLevelBody: "NÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤r du fÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¥r fÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶rsta partnerkontakt eller fÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶rsta kund lÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¥ser du upp nÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤sta dupliceringssteg.",
      momentum: "Bra jobbat. Nu bygger du pÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¥ ett riktigt resultat.",
      shareMode: "duplicate" as const,
    };
  }

  return {
    level: 4,
    statusTitle: "Level 4 ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã…â€œ Duplication",
    statusBody: "Nu ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤r du igÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¥ng pÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¥ riktigt. Fokus ligger pÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¥ att hjÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤lpa andra gÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶ra samma resa som du.",
    nextGoal: "NÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤sta mÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¥l: fler signaler frÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¥n first line",
    actionTitle: "HjÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤lp en partner till sin fÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶rsta signal idag",
    actionBody: "Nu vinner du genom att hjÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤lpa nÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¥gon annan fÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¥ fart, inte genom att bara producera mer sjÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤lv.",
    actionLabel: "ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Å“ppna leads",
    actionMode: "leads" as const,
    helper: [
      "vÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤lj en partner nÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤ra dig",
      "landa i ett enda nÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤sta steg",
      "skapa rÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶relse innan ni pratar teori",
    ],
    liveTitle: "Det hÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤r hÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤nder just nu",
    liveBody: "Det finns redan signaler i systemet. Nu gÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤ller det att hÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¥lla rytmen levande.",
    liveMeta: "Systemet jobbar bÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤st nÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤r du upprepar det som redan fungerar",
    nextLevelTitle: "NÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤sta nivÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¥",
    nextLevelBody: "NÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤sta steg ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤r att fÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¥ fler i fÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶rsta linjen att uppleva samma enkla start.",
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
              title: `HjÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤lp ${data.team[0].partnerName} vidare`,
              summary: "Din nÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤rmaste first line ger stÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶rst hÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤vstÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¥ng just nu om du hÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¥ller stÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶det nÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤ra nÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤sta aktivitet.",
              action: "Ta ett kort avstÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤mningssamtal och landa i ett enda tydligt nÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤sta steg denna vecka.",
            }
          : null,
        {
          key: "up-line-support",
          title: data.sponsor ? `Ta stÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶d av ${data.sponsor.name}` : "Ta stÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶d av Omega Balance-teamet",
          summary: data.sponsor
            ? "NÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤r dialog eller uppfÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶ljning fastnar blir nÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤sta steg ofta lÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤ttare om du tar stÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶d uppÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¥t tidigt."
            : "NÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤r du ligger nÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤ra toppen behÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶ver du inte bÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤ra allt sjÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤lv. Ta stÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶d uppÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¥t sÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¥ fort nÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤sta steg blir oklart.",
          action: "Be om hjÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤lp i skarpa lÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤gen, helst kopplat till en verklig kontakt eller ett konkret nÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤sta steg.",
        },
        {
          key: "duplicate-rhythm",
          title: "Skydda dupliceringsrytmen",
          summary: "Duplicering bÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶rjar nÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤r du hjÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤lper nÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¥gon annan till sitt fÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶rsta tydliga resultat, inte bara nÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤r du sjÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤lv producerar mer.",
          action: data.team.length
            ? "Fokusera pÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¥ en person i taget i din first line tills ni fÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¥tt fÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶rsta tydliga signalen dÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤r."
            : "NÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤r din fÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶rsta direkta partner kommer in, hjÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤lp den personen igÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¥ng innan du fÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶rsÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶ker bredda fÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶r mycket.",
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
        title: firstResultFocus?.title ?? startAction?.title ?? "NÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤sta steg",
        description: firstResultFocus?.reason ?? startAction?.description ?? journey?.nextBestAction ?? "",
        detail: firstResultFocus?.action ?? journey?.nextBestAction ?? startAction?.description ?? "",
        label: startAction?.label ?? "ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Å“ppna leads",
        mode: startAction?.mode ?? ("leads" as const),
      }
    : null;
  const followUpTargets = data
    ? prioritizedLeads.length
      ? prioritizedLeads.map((lead) => ({
          key: lead.id,
          name: lead.name,
          label: lead.type === "partner_lead" ? "Partnerlead" : "Kundlead",
          status: `${getLeadStatusLabel(lead.status)} ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¢ ${getLeadSituationLabel(lead)}`,
          action: getLeadNextAction(lead),
        }))
      : data.team[0]
        ? [
            {
              key: `team-${data.team[0].partnerId}`,
              name: data.team[0].partnerName,
              label: "Direkt partnerkontakt",
              status: "First line",
              action: "Ta en kort avstÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤mning och hjÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤lp personen till ett enda tydligt nÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤sta steg denna vecka.",
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
    message = "Bra. Du ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤r igÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¥ng.\n\nDin lÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤nk ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤r nu aktiv.\n\nNÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤sta steg ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤r fÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶rsta signal.\n\nVill du ta nÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤sta steg direkt: skicka den till 1 person du redan har kontakt med.",
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
              Du tittar p\u00e5 partnervyn som admin. Den h\u00e4r sidan anv\u00e4nds f\u00f6r att granska partnerupplevelsen, inte f\u00f6r att \u00e4ndra adminbeh\u00f6righet.
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
                      <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Stegvis vÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤g framÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¥t</p>
                      <p className="mt-2 text-lg font-semibold text-foreground">En sak i taget. NÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤r ett steg ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤r klart ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶ppnas nÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤sta nivÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¥.</p>
                      <p className="mt-2 text-sm leading-6 text-subtle">
                        Vi visar inte allt pÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¥ en gÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¥ng. Fokus ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤r att du ska fÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶rstÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¥ vad som ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤r viktigast nu och kÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤nna momentum nÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤r du gÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¥r vidare.
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
                            {step.status === "done" ? "Klar" : step.status === "current" ? "PÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¥gÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¥r nu" : "NÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤sta nivÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¥"}
                          </Badge>
                        </div>
                        <p className="mt-3 text-sm leading-6 text-subtle">{step.description}</p>
                        <div className="mt-3 rounded-[0.9rem] border border-border/70 bg-white/80 p-3">
                          <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Detta ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤r mÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¥let</p>
                          <p className="mt-2 text-sm text-foreground">{step.target}</p>
                        </div>
                        <div className="mt-3 rounded-[0.9rem] border border-border/70 bg-white/80 p-3">
                          <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">NÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤r det ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤r klart</p>
                          <p className="mt-2 text-sm text-foreground">{step.reward}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              <div className="mt-4 grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
                <div className="rounded-[1.2rem] border border-border/70 bg-white p-4">
                  <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Progress mot fÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶rsta resultat</p>
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
                      Visa mer stÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶d och ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶verblick
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
                          <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">StÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶d fÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶r fÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶rsta linjen</p>
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
                    GÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¥ hit nÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤r du redan har signaler i gÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤ng och vill fÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶lja upp dem vidare.
                  </p>
                  <Button asChild type="button" variant="outline" className="mt-3 inline-flex h-8 max-w-full self-start whitespace-normal rounded-lg px-3 text-sm leading-tight">
                    <Link to="/dashboard/partner/leads">ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶ppna mina leads</Link>
                  </Button>
                </div>
              </div>
            </DashboardSection>
          ) : null}

          {showJourney ? (
            <DashboardSection
              title="Din resa"
              description="Du behÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶ver inte kunna allt frÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¥n start. HÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤r ser du vÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤gen framÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¥t, steg fÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶r steg, sÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¥ att du vet vad som ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤r viktigast nu och vad som kommer senare."
            >
              <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
                <div className="rounded-[1.2rem] border border-border/70 bg-secondary/30 p-5">
                  <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Nu</p>
                  <p className="mt-3 text-2xl font-semibold tracking-tight text-foreground">Kom igÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¥ng</p>
                  <p className="mt-2 text-sm leading-6 text-subtle">
                    Det hÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤r ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤r fÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶rsta fasen. MÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¥let ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤r att fÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¥ grunden pÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¥ plats och skapa fÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶rsta rÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶relsen utan att tÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤nka pÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¥ allt annat samtidigt.
                  </p>
                  <div className="mt-4 space-y-2.5">
                    {[
                      "fÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¥ ordning pÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¥ dina lÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤nkar",
                      "fÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶rstÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¥ vad du delar",
                      "skicka din lÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤nk fÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶rsta gÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¥ngen",
                      "fÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¥ fÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶rsta signalen",
                    ].map((item) => (
                      <div key={item} className="rounded-[1rem] border border-border/70 bg-white/80 px-3.5 py-3">
                        <p className="text-sm text-foreground">{item}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 rounded-[1rem] border border-emerald-300/70 bg-emerald-50 p-3.5">
                    <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Status</p>
                    <p className="mt-2 text-sm font-medium text-foreground">PÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¥gÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¥r nu</p>
                    <p className="mt-2 text-sm text-subtle">Det hÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤r steget lÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¥ser upp fÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶rsta riktiga resultatet.</p>
                  </div>
                </div>

                <div className="grid gap-4">
                  {[
                    {
                      eyebrow: "ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Å“ppnas snart",
                      title: "FÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶rsta resultat",
                      body: "NÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤r du fÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¥tt fÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶rsta signalen handlar nÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤sta fas om att skapa fÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶rsta riktiga utfallet och upprepa det som fungerade.",
                      items: [
                        "fÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¥ fÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶rsta lead eller kundsignal",
                        "se vad som faktiskt fungerar",
                        "upprepa samma beteende en gÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¥ng till",
                        "bygga tro pÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¥ att systemet fungerar",
                      ],
                      note: "Det hÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤r steget gÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶r att du gÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¥r frÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¥n aktivitet till resultat.",
                    },
                    {
                      eyebrow: "NÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤sta nivÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¥",
                      title: "BÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶rja duplicera",
                      body: "NÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤r du sjÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤lv fÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¥tt rÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶relse ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤r nÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤sta steg att hjÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤lpa nÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¥gon annan komma igÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¥ng pÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¥ samma sÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤tt.",
                      items: [
                        "bjuda in rÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤tt person",
                        "hjÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤lpa nÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¥gon till sitt fÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶rsta steg",
                        "skapa fÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶rsta signalen i din nÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤rmaste linje",
                        "bygga nÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¥got som gÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¥r att upprepa",
                      ],
                      note: "Det hÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤r ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤r dÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤r systemet bÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶rjar vÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤xa genom andra, inte bara genom dig.",
                    },
                    {
                      eyebrow: "Senare",
                      title: "Bygg vidare",
                      body: "Senare ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶ppnas mer av affÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤ren och modellen upp, i takt med att det faktiskt blir relevant fÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶r dig.",
                      items: [
                        "kundmotor",
                        "teamrytmer",
                        "fler nivÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¥er",
                        "kompplan och djupare fÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶rstÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¥else",
                        "hur du bygger lÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¥ngsiktigt utan att gÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶ra allt sjÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤lv",
                      ],
                      note: "Du behÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶ver inte bÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤ra allt nu. Det hÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤r ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶ppnas nÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤r du ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤r redo.",
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
                  Du behÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶ver inte ta alla steg i huvudet samtidigt. Det viktiga ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤r att ta rÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤tt nÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤sta steg nu.
                </p>
              </div>
            </DashboardSection>
          ) : null}

          {showLinks ? (
            <DashboardSection
              title="Min Omega-lÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤nk"
              description="LÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤nken du normalt delar vidare."
            >
              <div className="flex flex-col gap-4 rounded-[1.2rem] border border-border/70 bg-secondary/40 p-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">LÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤nken du delar</p>
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
              description="Dina personliga destinationslÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤nkar till Zinzino."
            >
              <div className="mb-4 flex items-center justify-between gap-3 rounded-[1.1rem] border border-border/70 bg-secondary/30 p-4">
                <p className="text-sm leading-6 text-subtle">
                  LÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤gg in och uppdatera dina egna test-, shop- och partnerlÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤nkar hÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤r.
                </p>
                <Button type="button" variant="outline" className="h-8 rounded-lg px-3 text-sm" onClick={openZzLinksDialog}>
                  Redigera mina lÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤nkar
                </Button>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {[
                  { label: "TestlÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤nk", value: data.zzLinks.test },
                  { label: "ShoplÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤nk", value: data.zzLinks.shop },
                  { label: "PartnerlÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤nk", value: data.zzLinks.partner },
                ].map((linkItem) => (
                  <div key={linkItem.label} className="rounded-[1.1rem] border border-border/70 bg-white/95 p-4 shadow-card">
                    <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">{linkItem.label}</p>
                  {linkItem.value ? (
                      <>
                        <p className="mt-3 break-all text-sm text-foreground">{linkItem.value}</p>
                        <p className="mt-2 text-xs leading-5 text-subtle">
                          Detta ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤r din bakomliggande Zinzino-lÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤nk. Dela normalt din Omega-lÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤nk ovan och anvÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤nd denna nÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤r du behÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶ver gÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¥ direkt.
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
              <MetricCard label="Mina leads" value={data.metrics.leads} helper="Alla leads dÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤r du ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤r attribuerad partner." icon={<Link2 className="h-5 w-5" />} />
              <MetricCard label="Partnerleads" value={data.metrics.partnerLeads} helper="Nya intresseanmÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤lningar fÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶r partnerskap." icon={<UserPlus2 className="h-5 w-5" />} />
              <MetricCard label="Mina kunder" value={data.metrics.customers} helper="Kunder som hittills kopplats till dig." icon={<Users className="h-5 w-5" />} />
              <MetricCard label="Direkta kontakter" value={data.metrics.directPartners} helper="Direkta partnerkontakter som kommit in via dig." icon={<Users className="h-5 w-5" />} />
            </div>
          ) : null}

          {showLeads ? (
            <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
              <DashboardSection title="Mina leads" description="BÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¥de kundleads och partnerleads sparas med din attribution.">
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
                    { value: "urgent", label: "BrÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¥dskande" },
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
                  columns={["Namn", "Typ", "LÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤ge", "BrÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¥dskande", "NÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤sta steg", "Senast aktiv"]}
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
                    <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Ta fÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶rst bland kundleads</p>
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
                      <p className="text-sm text-subtle">Inga kundleads ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤nnu. Fokusera fÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶rst pÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¥ att skapa fÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶rsta kundsignalen.</p>
                    )}
                  </div>
                </div>
              </DashboardSection>

              {showLeads ? (
                <DashboardSection title="FÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶rst att fÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶lja upp" description="Systemet lyfter de leads som just nu ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤r mest relevanta fÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶r att fÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¥ fÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶rsta rÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶relse eller fÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶rsta resultat.">
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
                                BrÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¥dskande: {getLeadUrgencyLabel(lead)}
                              </Badge>
                            </div>
                            <p className="mt-3 text-sm text-foreground">{getLeadNextAction(lead)}</p>
                            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-subtle">
                              <span>{lead.type === "partner_lead" ? "Partnerlead" : "Kundlead"}</span>
                          <span>ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¢</span>
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
              description="HÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤r ser du var din trafik faktiskt visar liv just nu. Det hjÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤lper dig fÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶rstÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¥ vilka marknader som svarar pÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¥ din lÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤nk."
            >
              <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-[0.9fr_0.9fr_1.2fr]">
                <div className="rounded-[1.2rem] border border-border/70 bg-secondary/20 p-4">
                  <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">TopplÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤nder</p>
                  <div className="mt-3 space-y-2">
                    {(data.marketInsights?.topCountries || []).map((row) => (
                      <div key={`partner-country-${row.label}`} className="flex items-center justify-between gap-3 text-sm">
                        <span className="truncate text-foreground">{row.label}</span>
                        <span className="font-medium text-foreground">{formatWholeNumber(row.visits)}</span>
                      </div>
                    ))}
                    {!data.marketInsights?.topCountries?.length ? <p className="text-sm text-subtle">Ingen marknadssignal ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤n.</p> : null}
                  </div>
                </div>

                <div className="rounded-[1.2rem] border border-border/70 bg-secondary/20 p-4">
                  <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">ToppstÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤der</p>
                  <div className="mt-3 space-y-2">
                    {(data.marketInsights?.topCities || []).map((row) => (
                      <div key={`partner-city-${row.label}`} className="flex items-center justify-between gap-3 text-sm">
                        <span className="truncate text-foreground">{row.label}</span>
                        <span className="font-medium text-foreground">{formatWholeNumber(row.visits)}</span>
                      </div>
                    ))}
                    {!data.marketInsights?.topCities?.length ? <p className="text-sm text-subtle">Ingen stadsdata ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤n.</p> : null}
                  </div>
                </div>

                <div className="rounded-[1.2rem] border border-border/70 bg-white/95 p-4 shadow-card lg:col-span-2 xl:col-span-1">
                  <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Senaste geotrÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤ffar</p>
                  <div className="mt-4">
                    <DataTable
                      columns={["Senast", "Land", "Stad"]}
                      rows={(data.marketInsights?.recentLocations || []).map((row) => [
                        <span key={`${row.created_at}-time`} className="font-medium text-foreground">{formatDate(row.created_at)}</span>,
                        <span key={`${row.created_at}-country`}>{row.country || "-"}</span>,
                        <span key={`${row.created_at}-city`}>{row.city || "-"}</span>,
                      ])}
                      emptyState="Ingen geodata registrerad fÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶r din trafik ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤nnu."
                    />
                  </div>
                  <div className="mt-4 rounded-[1rem] border border-border/70 bg-secondary/20 p-3.5 text-sm text-subtle">
                    Land ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤r oftast sÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤krare ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤n stad. Se stad som signal, inte exakt sanning.
                  </div>
                </div>
              </div>
            </DashboardSection>
          ) : null}

          {showCustomers ? (
            <DashboardSection title="Kundsignaler" description="Kundrelationer som hittills kopplats till dig via systemet. Detta ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤r inte officiell ZZ-utbetalning eller kompensation.">
              <div className="rounded-[1.2rem] border border-border/70 bg-accent/50 p-4">
                <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Attribuerade kunder</p>
                <p className="mt-3 font-serif text-4xl font-semibold tracking-tight text-foreground">
                  {new Intl.NumberFormat("sv-SE", { maximumFractionDigits: 0 }).format(data.customers.length)}
                </p>
                <p className="mt-2 text-sm leading-6 text-subtle">
                  Tidiga kommersiella signaler runt ditt flÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶de, inte payout eller bonus.
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
                  emptyState="Inga attribuerade kunder ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤nnu."
                />
              </div>
            </DashboardSection>
          ) : null}

          {showLeads || showNetwork ? (
            <div className="grid gap-8 lg:grid-cols-2">
              {showLeads ? (
                <DashboardSection title="Mina partnerleads" description="HÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤r ser du partnerintresse och vad du bÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶r gÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶ra hÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤rnÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤st.">
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
                      { value: "urgent", label: "BrÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¥dskande" },
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
                    columns={["SÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶kande", "KÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤lla", "LÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤ge", "BrÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¥dskande", "NÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤sta steg", "Senast aktiv"]}
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
                    <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Ta fÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶rst bland partnerleads</p>
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
                        <p className="text-sm text-subtle">Inga partnerleads ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤nnu. Fokusera fÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶rst pÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¥ att skapa fÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶rsta partnersignalen.</p>
                      )}
                    </div>
                  </div>
                </DashboardSection>
              ) : null}

              {showNetwork ? (
                <DashboardSection title="Direkta partnerkontakter" description="Personer du har bjudit in eller fÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¥tt in i ditt nÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤rmaste partnerled. SjÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤lva placeringen och ranken hanteras i Zinzino.">
                  <div className="mb-4 grid gap-3 lg:grid-cols-2">
                    <div className="rounded-[1.1rem] border border-border/70 bg-secondary/20 p-4">
                      <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Vem hjÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤lper dig nu</p>
                      {data.sponsor ? (
                        <>
                          <p className="mt-3 text-sm font-medium text-foreground">{data.sponsor.name}</p>
                          <p className="mt-1 text-sm text-subtle">{data.sponsor.email}</p>
                          <p className="mt-3 text-sm leading-6 text-subtle">
                            Om du fastnar i nÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤sta steg ska du i fÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶rsta hand ta hjÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤lp av din nÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤rmaste up-line.
                          </p>
                        </>
                      ) : (
                        <p className="mt-3 text-sm leading-6 text-subtle">
                          Du ligger nÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤ra toppen i den hÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤r modellen. Det betyder att stÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶det uppÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¥t frÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤mst kommer direkt frÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¥n Omega Balance-teamet.
                        </p>
                      )}
                    </div>

                    <div className="rounded-[1.1rem] border border-border/70 bg-secondary/20 p-4">
                      <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Vem ska du hjÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤lpa nu</p>
                      {data.team.length ? (
                        <>
                          <p className="mt-3 text-sm font-medium text-foreground">{data.team[0].partnerName}</p>
                          <p className="mt-1 text-sm text-subtle">{data.team[0].email}</p>
                          <p className="mt-3 text-sm leading-6 text-subtle">
                            BÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶rja med din nÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤rmaste downline och hjÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤lp den personen till sitt fÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶rsta tydliga steg innan du breddar stÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶det.
                          </p>
                        </>
                      ) : (
                        <p className="mt-3 text-sm leading-6 text-subtle">
                          NÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤r du fÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¥r in din fÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶rsta direkta partner bÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶rjar dupliceringen hÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤r. DÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¥ ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤r nÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤sta steg att hjÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤lpa den personen igÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¥ng.
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
                    columns={["Partner", "NivÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¥", "Tillagd"]}
                    rows={data.team.map((member) => [
                      <div key={`${member.partnerId}-member`}>
                        <p className="font-medium text-foreground">{member.partnerName}</p>
                        <p className="text-xs text-subtle">{member.email}</p>
                      </div>,
                      <Badge key={`${member.partnerId}-level`} variant="secondary" className="rounded-full px-3 py-1">
                        NivÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¥ {member.level}
                      </Badge>,
                      <span key={`${member.partnerId}-joined`}>{formatDate(member.createdAt)}</span>,
                    ])}
                    emptyState="Inga direkta partnerkontakter ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤nnu."
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
