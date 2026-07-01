# API Reference Documentation

All application endpoints are versioned under `/api/v1`. Payloads use JSON format unless otherwise specified (e.g. multi-part image uploads).

---

## 🔐 Authentication Endpoints

### 1. Register User
- **URL**: `POST /auth/register`
- **Payload**:
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }
  ```
- **Response** (201 Created):
  ```json
  {
    "message": "User registered successfully",
    "userId": "507f1f77bcf86cd799439011"
  }
  ```

### 2. Login User
- **URL**: `POST /auth/login`
- **Payload**:
  ```json
  {
    "email": "john@example.com",
    "password": "password123"
  }
  ```
- **Response** (200 OK):
  - Sets HTTP-Only `refreshToken` cookie.
  - Returns:
    ```json
    {
      "accessToken": "eyJhbGciOi...",
      "user": {
        "id": "507f1f77bcf86cd799439011",
        "name": "John Doe",
        "email": "john@example.com",
        "role": "user"
      }
    }
    ```

### 3. Refresh Session
- **URL**: `POST /auth/refresh`
- **Response** (200 OK):
  - Re-evaluates cookie, returns new ephemeral `accessToken`.

### 4. Logout User
- **URL**: `POST /auth/logout`
- **Response** (200 OK):
  - Revokes refresh token in Redis and clears HTTP cookies.

---

## 🏍️ Auction Endpoints

### 1. Query Auction Catalog
- **URL**: `GET /auctions`
- **Query Params**:
  - `status`: Filter by status (`draft`, `scheduled`, `live`, `ended`, `sold`).
  - `search`: Make/model fuzzy search.
  - `brand`: Brand string search.
  - `minPrice` / `maxPrice`: Pricing range filter.
  - `page` / `limit`: Pagination keys.
- **Response** (200 OK):
  ```json
  {
    "auctions": [...],
    "total": 12,
    "page": 1,
    "pages": 2
  }
  ```

### 2. View Single Auction Detail
- **URL**: `GET /auctions/:id`
- **Response** (200 OK):
  - Returns complete populating details of the Auction, Bike specs, and Seller profile.

### 3. View Auction Bid History
- **URL**: `GET /auctions/:id/bids`
- **Response** (200 OK):
  - Returns descending array log of historical bids placed.

---

## 🛠️ Admin Endpoints

### 1. Load Dashboard Metrics
- **URL**: `GET /admin/dashboard`
- **Authorization**: Requires authenticated session with `admin` role.
- **Response** (200 OK):
  ```json
  {
    "usersCount": 10,
    "bidsCount": 42,
    "auctions": {
      "draft": 0,
      "scheduled": 1,
      "live": 3,
      "ended": 1,
      "sold": 2
    },
    "totalVolume": 75000
  }
  ```

### 2. Register New Motorcycle Listing
- **URL**: `POST /admin/auctions`
- **Payload**: Full bike specs and starting prices.
- **Response** (201 Created).

### 3. Multi-image Upload
- **URL**: `POST /admin/upload`
- **Payload**: Multi-part Form Data (`images` files key).
- **Response** (200 OK):
  ```json
  {
    "urls": [
      "/uploads/1625000000000-image1.jpg",
      "/uploads/1625000000000-image2.jpg"
    ]
  }
  ```
