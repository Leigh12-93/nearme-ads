import { NextRequest, NextResponse } from "next/server";
import { compare } from "bcryptjs";
import { getSupabase } from "@/lib/supabase";
import { createSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const db = getSupabase();

    const { data: provider } = await db
      .from("ad_providers")
      .select("id, password_hash, active")
      .eq("email", email.toLowerCase().trim())
      .single();

    if (!provider) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    if (!provider.active) {
      return NextResponse.json(
        { error: "This account has been deactivated" },
        { status: 403 }
      );
    }

    const valid = await compare(password, provider.password_hash);
    if (!valid) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    await createSession(provider.id);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Login error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
