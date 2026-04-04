import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getSupabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  const accountId = await getSession();
  if (!accountId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { vertical, monthly_budget_cents, bid_per_lead_cents, provider_name, provider_phone, provider_website, service_areas } = body;

    if (!vertical) {
      return NextResponse.json(
        { error: "Vertical is required" },
        { status: 400 }
      );
    }

    const db = getSupabase();

    // Check for existing campaign on this vertical
    const { data: existing } = await db
      .from("ad_campaigns")
      .select("id")
      .eq("account_id", accountId)
      .eq("vertical", vertical)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: "You already have a campaign on this site. Edit it instead." },
        { status: 409 }
      );
    }

    const { data: campaign, error: dbError } = await db
      .from("ad_campaigns")
      .insert({
        account_id: accountId,
        vertical,
        name: `${vertical} campaign`,
        monthly_budget_cents: monthly_budget_cents || null,
        bid_per_lead_cents: bid_per_lead_cents || 200, // Default $2/lead
        provider_name: provider_name || null,
        provider_phone: provider_phone || null,
        provider_website: provider_website || null,
        service_areas: service_areas || [],
        active: true,
        spent_this_month_cents: 0,
      })
      .select("id")
      .single();

    if (dbError) {
      console.error("Create campaign error:", dbError);
      return NextResponse.json(
        { error: "Failed to create campaign" },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, campaign_id: campaign.id });
  } catch (err) {
    console.error("Campaign create error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
