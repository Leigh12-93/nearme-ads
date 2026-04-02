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

  if (\!vertical) {
    return NextResponse.json({ ok: false, error: "vertical required" }, { status: 400 });
  }

  const sb = getSupabase();

  const { data: campaigns, error } = await sb
    .from("ad_campaigns")
    .select("id, provider_name, provider_phone, provider_website, bid_per_lead_cents, monthly_budget_cents, spent_this_month_cents, service_areas, ad_copy")
    .eq("vertical", vertical)
    .eq("active", true)
    .order("bid_per_lead_cents", { ascending: false })
    .limit(50);

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  const eligible = (campaigns || []).filter(c => {
    if ((c.spent_this_month_cents || 0) >= (c.monthly_budget_cents || 0)) return false;
    const areas: string[] = c.service_areas || [];
    if (areas.length === 0) return true;
    return areas.some((a: string) => {
      const al = a.toLowerCase().trim();
      return suburb.includes(al) || al.includes(suburb) || al === postcode;
    });
  }).slice(0, limit);

  if (eligible.length > 0) {
    sb.from("ad_impressions").insert(
      eligible.map((c, i) => ({ campaign_id: c.id, site, suburb, postcode, position: i + 1 }))
    ).then(() => {});
  }

  const res = NextResponse.json({
    ok: true,
    vertical,
    suburb,
    postcode,
    providers: eligible.map(c => ({
      campaign_id: c.id,
      name: c.provider_name,
      phone: c.provider_phone,
      website: c.provider_website,
      ad_copy: c.ad_copy,
    })),
  });
  res.headers.set("Access-Control-Allow-Origin", "*");
  return res;
}
