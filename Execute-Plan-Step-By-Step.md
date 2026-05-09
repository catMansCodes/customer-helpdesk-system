# Customer Helpdesk System — Execution Plan

## Project Structure (current)

```
customer-helpdesk-system/
├── backend/
│   ├── document/
│   │   └── helpdesk-api.postman_collection.json
│   ├── src/main/java/com/catmanscodes/backend/
│   │   ├── config/                  ← JWT filter + Spring Security config
│   │   │   ├── JwtAuthFilter.java
│   │   │   └── SecurityConfig.java
│   │   ├── controller/
│   │   │   ├── AuthController.java  ← /api/auth/* (register, login, logout)
│   │   │   ├── MessageController.java
│   │   │   ├── TicketController.java
│   │   │   └── UserController.java  ← /api/users/profile
│   │   ├── dto/
│   │   │   ├── AuthResponse.java
│   │   │   ├── CreateTicketRequest.java
│   │   │   ├── LoginRequest.java
│   │   │   ├── MessageResponse.java
│   │   │   ├── RegisterRequest.java
│   │   │   ├── SendMessageRequest.java
│   │   │   ├── TicketResponse.java
│   │   │   └── UserProfileResponse.java
│   │   ├── enums/
│   │   │   ├── Role.java
│   │   │   ├── SenderType.java
│   │   │   └── TicketStatus.java
│   │   ├── model/
│   │   │   ├── Message.java
│   │   │   ├── Ticket.java
│   │   │   └── User.java
│   │   ├── repository/
│   │   │   ├── MessageRepository.java
│   │   │   ├── TicketRepository.java
│   │   │   └── UserRepository.java
│   │   ├── service/
│   │   │   ├── AiService.java
│   │   │   ├── AuthService.java
│   │   │   ├── MessageService.java
│   │   │   ├── TicketService.java
│   │   │   └── UserDetailsServiceImpl.java
│   │   ├── utils/
│   │   │   └── JwtUtil.java
│   │   └── BackendApplication.java
│   ├── src/main/resources/
│   │   ├── db/migration/
│   │   │   ├── V1__init.sql
│   │   │   └── V2__seed_admin.sql   ← admin@helpdesk.com / Admin@1234
│   │   └── application.properties
│   └── pom.xml
└── frontend/                        ← Angular 19 (not yet scaffolded)
```

---

## Step Tracker

| Step | Area | Status |
|---|---|---|
| 1 | Backend — Data Layer | ✅ Done |
| 2 | Backend — Auth Layer | ✅ Done |
| 3 | Backend — Ticket & Message API | ✅ Done |
| 4 | Backend — AI Auto-Response | ✅ Done |
| 4b | Backend — Extras (logout, profile, Postman) | ✅ Done |
| 5 | Frontend — Setup & Core Infrastructure | ⬜ Next |
| 6 | Frontend — Layout & Routing | ⬜ |
| 7 | Frontend — Auth Pages | ⬜ |
| 8 | Frontend — Customer Feature | ⬜ |
| 9 | Frontend — Admin Feature | ⬜ |

---

## REST API Reference (complete)

### Auth — `/api/auth`
| Method | Path | Role | Description |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Register new customer account |
| POST | `/api/auth/login` | Public | Login, returns JWT + role + name |
| POST | `/api/auth/logout` | Any | Client-side token drop acknowledged |

### Users — `/api/users`
| Method | Path | Role | Description |
|---|---|---|---|
| GET | `/api/users/profile` | Any | Current user's profile |

### Tickets — `/api/tickets`
| Method | Path | Role | Description |
|---|---|---|---|
| POST | `/api/tickets` | CUSTOMER | Create ticket (AI auto-responds) |
| GET | `/api/tickets/my` | CUSTOMER | Own tickets |
| GET | `/api/tickets` | ADMIN | All tickets, newest first |
| GET | `/api/tickets/{id}` | Both | Single ticket |
| PATCH | `/api/tickets/{id}/escalate` | CUSTOMER | Mark AI response unresolved |
| PATCH | `/api/tickets/{id}/close` | ADMIN | Close ticket |
| PATCH | `/api/tickets/{id}/reopen` | ADMIN | Reopen closed ticket |

### Messages — `/api/tickets/{id}/messages`
| Method | Path | Role | Description |
|---|---|---|---|
| POST | `/api/tickets/{id}/messages` | Both | Send message (role auto-detected) |
| GET | `/api/tickets/{id}/messages` | Both | Full thread, chronological |

---

## Step 5 — Frontend: Setup & Core Infrastructure

**Install packages:**
```bash
npm install bootstrap @ng-bootstrap/ng-bootstrap @fortawesome/fontawesome-free
```

**Config changes:**
- `angular.json` — add Bootstrap CSS + Font Awesome CSS to `styles` array
- `src/index.html` — add Google Fonts (Lato) `<link>` tag
- `src/styles.scss` — base font and global overrides

