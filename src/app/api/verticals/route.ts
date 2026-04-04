import { NextResponse } from "next/server";

// Verticals are the CheapXNearMe sites in the network
// Hardcoded since these change rarely and avoids needing a separate DB table
const VERTICALS = [
  { slug: "skip-bins", name: "Skip Bins", domain: "cheapskipbinsnearme.com.au", service_type: "Skip Bin Hire", active: true },
  { slug: "electricians", name: "Electricians", domain: "cheapelectriciansnearme.com.au", service_type: "Electrical Services", active: true },
  { slug: "cleaners", name: "Cleaners", domain: "cheapcleanersnearme.com.au", service_type: "Cleaning Services", active: true },
  { slug: "removalists", name: "Removalists", domain: "cheapremovalistsnearme.com.au", service_type: "Removalist Services", active: true },
  { slug: "plumbers", name: "Plumbers", domain: "cheapplumbersnearme.com.au", service_type: "Plumbing Services", active: false },
  { slug: "locksmiths", name: "Locksmiths", domain: "cheaplocksmithsnearme.com.au", service_type: "Locksmith Services", active: false },
];

export async function GET() {
  return NextResponse.json({ verticals: VERTICALS.filter((v) => v.active) });
}
