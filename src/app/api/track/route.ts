import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { type, campaign_id, click_type, suburb, postcode, site } = body;

  if (!campaign_id) {
    return NextResponse.json({ ok: false, error: "campaign_id required" }, { status: 400 });
  }

  const sb = getSupabase();

  if (type === "click") {
    await sb.from("ad_clicks").insert({
      campaign_id,
      click_type: click_type || "listing",
      suburb: suburb || null,
      postcode: postcode || null,
      site: site || "unknown",
    });
  } else if (type === "lead") {
    // Insert lead record
    await sb.from("ad_leads").insert({
      campaign_id,
      suburb: suburb || null,
      postcode: postcode || null,
      site: site || "unknown",
      fee_cents: 0, // Free period
      billed: false,
    });

    // Increment campaign spend counter (currently 0 during free period)
    await sb.rpc("increment_campaign_spend", { campaign_id_param: campaign_id, amount_cents: 0 });
  }

  const res = NextResponse.json({ ok: true });
  res.headers.set("Access-Control-Allow-Origin", "*");
  return res;
}

export async function OPTIONS() {
  return new NextResponse(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
