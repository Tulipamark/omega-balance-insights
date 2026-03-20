export type UserRole = "admin" | "partner";
export type LeadType = "customer_lead" | "partner_lead";
export type EntityStatus = "new" | "qualified" | "active" | "inactive" | "won" | "lost";
export type OrderStatus = "pending" | "paid" | "cancelled" | "refunded";

export interface AppUser {
  id: string;
  auth_user_id?: string | null;
  name: string;
  email: string;
  role: UserRole;
  referral_code: string;
  parent_partner_id?: string | null;
  created_at: string;
}

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  type: LeadType;
  source_page?: string | null;
  referral_code?: string | null;
  referred_by_user_id?: string | null;
  status: EntityStatus;
  details?: Record<string, unknown>;
  created_at: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  referred_by_user_id?: string | null;
  referral_code?: string | null;
  status: EntityStatus;
  created_at: string;
}

export interface Order {
  id: string;
  customer_id: string;
  referred_by_user_id?: string | null;
  amount: number;
  status: OrderStatus;
  created_at: string;
}

export interface PartnerRelationship {
  id: string;
  sponsor_user_id: string;
  partner_user_id: string;
  level: number;
  created_at: string;
}

export interface ReferralVisit {
  id: string;
  partner_id?: string | null;
  referral_code?: string | null;
  session_id?: string | null;
  landing_page?: string | null;
  referrer?: string | null;
  visitor_id?: string | null;
  utm_source?: string | null;
  utm_medium?: string | null;
  utm_campaign?: string | null;
  user_agent?: string | null;
  ip_hash?: string | null;
  created_at: string;
}

export interface ReferralAttribution {
  referralCode: string | null;
  referredByUserId: string | null;
  landingPage: string;
}

export interface LeadSubmissionInput {
  name: string;
  email: string;
  phone?: string;
  type: LeadType;
  sourcePage: string;
  status?: EntityStatus;
  details?: Record<string, unknown>;
}

export interface CreatePartnerInput {
  authUserId: string;
  name: string;
  email: string;
  sponsorReferralCode?: string | null;
}

export interface PartnerPerformanceRow {
  partnerId: string;
  partnerName: string;
  referralCode: string;
  leads: number;
  customers: number;
  clicks: number;
}

export interface AdminPartnerRow {
  partnerId: string;
  partnerName: string;
  email: string;
  referralCode: string;
  sponsorName: string | null;
  directPartners: number;
  leads: number;
  customers: number;
  createdAt: string;
}

export interface TeamRow {
  partnerId: string;
  partnerName: string;
  email: string;
  level: number;
  createdAt: string;
}

export interface AdminDashboardData {
  metrics: {
    totalLeads: number;
    totalCustomers: number;
    totalPartnerLeads: number;
    totalActivePartners: number;
  };
  leadsPerPartner: PartnerPerformanceRow[];
  customersPerPartner: PartnerPerformanceRow[];
  partners: AdminPartnerRow[];
  networkOverview: TeamRow[];
  recentLeads: Lead[];
  recentPartnerApplications: Lead[];
}

export interface PortalAccessState {
  authUser: {
    id: string;
    email: string | null;
  } | null;
  portalUser: AppUser | null;
}

export interface PartnerDashboardData {
  partner: AppUser;
  metrics: {
    clicks: number;
    leads: number;
    customers: number;
    partnerLeads: number;
    directPartners: number;
  };
  leads: Lead[];
  customers: Customer[];
  partnerLeads: Lead[];
  team: TeamRow[];
}
