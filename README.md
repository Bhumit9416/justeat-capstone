# 🍕 JustEat — Full-Stack Food Ordering Platform

A production-style food ordering web application with separate dashboards for **Customers** and **Restaurant Owners**, real-time order tracking, JWT authentication, SMTP password reset, and a Zomato/Swiggy-inspired UI.

---

## 📸 Tech Stack

| Layer      | Technology                                                                 |
|------------|---------------------------------------------------------------------------|
| Frontend   | React 18 · Vite · Tailwind CSS v4 · Framer Motion · React Router v6      |
| Backend    | Spring Boot 3.2.4 · Java 21 · Spring Security · JWT · Spring Data JPA    |
| Database   | PostgreSQL 16 (production) · H2 in-memory (tests)                        |
| Auth       | JWT Bearer tokens · BCrypt password hashing                               |
| Email      | JavaMailSender · Gmail SMTP · 4-digit OTP reset codes                    |
| API Docs   | SpringDoc OpenAPI 2.3 · Swagger UI                                        |
| Containers | Docker · Docker Compose                                                   |
| Testing    | JUnit 5 · Mockito · Spring Boot Test                                      |

---

## ✨ Features

### 👤 Authentication
- Register as **Customer** or **Restaurant Owner**
- Login with JWT — per-field inline error messages + shake animation on failure
- **Forgot password** — 2-step flow on a single page: enter email → receive 4-digit code → reset password
- Password strength meter, confirm-match validator

### 🛍️ Customer
- **Home Page** — hero banner, personalised recommendations (based on saved preferences), favourites strip, cuisine filter tiles (with gradients + spring animations), veg/non-veg toggle, sort by rating/name
- **Favourites** — heart button on every card, persisted in `localStorage`, single toast notification, header button scrolls to section
- **Restaurant Page** — full menu with category tabs, search, veg/non-veg filter, "Most Popular" section with food images, cart sidebar
- **Order Tracking Page** — Zomato-style: live countdown timer from `createdAt`, status stepper (Placed → Confirmed → Out for Delivery → Delivered), rider card, order summary, bill breakdown, tip, post-delivery rating
- **My Orders** — order history
- **Preferences** — save favourite cuisines, dietary restrictions

### 🏪 Restaurant Owner
- **Dashboard** — stats overview, own restaurant management
- **Menu Management** — add/edit/delete items with image URL, price, isVeg toggle, Special / Deal of Day / Mostly Ordered flags

### ⭐ Rating System
- Customers rate restaurants after delivery
- Weighted rolling average: `(rating × count + newRating) / (count + 1)`
- Live star picker, submit spinner, recap display

---

## 🗂️ Project Structure

```
capstone/
├── backend/                        # Spring Boot application
│   ├── src/main/java/com/justeat/
│   │   ├── config/                 # SecurityConfig, OpenApiConfig, WebConfig
│   │   ├── controller/             # REST controllers (Auth, Restaurant, Menu, Order, Preference)
│   │   ├── dto/                    # Request/Response DTOs
│   │   ├── entity/                 # JPA entities (User, Restaurant, MenuItem, Order, OrderItem, UserPreference)
│   │   ├── enums/                  # Role, OrderStatus
│   │   ├── exception/              # GlobalExceptionHandler, custom exceptions
│   │   ├── logging/                # RequestLoggingInterceptor
│   │   ├── mapper/                 # EntityMapper (entity ↔ DTO)
│   │   ├── repository/             # Spring Data JPA repositories
│   │   ├── security/               # JwtUtil, JwtAuthFilter, CustomUserDetailsService
│   │   └── service/                # Service interfaces + implementations
│   └── src/test/                   # JUnit 5 unit tests
│
├── frontend/                       # React + Vite application
│   └── src/
│       ├── api/                    # Axios API clients (auth, restaurants, menu, orders, preferences)
│       ├── context/                # AuthContext (JWT state, login/register/logout)
│       ├── pages/
│       │   ├── auth/               # LoginPage, RegisterPage, ForgotPasswordPage, ResetPasswordPage
│       │   ├── customer/           # CustomerHomePage, RestaurantPage, OrderTrackingPage, MyOrdersPage, PreferencesPage
│       │   └── owner/              # OwnerDashboardPage, MenuManagementPage
│       └── routes/                 # ProtectedRoute, RoleRoute
│
├── docker-compose.yml              # PostgreSQL + Backend containers
└── README.md
```

---

## 🗄️ ER Diagram

```
USER ──────────────── RESTAURANT ──────────── MENU_ITEM
 │  (owner)                │                    │
 │                     ORDER ──────────── ORDER_ITEM
 │                         │
 └──── USER_PREFERENCE     │ (customer)
```

Six entities: `User`, `Restaurant`, `MenuItem`, `Order`, `OrderItem`, `UserPreference`

---

## ⚙️ Prerequisites

