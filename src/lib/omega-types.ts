export type UserRole = "admin" | "partner";
export type LeadType = "customer_lead" | "partner_lead";
export type LeadSubmissionType = "customer" | "partner";
export type LeadSource = "email_gate" | "customer_form" | "partner_form";
export type EntityStatus = "new" | "qualified" | "active" | "inactive" | "won" | "lost";
export type OrderStatus = "pending" | "paid" | "cancelled" | "refunded";
export type LeadFailureReason = "invalid_email" | "partner_not_found" | "partner_not_verified";
export type RedirectType = "test" | "shop" | "partner" | "consultation";
export type LeadSubmitMode = "created" | "updated" | "ignored";
export type PartnerLeadPriority = "hot" | "follow_up" | "not_now";
export type FunnelEventName =
  | "landing_viewed"
  | "hero_primary_cta_clicked"
  | "hero_secondary_cta_clicked"
  | "sticky_cta_clicked"
  | "closing_cta_clicked"
  | "lead_form_started"
  | "lead_form_submitted"
  | "lead_form_submit_failed"
  | "consultation_redirect_requested"
  | "partner_hero_primary_cta_clicked"
  | "partner_sticky_cta_clicked"
  | "partner_form_started"
  | "partner_form_submitted"
  | "partner_form_submit_failed";

export interface PartnerZzLinks {
  test: string | null;
  shop: string | null;
  partner: string | null;
  consultation: string | null;
}

export interface TrackClickError {
  code: string;
  message: string;
}

export interface TrackClickRequest {
  ref: string;
  type: RedirectType;
  session_id: string;
}

export type TrackClickResponse =
  | {
      ok: true;
      destination_url: string;
    }
  | {
      ok: false;
      error: TrackClickError;
      destination_url?: string;
      reason?: string;
    };