**Files to create inside `src/app/`:**

| File | Purpose |
|---|---|
| `environments/environment.ts` | `{ apiUrl: 'http://localhost:8080' }` |
| `core/services/auth.service.ts` | login, register, logout, getToken, getRole, isLoggedIn |
| `core/services/ticket.service.ts` | All ticket + message API calls via HttpClient |
| `core/services/user.service.ts` | getProfile() |
| `core/interceptors/jwt.interceptor.ts` | `HttpInterceptorFn` — attaches `Authorization: Bearer <token>` |
| `core/guards/auth.guard.ts` | Redirect to `/login` if not authenticated |
| `core/guards/role.guard.ts` | Redirect based on role (CUSTOMER/ADMIN) |

**Update `app.config.ts`:**
Add `provideHttpClient(withInterceptors([jwtInterceptor]))` and `provideAnimations()`.

---

## Step 6 — Frontend: Layout & Routing

| File | Purpose |
|---|---|
| `shared/layout/shell.component.ts` | Sidebar nav (role-aware links) + `<router-outlet>` + logout button |

**`app.routes.ts` structure:**
```
/login                          → LoginComponent
/register                       → RegisterComponent
/customer                       → ShellComponent  [authGuard + CUSTOMER role]
  /customer/tickets             → CustomerDashboardComponent
  /customer/tickets/new         → NewTicketComponent
  /customer/tickets/:id         → CustomerTicketThreadComponent
  /customer/profile             → ProfileComponent
/admin                          → ShellComponent  [authGuard + ADMIN role]
  /admin/tickets                → AdminDashboardComponent
  /admin/tickets/:id            → AdminTicketThreadComponent
  /admin/profile                → ProfileComponent
/                               → redirect based on role
```

---

## Step 7 — Frontend: Auth Pages

| File | Purpose |
|---|---|
| `features/auth/login/login.component.ts` | Reactive form — email + password; calls `AuthService.login()`; redirects by role |
| `features/auth/register/register.component.ts` | Reactive form — name + email + password; calls `AuthService.register()` |

Both pages: Bootstrap card layout, centered on screen.

---

## Step 8 — Frontend: Customer Feature

| File | Purpose |
|---|---|
| `features/customer/dashboard/customer-dashboard.component.ts` | Lists own tickets — Subject, Status badge, Last Updated; "New Ticket" button |
| `features/customer/new-ticket/new-ticket.component.ts` | Form: Subject + Description; submits `POST /api/tickets`; navigates to thread |
| `features/customer/ticket-thread/ticket-thread.component.ts` | Thread view + reply input + "Mark Unresolved" button (visible when `ai_responded`) |
| `features/shared/profile/profile.component.ts` | Displays name, email, role, joined date from `GET /api/users/profile` |

---

## Step 9 — Frontend: Admin Feature

| File | Purpose |
|---|---|
| `features/admin/dashboard/admin-dashboard.component.ts` | All tickets; status filter tabs; table: ID, Customer, Subject, Status, Last Updated |
| `features/admin/ticket-thread/admin-ticket-thread.component.ts` | Thread view + reply input + Close / Reopen buttons |

---

## Ticket Status Flow

```
OPEN  ──(AI replies)──►  AI_RESPONDED  ──(customer marks unresolved)──►  ESCALATED
                                                                              │
                                                                    (admin replies)
                                                                              │
                                                                              ▼
                                                                     HUMAN_RESPONDED
                                                                              │
                                                                      (admin closes)
                                                                              │
                                                                              ▼
                                                                           CLOSED
                                                                  (admin can reopen)
```

---

## End-to-End Verification

```
1. CREATE DATABASE help_desk_db;              ← MySQL
2. cd backend && ./mvnw spring-boot:run       ← Flyway runs V1 + V2, server on :8080
3. http://localhost:8080/swagger-ui.html      ← Verify all endpoints listed
4. Import backend/document/helpdesk-api.postman_collection.json into Postman
5. cd frontend && ng serve                    ← Dev server on :4200
6. Register as customer → create ticket → AI reply appears automatically
7. Customer clicks "Mark Unresolved" → ticket status = ESCALATED
8. Login as admin → see escalated ticket → reply → close
9. Switch to customer view → status = HUMAN_RESPONDED, admin reply visible
```

---

## Notes

- **Package layout:** MVC layer-based (`controller / service / dto / model / repository / config / utils / enums`)
- **Security package renamed to `config`** after initial scaffolding
- **JWT is stateless** — logout clears token on the client; server returns 200 OK
- **Admin seeded** via `V2__seed_admin.sql`: `admin@helpdesk.com` / `Admin@1234`
- **AI key** is read from env var `ANTHROPIC_API_KEY` — never committed
- **Swagger UI** at `http://localhost:8080/swagger-ui.html` (no auth required to view)
