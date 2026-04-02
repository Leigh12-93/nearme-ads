"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Zap, ArrowLeft } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    business_name: "",
    contact_name: "",
    email: "",
    phone: "",
    password: "",
    state: "SA",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Signup failed");
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-surface-dim flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-text-dim hover:text-text mb-6">
            <ArrowLeft className="h-4 w-4" /> Back to home
          </Link>
          <div className="flex items-center justify-center gap-2 mb-2">
            <Zap className="h-6 w-6 text-brand" />
            <span className="text-xl font-bold">CheapX Ad Network</span>
          </div>
          <p className="text-text-dim text-sm">Create your free advertiser account</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-xl border border-border bg-white p-6 space-y-4"
        >
          {error && (
            <div className="rounded-lg bg-danger-light border border-danger/20 p-3 text-sm text-danger">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-text mb-1">
              Business Name *
            </label>
            <input
              type="text"
              required
              value={form.business_name}
              onChange={(e) => setForm({ ...form, business_name: e.target.value })}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
              placeholder="e.g. Smith Electrical Services"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text mb-1">
              Contact Name
            </label>
            <input
              type="text"
              value={form.contact_name}
              onChange={(e) => setForm({ ...form, contact_name: e.target.value })}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
              placeholder="Your name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text mb-1">
              Email *
            </label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
              placeholder="you@business.com.au"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text mb-1">
              Phone
            </label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
              placeholder="04XX XXX XXX"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text mb-1">
              State
            </label>
            <select
              value={form.state}
              onChange={(e) => setForm({ ...form, state: e.target.value })}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
            >
              <option value="SA">South Australia</option>
              <option value="NSW">New South Wales</option>
              <option value="VIC">Victoria</option>
              <option value="QLD">Queensland</option>
              <option value="WA">Western Australia</option>
              <option value="TAS">Tasmania</option>
              <option value="NT">Northern Territory</option>
              <option value="ACT">ACT</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-text mb-1">
              Password *
            </label>
            <input
              type="password"
              required
              minLength={8}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
              placeholder="At least 8 characters"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-brand py-2.5 text-sm font-semibold text-white hover:bg-brand-hover transition-colors disabled:opacity-50"
          >
            {loading ? "Creating Account..." : "Create Free Account"}
          </button>

          <p className="text-center text-sm text-text-dim">
            Already have an account?{" "}
            <Link href="/login" className="text-brand hover:underline">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
