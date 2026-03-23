import type {
  AppUser,
  ConfidenceLevel,
  Customer,
  GrowthCompassConfidence,
  Lead,
  MetricConfidence,
  PartnerRelationship,
  ReferralVisit,
} from "@/lib/omega-types";

export type PartnerDataBundle = {
  partnerId: string;
  now?: Date;
  windowDays?: number;
  users: AppUser[];
  partnerRecords: Array<{
    id: string;
    user_id: string;
    referral_code?: string | null;
    status?: string | null;
    created_at: string;
  }>;
  leads: Lead[];
  customers: Customer[];
  partnerRelationships: PartnerRelationship[];
  referralVisits: ReferralVisit[];
  outboundClicks: OutboundClickSignal[];
};

export type OutboundClickSignal = {
  id: string;
  partner_id?: string | null;
  referral_code?: string | null;
  session_id?: string | null;
  destination_type?: string | null;
  created_at: string;
};

export type PartnerProgressInput = {
  personalCustomers30d: number;
  recruitedPartners30d: number;
  activeFirstLinePartners30d: number;
  partnerGeneratedLeads30d: number;
  partnerGeneratedCustomers30d: number;
};

export type MappedGrowthCompassResult = {
  input: PartnerProgressInput;
  confidence: GrowthCompassConfidence;
};

const DAYS_MS = 24 * 60 * 60 * 1000;

function isWithinWindow(value: string | null | undefined, now: Date, windowDays: number) {
  if (!value) {
    return false;
  }

  const time = new Date(value).getTime();
  if (Number.isNaN(time)) {
    return false;
  }

  const diffDays = (now.getTime() - time) / DAYS_MS;
  return diffDays >= 0 && diffDays <= windowDays;
}

function uniq<T>(items: T[]) {
  return [...new Set(items)];
}

function hasIdentitySignal(lead: Lead) {
  return Boolean(lead.email || lead.phone);
}

function isQualifiedCustomerLead(lead: Lead) {
  const isCustomerLead = lead.lead_type === "customer" || lead.type === "customer_lead";
  const qualifiedLike = lead.status === "qualified" || lead.status === "active" || lead.status === "won";
  return isCustomerLead && qualifiedLike && hasIdentitySignal(lead);
}

function getFirstLinePartnerIds(partnerId: string, relationships: PartnerRelationship[]) {
  return uniq(
    relationships
      .filter((relationship) => relationship.sponsor_user_id === partnerId)
      .map((relationship) => relationship.partner_user_id),
  );
}

function getAllDownlinePartnerIds(partnerId: string, relationships: PartnerRelationship[]) {
  const result = new Set<string>();
  const queue = [partnerId];

  while (queue.length > 0) {
    const current = queue.shift();
    if (!current) {
      continue;
    }

    const children = relationships
      .filter((relationship) => relationship.sponsor_user_id === current)
      .map((relationship) => relationship.partner_user_id);

    for (const child of children) {
      if (!result.has(child)) {
        result.add(child);
        queue.push(child);
      }
    }
  }

  result.delete(partnerId);
  return [...result];
}

function getPartnerRecordIdsForUser(userId: string, partnerRecords: PartnerDataBundle["partnerRecords"]) {
  return partnerRecords.filter((record) => record.user_id === userId).map((record) => record.id);
}

function getOverallConfidence(metrics: GrowthCompassConfidence["metrics"]): ConfidenceLevel {
  const levels = Object.values(metrics).map((metric) => metric.level);
  const highCount = levels.filter((level) => level === "high").length;
  const mediumCount = levels.filter((level) => level === "medium").length;
  const lowCount = levels.filter((level) => level === "low").length;

  if (highCount >= 3 && lowCount === 0) {
    return "high";
  }

  if (lowCount >= 3) {
    return "low";
  }

  if (highCount === 0 && mediumCount <= 2) {
    return "low";
  }

  return "medium";
}

function high(reasons: string[]): MetricConfidence {
  return { level: "high", reasons };
}

function medium(reasons: string[]): MetricConfidence {
  return { level: "medium", reasons };
}

