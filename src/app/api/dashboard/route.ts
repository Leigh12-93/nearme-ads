import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getSupabase } from "@/lib/supabase";

export async function GET() {
  const providerId = await getSession();
  if (!providerId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = getSupabase();

  // Get provider info
  const { data: provider } = await db
    .from("ad_providers")
    .select("business_name")
    .eq("id", providerId)
    .single();

  // Get campaigns with vertical info
  const { data: campaigns } = await db
    .from("ad_campaigns")
    .select("*, verticals(slug, name)")
    .eq("provider_id", providerId)
    .order("created_at", { ascending: false });

  // Calculate stats
  const activeCampaigns = (campaigns || []).filter(
    (c) => c.status === "active"
  );
  const totalImpressions = activeCampaigns.reduce(
    (s, c) => s + (c.month_impressions || 0),
    0
  );
  const totalClicks = activeCampaigns.reduce(
    (s, c) => s + (c.month_clicks || 0),
    0
  );
  const totalLeads = activeCampaigns.reduce(
    (s, c) => s + (c.month_leads || 0),
    0
  );
  const totalSpend = activeCampaigns.reduce(
    (s, c) => s + (c.month_spend || 0),
    0
  );

  return NextResponse.json({
    business_name: provider?.business_name || "Your Business",
    stats: {
      active_campaigns: activeCampaigns.length,
      total_impressions: totalImpressions,
      total_clicks: totalClicks,
      total_leads: totalLeads,
      total_spend: totalSpend,
      ctr: totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0,
      cost_per_lead: totalLeads > 0 ? totalSpend / totalLeads : 0,
    },
    campaigns: (campaigns || []).map((c) => ({
      ...c,
      vertical_slug: c.verticals?.slug,
      vertical_name: c.verticals?.name,
      verticals: undefined,
    })),
  });
}
