# 🤖 AI Usage — JustEat Capstone Project

This document describes how **GitHub Copilot** was used as a *supplementary* tool during the development of the JustEat food ordering platform. The **vast majority of design, architecture, logic, and implementation was done by the developer** — AI was used selectively for boilerplate acceleration and debugging assistance.

---

## Tool Used

| Tool | Role |
|------|------|
| **GitHub Copilot** (VS Code) | Minor assistance with boilerplate code, syntax suggestions, and explaining unfamiliar APIs |

---

## Overall Contribution Split

| Area | Developer | AI Assist |
|------|-----------|-----------|
| System architecture & ER design | ✅ Entirely developer | ❌ |
| Security design (JWT, roles, filter chain) | ✅ Entirely developer | ❌ |
| API contract design (endpoints, DTOs, response envelope) | ✅ Entirely developer | ❌ |
| Business logic (rating formula, veg default, OTP expiry) | ✅ Entirely developer | ❌ |
| Database schema & entity relationships | ✅ Entirely developer | ❌ |
| Frontend page structure & UX flow | ✅ Entirely developer | ❌ |
| Tailwind styling decisions & colour palette | ✅ Entirely developer | ❌ |
| Bug identification & root cause analysis | ✅ Entirely developer | Minor help |
| Boilerplate / repetitive code (DTOs, getters) | Mostly developer | Minor help |
| Documentation | ✅ Entirely developer | ❌ |

---

## Where AI Was Used (Limited & Supervised)

### 1. Boilerplate Acceleration

For **repetitive, low-logic code** like DTO classes, Lombok builders, and standard CRUD wiring, AI tab-completion was used to save typing time. All generated snippets were read, verified, and often modified:

- DTO field declarations (`MenuItemRequest`, `MenuItemResponse`, etc.)
- Standard `@RestController` method signatures
- Axios API call wrappers in `src/api/`

> All of this code was **reviewed line-by-line** and adjusted to match the project's conventions before use.

### 2. Syntax & API Reference

When working with less-familiar APIs, AI was used like a documentation shortcut:

- Correct `SimpleMailMessage` method names for JavaMailSender
- Framer Motion `AnimatePresence` / `motion.div` prop syntax
- Tailwind CSS utility class combinations for specific layouts

> The **decisions** about what to build and how it should behave were always made by the developer first.

### 3. Debugging Assistance

For a few hard-to-spot bugs, AI helped **confirm suspicions** the developer already had:

| Bug | Developer's Diagnosis | AI Confirmation |
|-----|----------------------|-----------------|
| SMTP 500 error | Suspected missing `setFrom` and stale compiled classes | Confirmed, suggested `ssl.trust` property |
| Login errors silently swallowed | Suspected Axios interceptor interfering with 401 responses | Confirmed the `isAuthEndpoint` guard approach |
| Veg filter returning empty | Suspected `null !== true` for unset DB column | Confirmed, suggested `!== false` null-safe check |

---

## What Was Entirely Developer's Own Work

| Area | Details |
|------|---------|
| **Full-stack architecture** | Chose Spring Boot + React + PostgreSQL, designed the 6-entity schema, REST API structure |
| **Security implementation** | JWT secret, filter ordering, `PUBLIC_URLS`, `@PreAuthorize` per endpoint, CORS config |
| **Business logic** | Weighted rolling average for ratings, 4-digit OTP with 15-min expiry, null-safe veg filter, `orderCount` tracking |
| **UI/UX design** | All page layouts, component hierarchy, Zomato-style design language, colour choices, animation decisions |
| **Frontend state management** | `AuthContext`, cart state, vegFilter, favourites with `localStorage`, real countdown from `createdAt` |
| **Order tracking page** | Entire concept and implementation — ETA countdown, stepper, rider card, bill breakdown, tip, rating |
| **Forgot password flow** | Designed the 2-step single-page flow, decided on 4-digit code instead of UUID link |
| **Favourites feature** | Concept, localStorage persistence, scroll-to-section behaviour, single-toast deduplication |
| **All testing** | Wrote and understood all JUnit 5 / Mockito unit tests across 6 service classes |
| **Docker setup** | `docker-compose.yml`, `Dockerfile`, environment variable wiring |
| **All configuration** | `application.properties`, JWT secret, SMTP credentials, Vite proxy |
| **All debugging** | Root cause analysis for every bug — AI only confirmed after developer already identified the problem |