function low(reasons: string[]): MetricConfidence {
  return { level: "low", reasons };
}

function countPersonalCustomers30d(data: PartnerDataBundle, now: Date, windowDays: number) {
  const directPartnerRecordIds = getPartnerRecordIdsForUser(data.partnerId, data.partnerRecords);
  const directCustomers = uniq(
    data.customers
      .filter((customer) => customer.referred_by_user_id === data.partnerId)
      .filter((customer) => isWithinWindow(customer.created_at, now, windowDays))
      .map((customer) => customer.email || customer.id),
  );

  if (directCustomers.length > 0) {
    return {
      value: directCustomers.length,
      confidence: high(["Based on attributed customer rows within the rolling window."]),
    };
  }

  const directQualifiedCustomerLeads = uniq(
    data.leads
      .filter((lead) => lead.referred_by_user_id === data.partnerId)
      .filter((lead) => isWithinWindow(lead.created_at, now, windowDays))
      .filter(isQualifiedCustomerLead)
      .map((lead) => lead.email || lead.phone || lead.id),
  );

  if (directQualifiedCustomerLeads.length > 0) {
    return {
      value: directQualifiedCustomerLeads.length,
      confidence: medium(["Fallback based on qualified customer leads with identity signal."]),
    };
  }

  const directQualifiedClicks = uniq(
    data.outboundClicks
      .filter((click) => click.partner_id && directPartnerRecordIds.includes(click.partner_id))
      .filter((click) => isWithinWindow(click.created_at, now, windowDays))
      .filter((click) => click.destination_type === "shop" || click.destination_type === "test")
      .map((click) => click.session_id || click.id),
  );

  if (directQualifiedClicks.length > 0) {
    return {
      value: directQualifiedClicks.length,
      confidence: low(["Fallback based on outbound clicks to shop/test, not verified customer conversion."]),
    };
  }

  return {
    value: 0,
    confidence: low(["No attributed customer or qualified customer-lead signal found in the current window."]),
  };
}

function countRecruitedPartners30d(data: PartnerDataBundle, now: Date, windowDays: number) {
  const recruitedPartnerIds = getFirstLinePartnerIds(data.partnerId, data.partnerRelationships).filter((childId) => {
    const childPartnerRecord = data.partnerRecords.find((record) => record.user_id === childId);
    const childUser = data.users.find((user) => user.id === childId && user.role === "partner");
    const createdAt = childPartnerRecord?.created_at || childUser?.created_at;

    return Boolean(createdAt && isWithinWindow(createdAt, now, windowDays));
  });

  return {
    value: uniq(recruitedPartnerIds).length,
    confidence: medium(["Based on first-line partner relationships joined with partner creation date."]),
  };
}

function isPartnerActive30d(
  partnerId: string,
  data: PartnerDataBundle,
  now: Date,
  windowDays: number,
) {
  const partnerRecordIds = getPartnerRecordIdsForUser(partnerId, data.partnerRecords);

  const hasLead = data.leads.some(
    (lead) =>
      lead.referred_by_user_id === partnerId &&
      isWithinWindow(lead.created_at, now, windowDays),
  );

  const hasClick = data.outboundClicks.some(
    (click) =>
      click.partner_id &&
      partnerRecordIds.includes(click.partner_id) &&
      isWithinWindow(click.created_at, now, windowDays),
  );

  const hasVisit = data.referralVisits.some(
    (visit) =>
      visit.partner_id === partnerId &&
      isWithinWindow(visit.created_at, now, windowDays),
  );

  const hasRecruited = data.partnerRelationships.some(
    (relationship) =>
      relationship.sponsor_user_id === partnerId &&
      isWithinWindow(relationship.created_at, now, windowDays),
  );

  const hasCustomer = data.customers.some(
    (customer) =>
      customer.referred_by_user_id === partnerId &&
      isWithinWindow(customer.created_at, now, windowDays),
  );

  return hasLead || hasClick || hasVisit || hasRecruited || hasCustomer;
}

