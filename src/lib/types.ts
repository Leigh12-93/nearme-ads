export interface Vertical {
  slug: string;
  name: string;
  domain: string;
  service_type: string;
  active: boolean;
}

export interface AdAccount {
  id: string;
  email: string;
  business_name: string;
  contact_name?: string;
  phone?: string;
  status: string;
  stripe_customer_id?: string;
  balance_cents: number;
  total_spent_cents: number;
  created_at: string;
}

export interface Campaign {
  id: string;
  account_id: string;
  vertical: string;
  name: string;
  monthly_budget_cents?: number;
  bid_per_lead_cents?: number;
  spent_this_month_cents: number;
  service_areas?: string[];
  provider_name?: string;
  provider_phone?: string;
  provider_website?: string;
  ad_copy?: string;
  active: boolean;
  created_at: string;
  // Derived in dashboard
  vertical_slug?: string;
  vertical_name?: string;
}

export interface Lead {
  id: string;
  campaign_id: string;
  suburb?: string;
  postcode?: string;
  site?: string;
  fee_cents: number;
  billed: boolean;
  ts: string;
}

export interface DashboardStats {
  active_campaigns: number;
  total_impressions: number;
  total_clicks: number;
  total_leads: number;
  total_spend: number;
  ctr: number;
  cost_per_lead: number;
}
