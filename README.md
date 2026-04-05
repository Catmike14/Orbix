# ORBIX — Deploy to Render.com

## Step 1 — Push to GitHub

```bash
git init
git add .
git commit -m "ORBIX deploy"
git remote add origin https://github.com/YOUR_USERNAME/orbix.git
git push -u origin main
```

## Step 2 — Deploy on Render

1. Go to render.com → **New → Web Service**
2. Connect your GitHub repo
3. Render reads `render.yaml` automatically
4. Go to the **Environment** tab and confirm these vars are set:

| Variable | Value |
|---|---|
| `NODE_ENV` | `production` |
| `ADMIN_USERNAME` | `Mike` |
| `ADMIN_PASSWORD` | `Mike@1234!` |
| `SESSION_SECRET` | (auto-generated) |

5. Click **Deploy** — live in ~2 minutes ✅

## Step 3 — Add your Gemini API key

1. Open your ORBIX URL and log in
2. Click ⚙ Settings → paste Gemini key → click **Save**
3. Keys persist in localStorage on HTTPS ✅

## Logout
Logout button is in the bottom of the sidebar.