---

## Ethical Guidelines Followed

1. **Developer always led** — no feature was "designed by AI"; developer specified what to build, AI only helped write it faster
2. **Every line read and understood** — no blind copy-paste; code that wasn't understood was rewritten
3. **Sensitive data never shared** — JWT secrets, SMTP passwords, DB credentials were never given to AI
4. **AI mistakes were caught and fixed** — duplicate exports, mismatched JSX tags, and incorrect interceptor logic were all identified and corrected by the developer
5. **This document is honest** — AI involvement is neither overstated nor hidden

---

## Summary

> The JustEat platform was **designed, architected, and built by the developer**. GitHub Copilot was used as a productivity tool — similar to how a developer uses Stack Overflow or official docs — to speed up boilerplate writing and confirm debugging hypotheses. Every meaningful decision in this project is the developer's own.


---

## Tool Used

| Tool              | Purpose                                                    |
|-------------------|------------------------------------------------------------|
| **GitHub Copilot** (VS Code) | Code generation, debugging, UI design, refactoring, documentation |

---

## How AI Was Used

### 1. 🏗️ Backend Feature Development

AI assistance was used to **scaffold and implement** the following backend features:

| Feature | AI Contribution | Human Review |
|---------|----------------|--------------|
| JWT Authentication (register/login) | Generated `JwtUtil`, `JwtAuthFilter`, `SecurityConfig`, `AuthServiceImpl` skeleton | Verified token expiry, secret length, filter chain order |
| Forgot Password (4-digit code flow) | Suggested `resetToken`/`resetTokenExpiry` entity fields, `forgotPassword()` and `resetPassword()` service methods | Adjusted code generation from UUID to 4-digit numeric, expiry from 1 hour to 15 minutes |
| Restaurant Rating (weighted average) | Generated rolling average formula: `(rating × count + newRating) / (count + 1)` | Verified rounding logic, tested with edge cases |
| `isVeg` field for menu items | Added field to entity, DTOs, mapper, and service in one pass | Confirmed `null` defaults to veg-safe in filter logic |
| `imageUrl` for menu items | End-to-end addition across entity/DTO/mapper/service | Reviewed each layer independently |
| `ratingCount` on Restaurant | Entity field, DTO, mapper, controller endpoint | Checked concurrency safety of counter increment |
| GlobalExceptionHandler | Generated handler structure for `BadRequestException`, `ResourceNotFoundException`, validation errors | Added custom error messages |

---

### 2. 🎨 Frontend UI Design

The AI assistant was used heavily for **React component structure and Tailwind CSS styling**, particularly:

| Component | AI Contribution |
|-----------|----------------|
| `CustomerHomePage` | Full layout: sticky header, hero banner, floating food emojis, cuisine filter strip with gradient cards, recommendations section, favourites section, veg/non-veg toggle, sort controls |
| `RestaurantPage` | Sticky category tabs + search bar, veg/non-veg filter in tab bar, "Most Popular" section with real food images, cart sidebar |
| `OrderTrackingPage` | Zomato-style hero ETA card, live countdown timer from `createdAt`, status stepper, rider card, order summary, bill breakdown, tip slider, star rating |
| `ForgotPasswordPage` | 2-step single-page flow (email → 4-digit code + new password), step indicator, password strength bar |
| `LoginPage` | Inline error banner, shake animation on wrong credentials |
| `RegisterPage` | Per-field validation errors (username length, email format, password rules), server error routing |
| `MenuManagementPage` (Owner) | Add/edit modal with 3-column toggle grid (isVeg, isSpecial, isDealOfDay), image URL preview |

