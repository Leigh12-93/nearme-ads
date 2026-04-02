import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { type, campaign_id, site, click_type, suburb, postcode, fee_cents } = body;

  if (\!campaign_id || \!site) {
    return NextResponse.json({ ok: false, error: "campaign_id and site required" }, { status: 400 });
  }

  const sb = getSupabase();

  if (type === "click") {
    await sb.from("ad_clicks").insert({ campaign_id, site, click_type, suburb, postcode });
  } else if (type === "lead") {
    const fee = fee_cents || 200;
    await sb.from("ad_leads").insert({ campaign_id, site, suburb, postcode, fee_cents: fee, billed: false });
    await sb.rpc("increment_campaign_spend", { campaign_id_param: campaign_id, amount_cents: fee });
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
