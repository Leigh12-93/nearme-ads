import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { createSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    const db = getSupabase();

    // Look up account by email (simple email-based auth for now)
    const { data: account } = await db
      .from("ad_accounts")
      .select("id, status")
      .eq("email", email.toLowerCase().trim())
      .single();

    if (!account) {
      return NextResponse.json(
        { error: "No account found with this email" },
        { status: 401 }
      );
    }

    if (account.status !== "active") {
      return NextResponse.json(
        { error: "This account has been deactivated" },
        { status: 403 }
      );
    }

    await createSession(account.id);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Login error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
