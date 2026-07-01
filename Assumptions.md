# Project Assumptions & Domain Models

This document details key assumptions, configurations, and decisions made during the design of the Bike Auction Platform.

---

## 🔑 Administrative Roles & Security
- **Role Assignment**: In a production enterprise system, role administration is managed via permission tables or external identity services (like Okta or Auth0). For this internship project:
  - Users are standard members by default upon registration.
  - Users whose emails match `@velocityauction.com` or who are manually set in the database to `role: 'admin'` are granted administrative routes access.
- **Admin Actions**: Creating new auction listings, deletion of draft items, and viewing dashboard aggregations are restricted to administrative tokens checked at route boundaries.

---

## ⏲️ Live Bidding Lifecycle Transitions
- **Time Clock Synchronicity**: To prevent discrepancies in auction closing times, time values are calculated and saved using MongoDB server-side dates.
- **Scheduler Worker Interval**: The background lifecycle processor transitions listing states (`scheduled` -> `live` -> `sold` / `ended`) on a 15-second timer. Users are informed of state changes dynamically via WebSockets, eliminating the need to reload detail panels.
- **Winner Settlement**: Upon completion:
  - If the highest bid amount meets or exceeds the `reservePrice`, the auction state transitions to `sold` and the bidder is declared the winner.
  - If the highest bid does not meet the reserve threshold, the listing transitions to `ended` (unsold).

---

## 🔒 Concurrency Safety (No Redis)
- **MongoDB Optimistic Locks**: To ensure thread-safety without external Redis caches, bidding concurrency is locked natively at the database level.
- **Atomic Operations**: It executes an atomic `findOneAndUpdate` matching `{ _id: auctionId, $or: [ { highestBidAmount: { $lt: amount } }, { highestBidAmount: 0 } ] }`. This ensures only the single highest bid succeeds and writes, rolling back duplicate writes.

---

## 🖼️ Media Management & Persistence
- **Storage Strategy**: Uploaded motorcycle images are saved locally to the backend `/uploads` folder.
- **Vercel / Cloud Compatibility**: When deployed to serverless hosts like Vercel (frontend) and Railway/Render (backend), local disk uploads are ephemeral. For direct cloud execution, a standard block storage backend (like AWS S3 or Cloudinary) can be swapped in, but local uploads are used for simplicity.
