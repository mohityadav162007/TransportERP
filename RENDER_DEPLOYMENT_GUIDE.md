# 🚀 Hybrid Deployment Guide (Render + Vercel)

We will now deploy the **Backend on Render** and the **Frontend on Vercel**.

## 1. Push All Changes
Ensure you are in the root folder (`d:\TransportERP`).
```bash
git add .
git commit -m "Configure Render + Vercel deployment"
git push
```

---

## 2. Deploy Backend to Render
1.  Go to **Render.com** and create a **New Web Service**.
2.  Connect your GitHub repo.
3.  **Root Directory:** `backend`
4.  **Runtime:** `Node`
5.  **Build Command:** `npm install`
6.  **Start Command:** `node src/server.js`
7.  **Environment Variables**:
    *   `DATABASE_URL`: (Your Supabase URL)
    *   `JWT_SECRET`: (Your secret string)
8.  **Click Create Web Service.**
9.  **COPY the URL** once it's live (e.g., `https://transport-erp-backend.onrender.com`).

---

## 3. Deploy Frontend to Vercel
1.  Go to **Vercel** and create a **New Project**.
2.  Connect your GitHub repo.
3.  **Root Directory:** `frontend`
4.  **Framework Preset:** `Vite`
5.  **Environment Variables**:
    *   `VITE_API_URL`: Paste your **Render URL** followed by `/api` (e.g., `https://transport-erp-backend.onrender.com/api`).
6.  **Click Deploy.**

---

### ✅ Done!
Your Vercel frontend will now communicate with your Render backend. This is a very common and stable setup.
