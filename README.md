# VelocityAuction – Live Bike Auction Platform

VelocityAuction is a full-stack web application that enables users to participate in live motorcycle auctions in real time. Users can browse available bikes, place bids, track ongoing auctions, and view auction results. Administrators can create and manage auctions, upload bike images, and monitor platform activity through a dedicated dashboard.

The project is built using the MERN stack with TypeScript and Socket.IO to provide a seamless real-time bidding experience.

---

## Features

### User Features

- User registration and secure login
- JWT-based authentication with refresh tokens
- Browse live and upcoming auctions
- View motorcycle details
- Place bids in real time
- Live bid history
- Countdown timer for auctions
- View won auctions
- Responsive user interface

### Admin Features

- Secure admin dashboard
- Create new auctions
- Update existing auctions
- Delete auctions
- Upload motorcycle images
- Monitor auction statistics
- Automatic auction scheduling

### Security

- JWT Authentication
- Password hashing using bcrypt
- Role-based authorization
- Request validation using Zod
- Rate limiting
- Helmet security headers
- NoSQL injection protection
- Secure file upload validation

---

# Tech Stack

## Frontend

- React
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Axios
- React Query
- Socket.IO Client

## Backend

- Node.js
- Express
- TypeScript
- MongoDB
- Mongoose
- Socket.IO
- JWT
- Multer
- Zod
- Pino Logger

---

# Project Structure

```
Velocity-Auction/
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── repositories/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── sockets/
│   │   ├── validators/
│   │   └── jobs/
│   │
│   └── tests/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── services/
│   │   └── utils/
│
├── README.md
├── API_Documentation.md
├── Architecture.md
├── Deployment_Guide.md
└── Assumptions.md
```

---

# Getting Started

## Prerequisites

Make sure you have the following installed:

- Node.js (v18 or later)
- npm
- MongoDB (Local or MongoDB Atlas)

---

## Clone the Repository

```bash
git clone https://github.com/shreyakumari0911/Velocity-Auction.git

cd Velocity-Auction
```

---

# Environment Variables

Create a `.env` file inside the **backend** folder.

Example:

```env
PORT=5000

MONGODB_URI=your_mongodb_connection_string

JWT_SECRET=your_jwt_secret

JWT_REFRESH_SECRET=your_refresh_secret

ACCESS_TOKEN_EXPIRY=15m

REFRESH_TOKEN_EXPIRY=7d

NODE_ENV=development

FRONTEND_URL=http://localhost:3000
```

---

# Running the Backend

```bash
cd backend

npm install

npm run dev
```

Backend runs on:

```
http://localhost:5000
```

---

# Running the Frontend

```bash
cd frontend

npm install

npm run dev
```

Frontend runs on:

```
http://localhost:3000
```

---

# Running Tests

Backend tests:

```bash
cd backend

npm test
```

---

# API Documentation

Detailed API documentation is available in:

- `API_Documentation.md`

---

# Architecture

Project architecture and design decisions are documented in:

- `Architecture.md`

---

# Deployment

Deployment instructions are available in:

- `Deployment_Guide.md`

The project can be deployed using:

- Vercel (Frontend)
- Railway / Render (Backend)
- MongoDB Atlas

---

# Screenshots

You can add screenshots of:

- Home Page
- Login Page
- Admin Dashboard
- Live Auction
- Bidding Page

---

# Future Improvements

Some enhancements planned for future versions include:

- Email notifications
- Payment gateway integration
- User profile management
- Auction analytics dashboard
- Advanced search and filters
- Mobile application

---

# Author

**Shreya Kumari**

GitHub: https://github.com/shreyakumari0911

---

# Linkedin

https://www.linkedin.com/in/sk0911/

---

# Live Demo Video

https://github.com/user-attachments/assets/a1231a16-30ed-4e3e-9aee-70584507cc4e



