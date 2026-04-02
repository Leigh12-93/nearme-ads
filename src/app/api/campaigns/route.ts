import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getSupabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  const providerId = await getSession();
  if (!providerId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { vertical_id, budget_type, monthly_budget, per_lead_bid } = body;

    if (!vertical_id || !budget_type) {
      return NextResponse.json(
        { error: "Vertical and budget type are required" },
        { status: 400 }
      );
    }

    if (budget_type === "per_lead" && (!per_lead_bid || per_lead_bid < 2)) {
      return NextResponse.json(
        { error: "Minimum bid is $2 per lead" },
        { status: 400 }
      );
    }

    if (budget_type === "monthly" && (!monthly_budget || monthly_budget < 49)) {
      return NextResponse.json(
        { error: "Minimum monthly budget is $49" },
        { status: 400 }
      );
    }

    const db = getSupabase();

    // Check for existing campaign on this vertical
    const { data: existing } = await db
      .from("ad_campaigns")
      .select("id")
      .eq("provider_id", providerId)
      .eq("vertical_id", vertical_id)
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
        provider_id: providerId,
        vertical_id,
        budget_type,
        monthly_budget: budget_type === "monthly" ? monthly_budget : null,
        per_lead_bid: budget_type === "per_lead" ? per_lead_bid : null,
        status: "active",
        boost_score: budget_type === "per_lead" ? per_lead_bid : monthly_budget / 49,
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
