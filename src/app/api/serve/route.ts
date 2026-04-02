import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

// CORS for cross-site requests from any CheapX network site
export async function OPTIONS() {
  return new NextResponse(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const vertical = searchParams.get("vertical");
  const suburb = (searchParams.get("suburb") || "").toLowerCase().trim();
  const postcode = (searchParams.get("postcode") || "").trim();
  const site = searchParams.get("site") || "unknown";
  const limit = Math.min(parseInt(searchParams.get("limit") || "5"), 10);

  if (!vertical) {
    return NextResponse.json({ ok: false, error: "vertical required" }, { status: 400 });
  }

  const sb = getSupabase();

  // Look up vertical ID by slug
  const { data: verticalRow } = await sb
    .from("verticals")
    .select("id")
    .eq("slug", vertical)
    .single();

  if (!verticalRow) {
    return NextResponse.json({ ok: false, error: "unknown vertical" }, { status: 404 });
  }

  // Join campaigns with providers to get business details
  const { data: campaigns, error } = await sb
    .from("ad_campaigns")
    .select("id, provider_id, per_lead_bid, monthly_budget, month_spend, target_areas, boost_score, ad_providers(business_name, phone, website)")
    .eq("vertical_id", verticalRow.id)
    .eq("status", "active")
    .order("boost_score", { ascending: false })
    .limit(50);

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  // Filter by budget remaining and area match
  const eligible = (campaigns || []).filter((c: Record<string, unknown>) => {
    const spent = Number(c.month_spend) || 0;
    const budget = Number(c.monthly_budget) || Infinity;
    if (spent >= budget) return false;
    const areas: string[] = (c.target_areas as string[]) || [];
    if (areas.length === 0) return true;
    return areas.some((a: string) => {
      const al = a.toLowerCase().trim();
      return suburb.includes(al) || al.includes(suburb) || al === postcode;
    });
  }).slice(0, limit);

  // Log impressions asynchronously
  if (eligible.length > 0) {
    sb.from("ad_impressions").insert(
      eligible.map((c: Record<string, unknown>, i: number) => ({
        campaign_id: c.id,
        provider_id: (c as Record<string, unknown>).provider_id,
        vertical_id: verticalRow.id,
        search_postcode: postcode || null,
        search_query: suburb || null,
        position: i + 1,
      }))
    ).then(() => {});
  }

  const res = NextResponse.json({
    ok: true,
    vertical,
    suburb,
    postcode,
    providers: eligible.map((c: Record<string, unknown>) => {
      const prov = c.ad_providers as Record<string, unknown> | null;
      return {
        campaign_id: c.id,
        name: prov?.business_name || "Provider",
        phone: prov?.phone || null,
        website: prov?.website || null,
      };
    }),
  });
  res.headers.set("Access-Control-Allow-Origin", "*");
  return res;
}
