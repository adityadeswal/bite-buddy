# Deploying Bite Buddy

Split deploy: **Vercel** (Next.js frontend) + **Render** (FastAPI backend). DB is Supabase Postgres (already configured).

## 1. Backend → Render

The repo includes `backend/render.yaml` (Blueprint) so Render auto-detects everything.

1. Push this repo to GitHub.
2. On https://dashboard.render.com → **New +** → **Blueprint** → pick this repo.
3. Render reads `backend/render.yaml` and creates the web service.
4. In the service's **Environment** tab, set these (values from `backend/.env.example`):
   - `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` — your Supabase values.
   - `CORS_ORIGINS` — set **after** step 2 below (your Vercel URL, comma-separated).
   - `CORS_ORIGIN_REGEX` *(optional)* — e.g. `^https://bite-buddy-[a-z0-9-]+\.vercel\.app$` to allow Vercel preview deploys.
5. Deploy. Health check: `https://<service>.onrender.com/health` → `{"status":"ok"}`.

> Render free tier sleeps after 15 min idle (~30s cold start on first hit). Fine for a demo — just hit `/health` once before the demo.

## 2. Frontend → Vercel

1. https://vercel.com/new → import the repo.
2. **Root Directory:** `frontend`.
3. Framework preset auto-detects Next.js. Leave build/output defaults.
4. **Environment Variables:**
   - `NEXT_PUBLIC_API_URL` = `https://<your-render-service>.onrender.com`
5. Deploy. Copy the assigned URL (e.g. `https://bite-buddy.vercel.app`).

## 3. Wire CORS

Back on Render, set `CORS_ORIGINS` to the Vercel URL (and any custom domain), then redeploy the backend:

```
CORS_ORIGINS=https://bite-buddy.vercel.app,http://localhost:3000
```

## Local development

```bash
# backend
cd backend && cp .env.example .env   # fill in DB creds
pip install -r requirements.txt
python main.py

# frontend (separate terminal)
cd frontend && cp .env.example .env.local
npm install && npm run dev
```

## Security note

`backend/.env` is currently tracked in git (with real DB credentials). Before going public:

```bash
git rm --cached backend/.env
git commit -m "Untrack backend/.env"
```

Then rotate the Supabase password since it's been in git history.