function countActiveFirstLinePartners30d(data: PartnerDataBundle, now: Date, windowDays: number) {
  const firstLineIds = getFirstLinePartnerIds(data.partnerId, data.partnerRelationships);
  const activeIds = firstLineIds.filter((childId) => isPartnerActive30d(childId, data, now, windowDays));

  return {
    value: uniq(activeIds).length,
    confidence: medium(["Based on observed first-line behavior in leads, clicks, visits, customers, or recruiting."]),
  };
}

function countPartnerGeneratedLeads30d(data: PartnerDataBundle, now: Date, windowDays: number) {
  const downlineIds = getAllDownlinePartnerIds(data.partnerId, data.partnerRelationships);
  const uniqueIdentityBackedLeadIds = uniq(
    data.leads
      .filter((lead) => lead.referred_by_user_id && downlineIds.includes(lead.referred_by_user_id))
      .filter((lead) => isWithinWindow(lead.created_at, now, windowDays))
      .filter(hasIdentitySignal)
      .map((lead) => lead.email || lead.phone || lead.id),
  );

  return {
    value: uniqueIdentityBackedLeadIds.length,
    confidence: uniqueIdentityBackedLeadIds.length > 0
      ? medium(["Based on identity-backed leads attributed to downline partners."])
      : low(["No downline-attributed lead activity found in the current window."]),
  };
}

function countPartnerGeneratedCustomers30d(data: PartnerDataBundle, now: Date, windowDays: number) {
  const downlineIds = getAllDownlinePartnerIds(data.partnerId, data.partnerRelationships);

  const customerIds = uniq(
    data.customers
      .filter((customer) => customer.referred_by_user_id && downlineIds.includes(customer.referred_by_user_id))
      .filter((customer) => isWithinWindow(customer.created_at, now, windowDays))
      .map((customer) => customer.email || customer.id),
  );

  if (customerIds.length > 0) {
    return {
      value: customerIds.length,
      confidence: high(["Based on customer rows attributed to downline partners in the current window."]),
    };
  }

  const qualifiedLeadIds = uniq(
    data.leads
      .filter((lead) => lead.referred_by_user_id && downlineIds.includes(lead.referred_by_user_id))
      .filter((lead) => isWithinWindow(lead.created_at, now, windowDays))
      .filter(isQualifiedCustomerLead)
      .map((lead) => lead.email || lead.phone || lead.id),
  );

  if (qualifiedLeadIds.length > 0) {
    return {
      value: qualifiedLeadIds.length,
      confidence: medium(["Fallback based on qualified customer leads attributed to downline partners."]),
    };
  }

  return {
    value: 0,
    confidence: low(["No downline customer signal found in the current window."]),
  };
}

export function mapPartnerDataToGrowthCompassInput(data: PartnerDataBundle): MappedGrowthCompassResult {
  const now = data.now ?? new Date();
  const windowDays = data.windowDays ?? 30;

  const personalCustomers = countPersonalCustomers30d(data, now, windowDays);
  const recruitedPartners = countRecruitedPartners30d(data, now, windowDays);
  const activeFirstLinePartners = countActiveFirstLinePartners30d(data, now, windowDays);
  const partnerGeneratedLeads = countPartnerGeneratedLeads30d(data, now, windowDays);
  const partnerGeneratedCustomers = countPartnerGeneratedCustomers30d(data, now, windowDays);

  const metrics = {
    personalCustomers30d: personalCustomers.confidence,
    recruitedPartners30d: recruitedPartners.confidence,
    activeFirstLinePartners30d: activeFirstLinePartners.confidence,
    partnerGeneratedLeads30d: partnerGeneratedLeads.confidence,
    partnerGeneratedCustomers30d: partnerGeneratedCustomers.confidence,
  };

  return {
    input: {
      personalCustomers30d: personalCustomers.value,
      recruitedPartners30d: recruitedPartners.value,
      activeFirstLinePartners30d: activeFirstLinePartners.value,
      partnerGeneratedLeads30d: partnerGeneratedLeads.value,
      partnerGeneratedCustomers30d: partnerGeneratedCustomers.value,
    },
    confidence: {
      overall: getOverallConfidence(metrics),
      metrics,
    },
  };
}
