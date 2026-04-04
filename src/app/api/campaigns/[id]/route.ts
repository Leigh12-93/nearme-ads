import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getSupabase } from "@/lib/supabase";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const accountId = await getSession();
  if (!accountId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await req.json();
    const db = getSupabase();

    // Only allow updating own campaigns
    const { data: campaign } = await db
      .from("ad_campaigns")
      .select("id, account_id")
      .eq("id", id)
      .single();

    if (!campaign || campaign.account_id !== accountId) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Allowed fields to update
    const updates: Record<string, unknown> = {};
    if (body.active !== undefined) {
      updates.active = body.active;
    }
    if (body.monthly_budget_cents !== undefined) {
      updates.monthly_budget_cents = body.monthly_budget_cents;
    }
    if (body.bid_per_lead_cents !== undefined) {
      updates.bid_per_lead_cents = body.bid_per_lead_cents;
    }
    if (body.provider_name !== undefined) {
      updates.provider_name = body.provider_name;
    }
    if (body.provider_phone !== undefined) {
      updates.provider_phone = body.provider_phone;
    }
    if (body.provider_website !== undefined) {
      updates.provider_website = body.provider_website;
    }
    if (body.service_areas !== undefined) {
      updates.service_areas = body.service_areas;
    }

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
