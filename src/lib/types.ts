export interface Vertical {
  id: string;
  slug: string;
  name: string;
  domain: string;
  service_type: string;
  icon?: string;
  active: boolean;
}

export interface AdProvider {
  id: string;
  email: string;
  business_name: string;
  contact_name?: string;
  phone?: string;
  website?: string;
  abn?: string;
  state: string;
  service_areas?: string[];
  logo_url?: string;
  verified: boolean;
  active: boolean;
  stripe_customer_id?: string;
  created_at: string;
}

export interface Campaign {
  id: string;
  provider_id: string;
  vertical_id: string;
  budget_type: "monthly" | "per_lead";
  monthly_budget?: number;
  per_lead_bid?: number;
  daily_budget_cap?: number;
  target_areas?: string[];
  target_services?: string[];
  status: "active" | "paused" | "exhausted" | "draft";
  month_spend: number;
  month_leads: number;
  month_impressions: number;
  month_clicks: number;
  boost_score: number;
  created_at: string;
  // Joined
  vertical?: Vertical;
}

export interface Lead {
  id: string;
  campaign_id: string;
  provider_id: string;
  vertical_id: string;
  customer_name?: string;
  customer_phone?: string;
  customer_email?: string;
  customer_suburb?: string;
  customer_postcode?: string;
  service_details?: string;
  charge_amount: number;
  charged: boolean;
  status: "new" | "contacted" | "won" | "lost";
  created_at: string;
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
