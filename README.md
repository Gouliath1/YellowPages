# Yellow Pages Demo

Fast internal people finder demo built with Next.js (App Router) + TypeScript + Tailwind. Provides search-as-you-type, fuzzy matching, filters, rich cards, a compact list view, favourites, recent searches, and shareable profile URLs — all backed by a local JSON data set for quick demos.

## Features
- Search-as-you-type with debounce and inline suggestions (top results)
- Fuzzy-ish matching across name, email, department, location, job title, nicknames
- Filters for department and location, plus “clear all”
- Two result layouts: cards and flat list (desktop shows column headers)
- Quick actions: email, call, Teams chat; deep links to `/person/{id}`
- Favourites (pinned contacts) and recent searches stored locally
- Mobile-friendly layout, keyboard shortcuts (`/` to focus, arrows + enter for suggestions)

## Tech
- Next.js 16 (App Router) + React + TypeScript
- Tailwind (v4) styling
- API routes under `/api/contacts` reading from local JSON (`src/data/contacts.json`)

## Running locally
```bash
npm install
npm run dev
# open http://localhost:3000
```

## API (demo)
- `GET /api/contacts?q=&department=&location=&limit=` — search and filter contacts
- `GET /api/contacts/:id` — fetch one contact

## Data
`src/data/contacts.json` holds ~24 sample contacts with fields like name, email, department, location, jobTitle, phone, nicknames, languages, etc. Swap this file or wire to a real DB later without changing the UI.

## Deploying
Target is simple hosting (e.g., AWS Amplify for full-stack Next.js). Standard `npm run build` works for static/SSR builds.