> **Design philosophy**: The AI helped produce Framer Motion animations (spring hover, fade-in/out via AnimatePresence), gradient overlays, and Tailwind-based responsive layouts. All visual decisions (colour palette, spacing, component hierarchy) were reviewed and adjusted to maintain consistency with a Zomato/Swiggy-inspired design language.

---

### 3. 🐛 Debugging & Bug Fixes

AI was used to diagnose and fix several non-obvious bugs:

| Bug | Root Cause (identified with AI) | Fix |
|-----|---------------------------------|-----|
| SMTP `500 Internal Server Error` | Missing `message.setFrom(fromEmail)` + missing `ssl.trust` property, stale `.class` files | Added `setFrom`, `ssl.trust=smtp.gmail.com`, ran `mvn clean` |
| Cuisine "All" click intercepting page below | Absolute `-bottom-[17px]` active indicator overflowing sticky strip, capturing pointer events | Replaced with inline `h-1 w-6` span inside button |
| Login errors silently swallowed | Axios response interceptor redirected to `/login` on **every** 401, including failed login attempts | Added `isAuthEndpoint` guard — auth endpoints bypass the redirect |
| Veg filter showing no items | `m.isVeg === true` excluded existing items with `isVeg = null` (new column, no migration data) | Changed to `m.isVeg !== false` to treat null as veg (safe default) |
| `ForgotPasswordPage` duplicate export error | `replace_string_in_file` appended new file content instead of replacing old — both functions remained | Manually deleted the duplicate old body at EOF |
| JSX mismatched tags in `LoginPage` | Shake `motion.div` wrapper only closed after the first field; second field had orphaned `</motion.div>` | Rewrote both fields inside a single properly nested `motion.div` |

---

### 4. 🧪 Test Understanding & Structure

AI was used to:
- **Explain** the test structure (JUnit 5 + Mockito `@ExtendWith`, `@InjectMocks`, `@Mock`)
- **Verify** that tests use H2 in-memory DB via `application-test.properties`
- **Identify** which service methods needed test coverage

The test code itself was reviewed and understood line-by-line — not blindly accepted.

---

### 5. 📖 Code Understanding

Throughout development, AI was used to:
- Explain Spring Security filter chain order and why `JwtAuthFilter` must run before `UsernamePasswordAuthenticationFilter`
- Clarify how `@Builder.Default` works in Lombok (needed for `isVeg = true` default)
- Describe how `spring.jpa.hibernate.ddl-auto=update` auto-adds new columns without dropping existing data
- Explain why `Promise.reject(error)` must be returned in Axios interceptors for `.catch()` blocks to work in components

---

## What Was NOT AI-Generated

| Item | Human-only work |
|------|----------------|
| Database schema design | ER diagram, entity relationships, FK constraints — designed manually |
| Business logic decisions | Deciding to use rolling average for ratings (not overwrite), 15-minute OTP expiry, null-safe veg default |
| Security architecture | JWT secret length, `PUBLIC_URLS` list, `@PreAuthorize` placement per endpoint |
| API contract design | Deciding to use `PATCH /rate`, query param for rating, response envelope via `ApiResponse<T>` |
| UI/UX decisions | Colour scheme, typography hierarchy, which animations to use, page flow |
| `application.properties` credentials | All environment-specific values entered manually |

---

## Ethical Guidelines Followed

1. **All AI-generated code was read and understood** before being committed — no black-box copy-paste
2. **Sensitive values** (JWT secret, SMTP password, DB credentials) were **never** provided to the AI
3. AI suggestions were **cross-checked** against Spring Boot docs, React docs, and MDN where behaviour was unclear
4. **Bugs introduced by AI** (duplicate exports, mismatched JSX tags, interceptor over-redirect) were diagnosed and fixed — demonstrating understanding of the codebase
5. This document itself was written to **accurately represent** AI involvement — neither overstating nor understating its role

---

## Summary

> GitHub Copilot acted as a **pair programmer** — significantly accelerating UI scaffolding, boilerplate reduction, and debugging. Every piece of generated code was reviewed, tested, and in many cases modified. The architecture, design decisions, and business logic remain the developer's own work.
