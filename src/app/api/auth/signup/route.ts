import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { getSupabase } from "@/lib/supabase";
import { createSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { business_name, contact_name, email, phone, password, state } = body;

    if (!business_name || !email || !password) {
      return NextResponse.json(
        { error: "Business name, email, and password are required" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    const db = getSupabase();

    // Check if email already exists
    const { data: existing } = await db
      .from("ad_providers")
      .select("id")
      .eq("email", email.toLowerCase().trim())
      .single();

    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    // Hash password
    const password_hash = await hash(password, 12);

    // Create provider
    const { data: provider, error: dbError } = await db
      .from("ad_providers")
      .insert({
        business_name: business_name.trim(),
        contact_name: contact_name?.trim() || null,
        email: email.toLowerCase().trim(),
        phone: phone?.trim() || null,
        password_hash,
        state: state || "SA",
      })
      .select("id")
      .single();

    if (dbError) {
      console.error("Signup DB error:", dbError);
      return NextResponse.json({ error: "Failed to create account" }, { status: 500 });
    }

    // Create session
    await createSession(provider.id);

    return NextResponse.json({ ok: true, provider_id: provider.id });
  } catch (err) {
    console.error("Signup error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
