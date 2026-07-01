# Live Bike Auction Platform (VelocityAuction)

A production-grade, real-time motorcycle bidding auction platform built with a modern decoupled stack. Designed with a clean layered architecture, robust database models, MongoDB atomic concurrency protection, automated status lifecycle jobs, and Pino logging.

The application is fully compatible with direct serverless and cloud deployments (e.g. Vercel for frontend, Railway/Render for backend, and MongoDB Atlas).

---

## 🛠️ Tech Stack

- **Backend**: Node.js, Express, TypeScript, Mongoose/MongoDB, Socket.io, Pino
- **Frontend**: React, Vite, TypeScript, Tailwind CSS, Lucide Icons, Axios, React Query
- **Authentication**: JWT Cookies
- **Validation**: Zod

---

## 📂 Project Structure

- **`/backend`**: Core API server, Pino log configurations, cron status worker, Socket.io ws gateway, and Jest testing files.
- **`/frontend`**: React Vite SPA with responsive, dark-mode-ready visual components.

---

## 📖 Supporting Documentation

To examine architectural details, endpoints, and assumptions, read:

1. [Architecture & Design Docs](./Architecture.md)
2. [API Documentation Reference](./API_Documentation.md)
3. [Deployment Guide & Setup](./Deployment_Guide.md)
4. [Project Assumptions & Decouplings](./Assumptions.md)

---

## 🚀 Quick Start (Running Locally)

### 1. Start MongoDB
Ensure MongoDB is running locally (e.g., `mongodb://localhost:27017`) or configure a MongoDB Atlas cluster URI in `backend/.env`.

### 2. Run the Backend API:
```bash
cd backend
npm install
npm run dev
```
Serves on: [http://localhost:5000](http://localhost:5000)

### 3. Run the Frontend SPA:
```bash
cd frontend
npm install
npm run dev
```
Serves on: [http://localhost:3000](http://localhost:3000)

---

## 🧪 Running Tests Locally

```bash
cd backend
npm test
```
