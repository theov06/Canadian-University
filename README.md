# 🍁 Canada BA Explorer

A polished web app helping international students compare Bachelor of Arts programs across Canadian universities.

## Features

- **Search & Filter** — Find programs by tuition, IELTS, province, co-op, city size
- **Program Details** — Full cost breakdown, requirements, career outcomes
- **Compare** — Side-by-side comparison of up to 4 programs
- **Beginner-Friendly** — Tooltips explaining IELTS, co-op, tuition vs total cost
- **Dark Mode** — Light and dark theme support
- **12 Universities, 16 Programs** — Curated sample data included

## Tech Stack

- **Frontend**: Next.js 14 (App Router) + React + TypeScript + Tailwind CSS
- **API**: Next.js API Routes (can be swapped for standalone Express/FastAPI)
- **Database**: PostgreSQL (with in-memory fallback for demo)
- **Scraper**: Python (BeautifulSoup + Playwright)

## Quick Start

```bash
# 1. Install dependencies
cd canada-ba-explorer
npm install

# 2. Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

The app works immediately with built-in sample data — no database required for demo.

## Database Setup (Optional)

For production with PostgreSQL:

```bash
# 1. Create .env.local
cp .env.example .env.local
# Edit DATABASE_URL in .env.local

# 2. Run migrations
npm run db:migrate

# 3. Seed sample data
npm run db:seed
```

## Scraper

```bash
cd scraper
pip install -r requirements.txt
python scrape_programs.py
```

## Project Structure

```
canada-ba-explorer/
├── src/
│   ├── app/                  # Next.js pages & API routes
│   │   ├── page.tsx          # Homepage
│   │   ├── search/page.tsx   # Search results
│   │   ├── program/[id]/     # Program detail
│   │   ├── compare/page.tsx  # Comparison table
│   │   └── api/              # REST API endpoints
│   ├── components/           # Reusable UI components
│   ├── data/                 # Sample/fallback data
│   ├── lib/                  # Database connection
│   └── types/                # TypeScript types
├── scripts/                  # DB migration & seed
├── scraper/                  # Python scraping tools
└── README.md
```

## Deployment

- **Frontend + API**: Deploy to [Vercel](https://vercel.com) (zero config for Next.js)
- **Database**: Use [Supabase](https://supabase.com) for managed PostgreSQL
- Set `DATABASE_URL` environment variable in your deployment platform

## Data Sources

All tuition and requirement data is sourced from official university websites.
Each data point includes a `source_url` and `last_updated` timestamp.
Data is for reference only — always verify with official sources before applying.
