# CLAUDE.md — CheapX Ad Network

Provider self-serve advertising portal for the CheapXNearMe network.
Google Ads clone for Australian tradies and service providers.

## Quick Reference

```bash
npm run dev          # localhost:3334
npm run build        # Production build
git add -A && git commit -m "..." && git push    # Deploy (Vercel auto-deploys)
```

## Architecture

**Stack:** Next.js 15 | React 19 | Tailwind v4 | Supabase | Stripe | JWT Auth

```
src/
  app/
    page.tsx                        Landing page — marketing, pricing, CTA
    login/page.tsx                  Provider login
    signup/page.tsx                 Provider signup
    dashboard/page.tsx              Provider dashboard — stats, campaigns
    dashboard/campaigns/new/        Create new campaign
    api/auth/signup|login|logout    Auth endpoints
    api/dashboard/                  Dashboard data
    api/verticals/                  Available CheapX sites
    api/campaigns/                  Campaign CRUD
  lib/
    auth.ts                         JWT session management
    supabase.ts                     Supabase client
    types.ts                        TypeScript interfaces
    utils.ts                        Utilities
```

## Database

Uses a dedicated Supabase instance (TBD). Tables:
- `verticals` — the 6 CheapXNearMe sites
- `ad_providers` — advertiser accounts
- `ad_campaigns` — per-vertical ad spend config
- `ad_impressions` — search result appearances
- `ad_clicks` — clicks on listings
- `ad_leads` — quote requests
- `ad_billing` — Stripe payment records

## Theme

Light theme with blue brand (#0066ff). Uses Tailwind v4 CSS custom properties.
