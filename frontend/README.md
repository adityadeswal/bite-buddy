# Bite-Buddy Frontend

Mobile-first web app for Indian flatmates and their hired cook. Next.js 16 (App Router) + TypeScript + Tailwind v4 + shadcn/ui + TanStack Query.

## Getting started

```bash
npm install
cp .env.example .env.local   # edit if your backend isn't on :8000
npm run dev
```

Open http://localhost:3000. The landing page pings `GET /health` on the FastAPI backend to verify the wire.

## Prerequisites

The backend needs to be running on `http://localhost:8000`. See [`../backend/README.md`](../backend/README.md).

## Structure

```
src/
├── app/              # App Router routes, root layout, providers
├── components/ui/    # shadcn/ui primitives (owned, theme via globals.css)
├── lib/
│   ├── api.ts        # typed fetch wrapper around NEXT_PUBLIC_API_URL
│   ├── queryClient.ts
│   └── utils.ts
└── types/api.ts      # hand-written types mirroring backend/entities.py
```

## Scripts

- `npm run dev` — dev server (Turbopack, default in Next 16)
- `npm run build` — production build
- `npm run start` — serve the production build
- `npm run lint` — ESLint
