# Deployment & Verification Guide

This guide details steps to run and verify the platform components locally or deploy them directly to cloud platforms (like Vercel, Railway, Render, and MongoDB Atlas).

---

## 🚀 Local Run (Simplified Architecture)

### 1. Prerequisites
- [Node.js](https://nodejs.org/) v18+ installed.
- MongoDB instance running locally (e.g. `mongodb://localhost:27017`) or a connection string to a MongoDB Atlas cluster.

### 2. Startup Backend API
1. Navigate to the `/backend` folder:
   ```bash
   cd backend
   ```
2. Configure `.env` file (e.g., set `MONGODB_URI` and `JWT_SECRET`).
3. Install dependencies and start the hot-reload dev server:
   ```bash
   npm install
   npm run dev
   ```
   The backend API will listen on port `5000`.

### 3. Startup Frontend SPA
1. Open a new terminal and navigate to the `/frontend` folder:
   ```bash
   cd frontend
   ```
2. Install dependencies and start Vite dev server:
   ```bash
   npm install
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) to view the portal.

---

## ☁️ Cloud Deployment

### 1. Database (MongoDB Atlas)
1. Register a free shared sandbox cluster at [MongoDB Atlas](https://www.mongodb.com/products/platform/atlas-database).
2. Create a database user and whitelist access IPs (e.g. `0.0.0.0/0` for cloud deployment).
3. Copy the cluster connection URI string.

### 2. Backend (Render / Railway)
1. Connect your repository to Railway or Render.
2. Select root directory `/backend`.
3. Set the Build Command: `npm run build` and Start Command: `npm start`.
4. Configure Environment variables:
   - `PORT`: `5000` (or leave default, Railway binds port automatically)
   - `MONGODB_URI`: `<Atlas Connection String>`
   - `JWT_SECRET`: `<Secure secret>`
   - `JWT_REFRESH_SECRET`: `<Secure secret>`
   - `NODE_ENV`: `production`

### 3. Frontend (Vercel)
1. Deploy the `/frontend` directory via Vercel dashboard.
2. Ensure Vercel is configured with:
   - Framework Preset: `Vite`
   - Build Command: `npm run build`
   - Output Directory: `dist`
3. Since Vercel is served via HTTPS and handles proxies differently, make sure your production backend URL (e.g., `https://your-backend-service.railway.app`) is configured in client calls.

---

## 🧪 E2E Manual Verification Flow

### 1. Health checks
Check status:
```bash
curl http://localhost:5000/health
```
Expected output (200 OK):
```json
{
  "status": "healthy",
  "services": {
    "mongodb": "UP"
  }
}
```

### 2. Admin Creation
Register an account with email ending in `@velocityauction.com` (which automatically flags `role: 'admin'`).

### 3. Placing Real-Time Bids
- Log in on the web portal.
- Create an auction listing under the **Admin** dashboard.
- Log in on a separate standard account in another browser window and navigate to the auction details.
- Submit a bid and watch the live updates propagate instantly using WebSockets.
