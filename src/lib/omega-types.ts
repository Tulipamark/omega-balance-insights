export type UserRole = "admin" | "partner";
export type LeadType = "customer_lead" | "partner_lead";
export type LeadSubmissionType = "customer" | "partner";
export type LeadSource = "email_gate" | "customer_form" | "partner_form";
export type EntityStatus = "new" | "qualified" | "active" | "inactive" | "won" | "lost";
export type OrderStatus = "pending" | "paid" | "cancelled" | "refunded";
export type LeadFailureReason = "invalid_email" | "partner_not_found" | "partner_not_verified";
export type RedirectType = "test" | "shop" | "partner";
export type RedirectFailureReason = "partner_not_found" | "partner_not_verified" | "destination_missing" | "invalid_type";
export type LeadSubmitMode = "created" | "updated" | "ignored";

export interface TrackClickRequest {
  ref: string;
  type: RedirectType;
  session_id: string;
}

export interface TrackClickResponse {
  ok: boolean;
  destination_url?: string;
  reason?: RedirectFailureReason;
}

export interface TrackVisitRequest {
  ref: string;
  session_id: string;
  landing_page: string;
  referrer: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  user_agent: string | null;
}

export interface TrackVisitResponse {
  ok: boolean;
  partnerFound: boolean;
  verified: boolean;
}

export interface UpsertLeadRequest {
  email: string;
  full_name: string;
  phone?: string | null;
  ref?: string | null;
  session_id?: string | null;
  lead_type: LeadSubmissionType;
  lead_source: LeadSource;
  source_page?: string | null;
  details?: Record<string, unknown>;
}

export interface UpsertLeadResponse {
  ok: boolean;
  mode?: LeadSubmitMode;
  lead_id?: string;
  reason?: LeadFailureReason;
}

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
  full_name?: string | null;
  email: string;
  phone?: string | null;
  type: LeadType;
  lead_type?: LeadSubmissionType | null;
  lead_source?: LeadSource | null;
  source_page?: string | null;
  referral_code?: string | null;
  referred_by_user_id?: string | null;
  partner_id?: string | null;
  session_id?: string | null;
  status: EntityStatus;
  details?: Record<string, unknown>;
  created_at: string;
  updated_at?: string | null;
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
