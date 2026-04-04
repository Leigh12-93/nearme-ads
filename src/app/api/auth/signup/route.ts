import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { createSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { business_name, contact_name, email, phone } = body;

    if (!business_name || !email) {
      return NextResponse.json(
        { error: "Business name and email are required" },
        { status: 400 }
      );
    }

    const db = getSupabase();

    // Check if email already exists
    const { data: existing } = await db
      .from("ad_accounts")
      .select("id")
      .eq("email", email.toLowerCase().trim())
      .single();

    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    // Create account
    const { data: account, error: dbError } = await db
      .from("ad_accounts")
      .insert({
        business_name: business_name.trim(),
        contact_name: contact_name?.trim() || null,
        email: email.toLowerCase().trim(),
        phone: phone?.trim() || null,
        status: "active",
        balance_cents: 0,
        total_spent_cents: 0,
      })
      .select("id")
      .single();

    if (dbError) {
      console.error("Signup DB error:", dbError);
      return NextResponse.json({ error: "Failed to create account" }, { status: 500 });
    }

    // Create session
    await createSession(account.id);

    return NextResponse.json({ ok: true, account_id: account.id });
  } catch (err) {
    console.error("Signup error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
