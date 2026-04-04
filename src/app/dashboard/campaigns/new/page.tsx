"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Zap } from "lucide-react";
import type { Vertical } from "@/lib/types";
import { cn } from "@/lib/utils";

export default function NewCampaignPage() {
  const router = useRouter();
  const [verticals, setVerticals] = useState<Vertical[]>([]);
  const [selectedVertical, setSelectedVertical] = useState<string>("");
  const [budgetType, setBudgetType] = useState<"monthly" | "per_lead">("per_lead");
  const [monthlyBudget, setMonthlyBudget] = useState("100");
  const [perLeadBid, setPerLeadBid] = useState("5");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/verticals")
      .then((r) => r.json())
      .then((data) => setVerticals(data.verticals || []))
      .catch(() => {});
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedVertical) {
      setError("Please select a site to advertise on");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vertical: selectedVertical,
          monthly_budget_cents: budgetType === "monthly" ? Math.round(parseFloat(monthlyBudget) * 100) : null,
          bid_per_lead_cents: budgetType === "per_lead" ? Math.round(parseFloat(perLeadBid) * 100) : null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create campaign");
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  const VERTICAL_COLORS: Record<string, string> = {
    "skip-bins": "border-orange-300 bg-orange-50",
    electricians: "border-yellow-300 bg-yellow-50",
    plumbers: "border-blue-300 bg-blue-50",
    cleaners: "border-green-300 bg-green-50",
    locksmiths: "border-purple-300 bg-purple-50",
    removalists: "border-red-300 bg-red-50",
  };

  return (
    <div className="min-h-screen bg-surface-dim">
      <header className="border-b border-border bg-white">
        <div className="mx-auto max-w-3xl px-6 py-3 flex items-center gap-4">
          <Link href="/dashboard" className="text-text-dim hover:text-text">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-brand" />
            <span className="font-bold text-text">New Campaign</span>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-6 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {error && (
            <div className="rounded-lg bg-danger-light border border-danger/20 p-3 text-sm text-danger">
              {error}
            </div>
          )}

          {/* Step 1: Choose Vertical */}
          <div>
            <h2 className="text-lg font-semibold text-text mb-1">
              1. Choose a site to advertise on
            </h2>
            <p className="text-sm text-text-dim mb-4">
              Your business will appear in search results on this site.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {verticals.map((v) => (
                <button
                  key={v.slug}
                  type="button"
                  onClick={() => setSelectedVertical(v.slug)}
                  className={cn(
                    "rounded-xl border-2 p-4 text-left transition-all",
                    selectedVertical === v.slug
                      ? VERTICAL_COLORS[v.slug] || "border-brand bg-brand-light"
                      : "border-border bg-white hover:border-border-strong"
                  )}
                >
                  <p className="font-medium text-text text-sm">{v.name}</p>
                  <p className="text-xs text-text-dim mt-0.5">{v.domain}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Step 2: Budget Type */}
          <div>
            <h2 className="text-lg font-semibold text-text mb-1">
              2. Set your budget
            </h2>
            <p className="text-sm text-text-dim mb-4">
              Choose how you want to pay for advertising.
            </p>

            <div className="flex gap-3 mb-4">
              <button
                type="button"
                onClick={() => setBudgetType("per_lead")}
                className={cn(
                  "flex-1 rounded-xl border-2 p-4 text-left transition-all",
                  budgetType === "per_lead"
                    ? "border-brand bg-brand-light"
                    : "border-border bg-white"
                )}
              >
                <p className="font-medium text-text text-sm">Pay Per Lead</p>
                <p className="text-xs text-text-dim mt-0.5">
                  Only pay when a customer contacts you
                </p>
              </button>
              <button
                type="button"
                onClick={() => setBudgetType("monthly")}
                className={cn(
                  "flex-1 rounded-xl border-2 p-4 text-left transition-all",
                  budgetType === "monthly"
                    ? "border-brand bg-brand-light"
                    : "border-border bg-white"
                )}
              >
                <p className="font-medium text-text text-sm">Monthly Budget</p>
                <p className="text-xs text-text-dim mt-0.5">
                  Fixed monthly spend, we maximise your leads
                </p>
              </button>
            </div>

            {budgetType === "per_lead" ? (
              <div className="rounded-xl border border-border bg-white p-5">
                <label className="block text-sm font-medium text-text mb-1">
                  Bid per lead (AUD)
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-text-dim">$</span>
                  <input
                    type="number"
                    min="2"
                    step="0.50"
                    value={perLeadBid}
                    onChange={(e) => setPerLeadBid(e.target.value)}
                    className="w-32 rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
                  />
                </div>
                <p className="text-xs text-text-muted mt-2">
                  Higher bids = higher ranking in search results. Minimum $2/lead.
                </p>
              </div>
            ) : (
              <div className="rounded-xl border border-border bg-white p-5">
                <label className="block text-sm font-medium text-text mb-1">
                  Monthly budget (AUD)
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-text-dim">$</span>
                  <input
                    type="number"
                    min="49"
                    step="1"
                    value={monthlyBudget}
                    onChange={(e) => setMonthlyBudget(e.target.value)}
                    className="w-32 rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
                  />
                  <span className="text-text-dim text-sm">/ month</span>
                </div>
                <p className="text-xs text-text-muted mt-2">
                  Minimum $49/month. Higher budgets = more prominent placement.
                </p>
              </div>
            )}
          </div>

          {/* Submit */}
          <div className="flex items-center justify-between pt-4">
            <Link
              href="/dashboard"
              className="text-sm text-text-dim hover:text-text"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading || !selectedVertical}
              className="rounded-lg bg-brand px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-hover transition-colors disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create Campaign"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