- **Java 21** (JDK)
- **Maven 3.9+**
- **Node.js 20+** and **npm 9+**
- **PostgreSQL 16** running locally on port `5432`
- **Docker & Docker Compose** *(optional)*
- Gmail App Password configured for SMTP (see [Configuration](#-configuration))

---

## 🚀 Running Locally

### 1 — Database
Create a PostgreSQL database named `justeat`:
```sql
CREATE DATABASE justeat;
```

### 2 — Backend
```bash
cd backend
mvn clean spring-boot:run
```
Backend starts on **http://localhost:8081**

### 3 — Frontend
```bash
cd frontend
npm install
npm run dev
```
Frontend starts on **http://localhost:5173**

> Vite proxies `/api/**` requests to `http://localhost:8081` automatically — no CORS issues.

---

## 🐳 Running with Docker

```bash
# From the project root
docker compose build
docker compose up
```

Starts:
- PostgreSQL on `localhost:5432`
- Backend on `localhost:8080`

Then run the frontend separately with `npm run dev`.

---

## 📖 API Documentation (Swagger)

Once the backend is running, visit:

| Resource         | URL                                          |
|------------------|----------------------------------------------|
| **Swagger UI**   | http://localhost:8081/swagger-ui.html        |
| **OpenAPI JSON** | http://localhost:8081/api-docs               |

### Authenticating in Swagger
1. Call `POST /api/auth/login` → copy the `token` from the response
2. Click **Authorize 🔒** (top right)
3. Enter `Bearer <your_token>`
4. All protected endpoints are now unlocked

### API Groups

| Tag            | Base Path                         | Auth Required |
|----------------|-----------------------------------|---------------|
| Authentication | `/api/auth/**`                    | ❌ Public      |
| Restaurants    | `/api/restaurants/**`             | GET: ❌ / Mutate: ✅ OWNER |
| Menu           | `/api/restaurants/{id}/menu/**`   | GET: ❌ / Mutate: ✅ OWNER |
| Orders         | `/api/orders/**`                  | ✅ CUSTOMER   |
| Preferences    | `/api/preferences/**`             | ✅ CUSTOMER   |

---

## 🔑 Key Endpoints

```
POST   /api/auth/register                    Register (CUSTOMER or OWNER)
POST   /api/auth/login                       Login → JWT token
POST   /api/auth/forgot-password?email=      Send 4-digit reset code
POST   /api/auth/reset-password              Reset password with code

GET    /api/restaurants                      List / search restaurants
POST   /api/restaurants                      Create restaurant (OWNER)
PUT    /api/restaurants/{id}                 Update restaurant (OWNER)
DELETE /api/restaurants/{id}                 Delete restaurant (OWNER)
PATCH  /api/restaurants/{id}/rate?rating=    Rate a restaurant (CUSTOMER)

GET    /api/restaurants/{id}/menu            Get menu items
POST   /api/restaurants/{id}/menu            Add menu item (OWNER)
PUT    /api/restaurants/{id}/menu/{itemId}   Update menu item (OWNER)
DELETE /api/restaurants/{id}/menu/{itemId}   Delete menu item (OWNER)

POST   /api/orders                           Place order (CUSTOMER)
GET    /api/orders                           My order history (CUSTOMER)
GET    /api/orders/{id}                      Get single order (CUSTOMER)

GET    /api/preferences                      Get my preferences (CUSTOMER)
POST   /api/preferences                      Save preferences (CUSTOMER)
```

---

## 🔧 Configuration

**`backend/src/main/resources/application.properties`**

```properties
# Server
server.port=8081

# PostgreSQL
spring.datasource.url=jdbc:postgresql://localhost:5432/justeat
spring.datasource.username=postgres
spring.datasource.password=YOUR_PASSWORD

# JPA
spring.jpa.hibernate.ddl-auto=update      # auto-creates/migrates tables

# JWT
app.jwt.secret=YOUR_256BIT_HEX_SECRET
app.jwt.expiration-ms=86400000            # 24 hours

# Gmail SMTP (for forgot-password 4-digit code)
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=your@gmail.com
spring.mail.password=YOUR_APP_PASSWORD    # Gmail App Password (not your login password)
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true
spring.mail.properties.mail.smtp.ssl.trust=smtp.gmail.com

# Swagger
springdoc.api-docs.path=/api-docs
springdoc.swagger-ui.path=/swagger-ui.html
```

> **Gmail App Password**: Go to Google Account → Security → 2-Step Verification → App Passwords → Generate one for "Mail".

---

## 🧪 Tests

Run all backend unit tests:
```bash
cd backend
mvn test
```

Test coverage includes:

| Test Class                  | What it tests                                      |
|-----------------------------|----------------------------------------------------|
| `AuthServiceTest`           | Register, duplicate username/email, login, JWT     |
| `RestaurantServiceTest`     | CRUD, search by name/cuisine/location, rating      |
| `MenuServiceTest`           | Add/update/delete items, isVeg, imageUrl           |
| `OrderServiceTest`          | Place order, status update, history                |
| `UserPreferenceServiceTest` | Save and retrieve preferences                      |
| `JwtUtilTest`               | Token generation, validation, expiry               |

Test profile uses an **H2 in-memory database** — no PostgreSQL needed for tests.

---

## 🤝 Contributing

1. Fork the repo
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m 'feat: add my feature'`
4. Push and open a Pull Request

---

## 📄 AI Usage

See [AI_USAGE.md](./AI_USAGE.md) for a detailed account of how AI tools (GitHub Copilot) were used during development.

---

## 📝 License

MIT © 2026 Bhumit Mittal
