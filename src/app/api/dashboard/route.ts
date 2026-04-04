import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getSupabase } from "@/lib/supabase";

export async function GET() {
  const accountId = await getSession();
  if (!accountId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = getSupabase();

  // Get account info
  const { data: account } = await db
    .from("ad_accounts")
    .select("business_name")
    .eq("id", accountId)
    .single();

  // Get campaigns (vertical is a string slug, not a FK)
  const { data: campaigns } = await db
    .from("ad_campaigns")
    .select("*")
    .eq("account_id", accountId)
    .order("created_at", { ascending: false });

  // Calculate stats
  const activeCampaigns = (campaigns || []).filter((c) => c.active);
  const totalSpentCents = activeCampaigns.reduce(
    (s, c) => s + (c.spent_this_month_cents || 0),
    0
  );

  // Get impression/click/lead counts from tracking tables
  const campaignIds = activeCampaigns.map((c) => c.id);
  let totalImpressions = 0;
  let totalClicks = 0;
  let totalLeads = 0;

  if (campaignIds.length > 0) {
    const [impressions, clicks, leads] = await Promise.all([
      db.from("ad_impressions").select("id", { count: "exact", head: true }).in("campaign_id", campaignIds),
      db.from("ad_clicks").select("id", { count: "exact", head: true }).in("campaign_id", campaignIds),
      db.from("ad_leads").select("id", { count: "exact", head: true }).in("campaign_id", campaignIds),
    ]);
    totalImpressions = impressions.count || 0;
    totalClicks = clicks.count || 0;
    totalLeads = leads.count || 0;
  }

  return NextResponse.json({
    business_name: account?.business_name || "Your Business",
    stats: {
      active_campaigns: activeCampaigns.length,
      total_impressions: totalImpressions,
      total_clicks: totalClicks,
      total_leads: totalLeads,
      total_spend: totalSpentCents / 100,
      ctr: totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0,
      cost_per_lead: totalLeads > 0 ? totalSpentCents / 100 / totalLeads : 0,
    },
    campaigns: (campaigns || []).map((c) => ({
      ...c,
      vertical_slug: c.vertical,
      vertical_name: c.vertical ? c.vertical.charAt(0).toUpperCase() + c.vertical.slice(1).replace(/-/g, " ") : "",
    })),
  });
}
