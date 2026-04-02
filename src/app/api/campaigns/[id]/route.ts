import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getSupabase } from "@/lib/supabase";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const providerId = await getSession();
  if (!providerId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await req.json();
    const db = getSupabase();

    // Only allow updating own campaigns
    const { data: campaign } = await db
      .from("ad_campaigns")
      .select("id, provider_id")
      .eq("id", id)
      .single();

    if (!campaign || campaign.provider_id !== providerId) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Allowed fields to update
    const updates: Record<string, unknown> = {};
    if (body.status && ["active", "paused"].includes(body.status)) {
      updates.status = body.status;
    }
    if (body.monthly_budget !== undefined) {
      updates.monthly_budget = body.monthly_budget;
    }
    if (body.per_lead_bid !== undefined) {
      updates.per_lead_bid = body.per_lead_bid;
    }
    if (body.daily_budget_cap !== undefined) {
      updates.daily_budget_cap = body.daily_budget_cap;
    }

    updates.updated_at = new Date().toISOString();

    const { error: dbError } = await db
      .from("ad_campaigns")
      .update(updates)
      .eq("id", id);

    if (dbError) {
      return NextResponse.json({ error: "Update failed" }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Campaign update error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
