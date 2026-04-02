import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

export async function GET() {
  const db = getSupabase();
  const { data: verticals } = await db
    .from("verticals")
    .select("*")
    .eq("active", true)
    .order("name");

  return NextResponse.json({ verticals: verticals || [] });
}