export interface TrackVisitResponse {
  ok: boolean;
  partnerFound: boolean;
  verified: boolean;
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

export interface TrackFunnelEventRequest {
  name: FunnelEventName;
  session_id: string;
  ref?: string | null;
  page_path: string;
  referrer?: string | null;
  utm_source?: string | null;
  utm_medium?: string | null;
  utm_campaign?: string | null;
  user_agent?: string | null;
  details?: Record<string, unknown>;
}

export interface TrackFunnelEventResponse {
  ok: boolean;
  event_id?: string;
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

export interface OnboardPartnerFromLeadRequest {
  lead_id: string;
}

export interface OnboardPartnerFromLeadResponse {
  ok: boolean;
  partner_id?: string;
  auth_user_id?: string;
  email?: string;
  temporary_password?: string;
  referral_code?: string;
  error?: string;
}

export interface UpdatePartnerLeadReviewRequest {
  lead_id: string;
  partner_priority?: PartnerLeadPriority | null;
  admin_note?: string | null;
  zinzino_verified?: boolean | null;
  team_intent_confirmed?: boolean | null;
}

export interface UpdatePartnerLeadReviewResponse {
  ok: boolean;
  lead_id?: string;
  partner_priority?: PartnerLeadPriority | null;
  admin_note?: string | null;
  zinzino_verified?: boolean | null;
  team_intent_confirmed?: boolean | null;
  error?: string;
}

export interface AppUser {
  id: string;
  auth_user_id?: string | null;
  name: string;
  email: string;
  role: UserRole;
  referral_code: string;
  parent_partner_id?: string | null;
  accepted_terms_at?: string | null;
  accepted_privacy_at?: string | null;
  accepted_portal_notice_at?: string | null;
  terms_version?: string | null;
  privacy_version?: string | null;
  portal_notice_version?: string | null;
  legal_acceptance_user_agent?: string | null;
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

export interface FunnelEvent {
  id: string;
  partner_id?: string | null;
  referral_code?: string | null;
  session_id: string;
  event_name: FunnelEventName | string;
  page_path: string;
  referrer?: string | null;
  utm_source?: string | null;
  utm_medium?: string | null;
  utm_campaign?: string | null;
  user_agent?: string | null;
  details?: Record<string, unknown> | null;
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
  zzLinksReady: boolean;
  zzLinks: PartnerZzLinks;
  createdAt: string;
}

export interface TeamRow {
  partnerId: string;
  partnerName: string;
  email: string;
  level: number;
  createdAt: string;
}

export interface KpiFunnelDay {
  day: string;
  visits: number;
  outbound_clicks: number;
  customer_leads: number;
  customers: number;
  paid_orders: number;
  paid_revenue: number;
  visit_to_click_pct: number;
  click_to_lead_pct: number;
  lead_to_customer_pct: number;
  customer_to_paid_order_pct: number;
  visit_to_paid_order_pct: number;
}

export interface KpiPartnerPipeline {
  applications: number;
  new_candidates: number;
  verified_candidates: number;
  active_partner_accounts: number;
  inactive_or_lost: number;
  partner_records: number;
  portal_partner_users: number;
  application_to_verified_pct: number;
  verified_to_active_pct: number;
}

export interface KpiDuplicationRow {
  partner_id: string;
  user_id: string;
  partner_name: string;
  email: string;
  referral_code: string;
  portal_role: UserRole;
  partner_record_status: string;
  market_code?: string | null;
  created_at: string;
  verified_at?: string | null;
  visits: number;
  outbound_clicks: number;
  total_leads: number;
  customer_leads: number;
  partner_leads: number;
  customers: number;
  paid_orders: number;
  paid_revenue: number;
  has_generated_leads: boolean;
  has_generated_customers: boolean;
  has_generated_paid_orders: boolean;
}

export interface KpiSourceMixRow {
  day: string;
  source: string;
  medium: string;
  campaign: string;
  landing_page: string;
  market_code: string;
  visits: number;
}

export interface KpiFunnelEventDay {
  day: string;
  event_name: string;
  events: number;
}

export type ConfidenceLevel = "low" | "medium" | "high";

export interface MetricConfidence {
  level: ConfidenceLevel;
  reasons: string[];
}

export interface GrowthCompassConfidence {
  overall: ConfidenceLevel;
  metrics: {
    personalCustomers30d: MetricConfidence;
    recruitedPartners30d: MetricConfidence;
    activeFirstLinePartners30d: MetricConfidence;
    partnerGeneratedLeads30d: MetricConfidence;
    partnerGeneratedCustomers30d: MetricConfidence;
  };
}

export interface GrowthCompassRow {
  partnerId: string;
  partnerName: string;
  email: string;
  referralCode: string;
  status: "inactive" | "active" | "growing" | "duplicating" | "leader-track";
  score: number;
  nextMilestone: string;
  nextBestAction: string;
  explanation: string;
  flags: string[];
  missingToNext: string[];
  confidence: GrowthCompassConfidence;
  inputs: {
    personalCustomers30d: number;
    recruitedPartners30d: number;
    activeFirstLinePartners30d: number;
    partnerGeneratedLeads30d: number;
    partnerGeneratedCustomers30d: number;
  };
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
  partnerApplications: Lead[];
  partners: AdminPartnerRow[];
  networkOverview: TeamRow[];
  recentLeads: Lead[];
  recentPartnerApplications: Lead[];
  kpis?: {
    funnelDaily: KpiFunnelDay[];
    funnelEventsDaily: KpiFunnelEventDay[];
    partnerPipeline: KpiPartnerPipeline | null;
    duplication: KpiDuplicationRow[];
    sourceMixDaily: KpiSourceMixRow[];
  };
  growthCompass: GrowthCompassRow[];
  recentFunnelEvents?: FunnelEvent[];
}

export interface PortalAccessState {
  authUser: {
    id: string;
    email: string | null;
  } | null;
  portalUser: AppUser | null;
}

export interface AcceptPortalLegalRequest {
  accepted_terms_at: string;
  accepted_privacy_at: string;
  accepted_portal_notice_at: string;
  terms_version: string;
  privacy_version: string;
  portal_notice_version: string;
  legal_acceptance_user_agent?: string | null;
}

export interface PartnerDashboardData {
  partner: AppUser;
  sponsor: {
    id: string;
    name: string;
    email: string;
  } | null;
  zzLinks: PartnerZzLinks;
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
