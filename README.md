# TrastHero

A personal storage room inventory app. Track item name, quantity, and optional description, expiration date, and location. Data lives in [Supabase](https://supabase.com); the UI is a [Next.js](https://nextjs.org) app deployable on [Vercel](https://vercel.com).

## Stack

- **Frontend:** Next.js 15 (App Router), React, Tailwind CSS
- **Database:** Supabase (PostgreSQL)
- **Hosting:** Vercel (frontend)

## Local setup

### 1. Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. Open **SQL Editor** and run the migration in [`supabase/migrations/001_create_items.sql`](supabase/migrations/001_create_items.sql).
3. Copy your project URL and **publishable** key from **Project Settings → API** (the legacy anon key also works).

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

Open [http://localhost:3000](http://localhost:3000).

## Deploy

### Vercel

1. Push this repo to GitHub.
2. Import the repo in [Vercel](https://vercel.com/new).
3. Add the same `NEXT_PUBLIC_SUPABASE_*` variables in **Project Settings → Environment Variables**.
4. Deploy.

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
| location         | no       | text    |

Row Level Security is enabled with open policies for a personal single-user setup. If you add Supabase Auth later, tighten the policies in the migration file.

## License

Private / personal use.
