import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { type, campaign_id, impression_id, click_type, customer_name, customer_phone, customer_email, customer_suburb, customer_postcode, service_details } = body;

  if (!campaign_id) {
    return NextResponse.json({ ok: false, error: "campaign_id required" }, { status: 400 });
  }

  const sb = getSupabase();

  // Look up campaign to get provider_id and vertical_id
  const { data: campaign } = await sb
    .from("ad_campaigns")
    .select("provider_id, vertical_id")
    .eq("id", campaign_id)
    .single();

  if (!campaign) {
    return NextResponse.json({ ok: false, error: "campaign not found" }, { status: 404 });
  }

  if (type === "click") {
    await sb.from("ad_clicks").insert({
      campaign_id,
      provider_id: campaign.provider_id,
      vertical_id: campaign.vertical_id,
      impression_id: impression_id || null,
      click_type: click_type || "listing",
    });
  } else if (type === "lead") {
    // Insert lead record
    const { error: leadErr } = await sb.from("ad_leads").insert({
      campaign_id,
      provider_id: campaign.provider_id,
      vertical_id: campaign.vertical_id,
      customer_name: customer_name || null,
      customer_phone: customer_phone || null,
      customer_email: customer_email || null,
      customer_suburb: customer_suburb || null,
      customer_postcode: customer_postcode || null,
      service_details: service_details || null,
      charge_amount: 0, // Free period — will be configurable later
      charged: false,
      status: "new",
    });

    if (!leadErr) {
      // Increment campaign spend counter (currently 0 during free period)
      await sb.rpc("increment_campaign_spend", { campaign_id_param: campaign_id, amount_cents: 0 });
    }
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
