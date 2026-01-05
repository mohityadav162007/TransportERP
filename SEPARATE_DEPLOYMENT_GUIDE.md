# 📦 Separate Deployment Guide (Frontend & Backend)

Since the combined deployment is complex, we will now deploy them as **two separate projects** in Vercel.

## 1. Push Code to GitHub
Ensure you are in the root folder (`d:\TransportERP`).
```bash
git add .
git commit -m "Configure separate deployments"
git push
```

---

## 2. Deploy the BACKEND Second
1.  In Vercel, create a **New Project** and select your repo.
2.  **Root Directory:** Select **`backend`**.
3.  **Framework Preset:** `Other`.
4.  **Environment Variables**:
    *   `DATABASE_URL`: (Your Supabase URL)
    *   `JWT_SECRET`: (Your secret)
    *   `NODE_ENV`: `production`
5.  **Click Deploy.**
6.  **COPY the Backend URL** (e.g., `https://transport-erp-backend-xxx.vercel.app`).

---

## 3. Deploy the FRONTEND First
1.  In Vercel, create **another** New Project and select the same repo.
2.  **Root Directory:** Select **`frontend`**.
3.  **Framework Preset:** `Vite`.
4.  **Environment Variables**:
    *   `VITE_API_URL`: Paste your Backend URL and add `/api` at the end (e.g., `https://backend-url.vercel.app/api`).
5.  **Click Deploy.**

---

### ✅ Done!
Now your frontend will talk directly to your separate backend URL. This avoids all the monorepo configuration headaches!
