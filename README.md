# TrastHero

A family storage room inventory app. Track item name, quantity, and optional description, expiration date, and location. Family members sign in with email and password; everyone shares the same inventory. Data lives in [Supabase](https://supabase.com); the UI is a [Next.js](https://nextjs.org) app deployable on [Vercel](https://vercel.com).

## Stack

- **Frontend:** Next.js 15 (App Router), React, Tailwind CSS
- **Database:** Supabase (PostgreSQL)
- **Hosting:** Vercel (frontend)

## Local setup

### 1. Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. Open **SQL Editor** and run, in order:
   - [`supabase/migrations/001_create_items.sql`](supabase/migrations/001_create_items.sql)
   - [`supabase/migrations/002_auth_rls.sql`](supabase/migrations/002_auth_rls.sql)
   - [`supabase/migrations/003_locations.sql`](supabase/migrations/003_locations.sql)
   - [`supabase/migrations/004_remove_armario_derecha_locations.sql`](supabase/migrations/004_remove_armario_derecha_locations.sql) (if you already ran 003 with old defaults)
   - [`supabase/migrations/005_tags.sql`](supabase/migrations/005_tags.sql)
   - [`supabase/migrations/006_tags_grants.sql`](supabase/migrations/006_tags_grants.sql)
3. Enable **Authentication → Providers → Email** (email + password).
4. Copy your project URL and **publishable** key from **Project Settings → API** (the legacy anon key also works).

### 2. Environment

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
```

### 3. Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Create an account (or sign in), then use the inventory.

## Authentication (family)

- Each family member **creates an account** with email + password, or you create users for them in **Authentication → Users** in the Supabase dashboard.
- All signed-in users see and edit the **same shared** storage list (one household inventory).
- **Email confirmation:** If enabled under **Authentication → Providers → Email**, new users must confirm their email before signing in. For a small family app you can turn confirmation off to keep signup simple.
- **Limit who can register:** In **Authentication → Providers → Email**, disable “Allow new users to sign up” after everyone has accounts. You can still add members manually from the dashboard.

## Deploy on Vercel

Code is on [GitHub](https://github.com/adoestreito/trastHero). Deploy from the dashboard (recommended):

### 1. Import project

1. Go to [vercel.com/new](https://vercel.com/new) and sign in with GitHub.
2. Import **adoestreito/trastHero**.
3. Framework preset should be **Next.js** (auto-detected). Leave build settings as default.

### 2. Environment variables

Before deploying, add **Environment Variables** (same values as in your local `.env.local`):

| Name | Environments |
|------|----------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Production, Preview, Development |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Production, Preview, Development |

### 3. Deploy

Click **Deploy**. Vercel will build and give you a URL like `https://trast-hero.vercel.app`.

### 4. Supabase auth (required for login on production)

In Supabase → **Authentication** → **URL Configuration**:

- **Site URL:** your Vercel production URL (e.g. `https://trast-hero.vercel.app`)
- **Redirect URLs:** add `https://trast-hero.vercel.app/**` (and preview URLs if you use them)

### CLI (optional)

```bash
npx vercel login
npx vercel link
npx vercel env add NEXT_PUBLIC_SUPABASE_URL
npx vercel env add NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
npx vercel --prod
```

### Git remote

```bash
git init
git remote add origin https://github.com/adoestreito/trastHero.git
git add .
git commit -m "Initial TrastHero storage inventory app"
git push -u origin main
```

## Data model

| Field            | Required | Type    |
|------------------|----------|---------|
| name             | yes      | text    |
| quantity         | yes      | integer |
| description      | no       | text    |
| expiration_date  | no       | date    |
| location         | no       | select from `locations` (defaults: armario izquierda, armario ezquina derecha, congelador; add more in the app) |
| tags             | no       | many tags per item; shared tag list; searchable |

Row Level Security allows only **authenticated** users to read and write items (see `002_auth_rls.sql`).

## License

Private / personal use.
