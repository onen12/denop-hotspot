# Denop Hostel Wifi – Hotspot Billing System

Complete MikroTik hotspot billing platform with mobile money payments, vouchers, and one-click router configuration.

**Business:** Denop Hostel Wifi  
**Stack:** Next.js 15 · Supabase · Tailwind · Render

---

## Features

- **Admin Dashboard** – Routers, Packages, Vouchers, Transactions
- **RouterOS Script Generator** – Full auto-config for MikroTik:
  - IP `172.16.0.1/16` + pool + DHCP
  - Hotspot server & user profiles (from your packages)
  - NAT, Firewall, AP isolation (bridge horizon + filter)
  - Walled Garden for payment portal + captive detection
  - NTP, identity, logging
- **Customer Portal** – Mobile-first package selection + mobile money + voucher redeem
- **Both flows** – Pay → access / voucher, and pure voucher codes
- Ready for Supabase Auth + RLS

---

## Quick Start

### 1. Create Supabase project
1. Go to https://supabase.com → New project
2. Open **SQL Editor** → paste and run the contents of `supabase/schema.sql`
3. Copy **Project URL** and **anon key** from Settings → API

### 2. Local development
```bash
cd denop-hotspot
cp .env.example .env.local
# Edit .env.local with your Supabase keys

npm install
npm run dev
```
Open http://localhost:3000

### 3. Deploy to Render
1. Push this repo to GitHub
2. Create a **Web Service** on Render
3. Build command: `npm install && npm run build`
4. Start command: `npm start`
5. Add environment variables from `.env.example`
6. Set `NEXT_PUBLIC_APP_URL` to your Render URL

### 4. Configure a MikroTik
1. Go to **Admin → Routers**
2. Fill in interface names (hotspot + WAN)
3. Set **Portal Domain** to your Render domain
4. Click **Generate Script** → Download `.rsc`
5. In Winbox/Terminal: make a backup, then paste the script
6. Upload captive portal HTML files into the `hotspot` folder (Files menu)

---

## Mobile Money API

The payment flow is prepared as a placeholder.

When you have the API docs:
1. Paste the endpoints, auth method, and sample STK-push / callback payloads
2. We will implement:
   - `/api/payments/initiate`
   - `/api/payments/callback`
   - Automatic voucher creation on success
   - Optional direct MikroTik user creation (if router is reachable)

---

## Project Structure

```
src/
  app/
    page.tsx              # Landing
    portal/               # Customer captive portal
    admin/                # Admin panel
      routers/            # Script generator
      packages/
      vouchers/
      transactions/
  lib/
    mikrotik/
      script-generator.ts # Core RouterOS script builder
    supabase/
    types.ts
    utils.ts
supabase/
  schema.sql              # Full database schema + seed packages
```

---

## Default Packages (seeded)

| Package   | Price   | Duration | Data      | Speed      |
|-----------|---------|----------|-----------|------------|
| 1 Hour    | 500 UGX | 1h       | 500 MB    | 3 Mbps     |
| 3 Hours   | 1,000   | 3h       | 1.5 GB    | 5 Mbps     |
| 12 Hours  | 2,000   | 12h      | 5 GB      | 8 Mbps     |
| 24 Hours  | 3,000   | 24h      | Unlimited | 10 Mbps    |
| 7 Days    | 15,000  | 7d       | Unlimited | 15 Mbps    |

You can change these in the Packages page (after Supabase is connected) or directly in the database.

---

## Next Steps After Setup

1. Connect Supabase (schema + env vars)
2. Test script generation and paste on a test MikroTik
3. Paste your mobile money API documentation
4. (Optional) Enable Supabase Auth for admin login protection
5. Customize portal branding / logo

---

Built for **Denop Hostel Wifi**.
