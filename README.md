# 🎧 Customer Helpdesk System

A full-stack AI-powered helpdesk where customers raise support tickets, **Claude AI responds instantly**, and human agents handle escalations — all within a clean, role-aware web interface.

---

## 📋 Table of Contents

- [Project Scope](#-project-scope)
- [Functional Flow](#-functional-flow)
- [Tech Stack](#-tech-stack)
- [Technical Architecture](#-technical-architecture)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [API Reference](#-api-reference)
- [Route Map](#-route-map)
- [Default Credentials](#-default-credentials)

---

## 🎯 Project Scope

This system is designed for small-to-medium teams that want to:

- Let customers **self-raise** support tickets through a web portal
- Get **instant AI-generated first responses** powered by Claude (Anthropic) — reducing agent load for common queries
- Allow customers to **escalate** tickets that the AI couldn't resolve
- Give support agents a **unified admin dashboard** to triage, reply to, and close escalated tickets
- Maintain a **full conversation thread** per ticket with clear attribution (Customer / AI / Agent)

### 👥 Two Roles

| Role | Capabilities |
|---|---|
| **Customer** | Register, login, create tickets, view own tickets, read AI responses, escalate unresolved tickets, reply in thread |
| **Admin** | Login (pre-seeded), view all tickets, filter by status, reply as support agent, close and reopen tickets |

---

## 🔄 Functional Flow

### Customer Journey

```
1. Register / Login
       │
       ▼
2. Create a Ticket  ──────────────────────────────────────────────────────────┐
   (Subject + Description)                                                    │
       │                                                                      │
       ▼                                                                      │
3. AI responds automatically ← Claude reads the ticket and replies instantly  │
   Ticket status: OPEN → AI_RESPONDED                                         │
       │                                                                      │
       ├── Satisfied? ─── No ──► Click "Mark Unresolved"                     │
       │                              Ticket status: ESCALATED               │
       │                                    │                                 │
       │                                    ▼                                 │
       │                         Admin sees escalated ticket                  │
       │                         Admin replies manually                       │
       │                         Ticket status: HUMAN_RESPONDED               │
       │                                    │                                 │
       │                                    ▼                                 │
       └── Yes ◄────────────── Admin closes ticket ──────────────────────────┘
                                Ticket status: CLOSED
```

### Admin Journey

```
Login as Admin
      │
      ▼
Dashboard — All Tickets (filterable by status)
      │
      ▼
Open a Ticket Thread
      │
      ├── Read full conversation (Customer + AI messages)
      ├── Reply as Support Agent  → status becomes HUMAN_RESPONDED
      ├── Close ticket            → status becomes CLOSED
      └── Reopen ticket           → status reverts to previous open state
```

### Ticket Status Lifecycle

```
  OPEN
   │
   └──(AI auto-replies)──► AI_RESPONDED
                                │
                    ┌───────────┴────────────┐
                    │                        │
          (customer satisfied)   (customer marks unresolved)
                    │                        │
                 CLOSED ◄──────────    ESCALATED
                 (admin closes)              │
                    ▲              (admin replies)
                    │                        │
                    └────────── HUMAN_RESPONDED
                                   (admin closes)
```

---

## 🛠️ Tech Stack

### Backend

| Technology | Version | Role |
|---|---|---|
| ☕ Java | 17 | Language |
| 🌱 Spring Boot | 3.5.14 | Application framework |
| 🔐 Spring Security | 6.x (via Boot) | JWT-based stateless auth |
| 🗄️ Spring Data JPA + Hibernate | 6.x (via Boot) | ORM & database access |
| 🤖 Spring AI | 1.1.5 | Claude API integration (`spring-ai-starter-model-anthropic`) |
| 🔑 JJWT (jjwt-api) | 0.12.x | JWT generation & validation |
| 🗃️ Flyway | 9.x (via Boot) | Database migrations |
| 📦 Lombok | latest | Boilerplate reduction |
| 🏗️ Maven | 3.x | Build tool |

### Frontend

| Technology | Version | Role |
|---|---|---|
| 🅰️ Angular | 19.2.x | SPA framework (standalone components) |
| 🎨 Bootstrap | 5.3.x | UI components & layout |
| 🧩 ng-bootstrap | 18.x | Angular-native Bootstrap widgets |
| ✨ Font Awesome Free | 6.x | Icons |
| 🔤 Google Fonts — Lato | — | Typography |
| 🔄 RxJS | 7.8.x | Reactive HTTP & state |

### Database & Infrastructure

| Technology | Version | Role |
|---|---|---|
| 🐬 MySQL | 8.x | Relational database |
| 🔑 JWT (stateless) | — | Authentication token standard |
| 🤖 Anthropic Claude | claude-3-5-haiku (via Spring AI) | AI auto-response |

---

## 🏗️ Technical Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Browser                              │
│                                                             │
│  Angular 19 SPA  ──► JWT interceptor adds Bearer token      │
│  (port 4200)         on every API request                   │
└──────────────────────────────┬──────────────────────────────┘
                               │  HTTP/REST
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                   Spring Boot Backend (port 8080)           │
│                                                             │
│  JwtAuthFilter → SecurityConfig → Controllers               │
│       │                               │                     │
│       │  validate token               │  route request      │
│       ▼                               ▼                     │
│  Spring Security             AuthController                 │
│  (stateless session)         TicketController               │
│                              MessageController              │
│                              UserController                 │
│                                    │                        │
│                              Services layer                 │
│                         ┌──────────┴──────────┐            │
│                         │                     │            │
│                    TicketService          AiService         │
│                    MessageService              │            │
│                    AuthService                 │            │
│                         │                     │            │
│                         ▼                     ▼            │
│                   Spring Data JPA      Spring AI Client     │
│                   (Hibernate ORM)      (Anthropic API)      │
└──────────┬───────────────────────────────────┬─────────────┘
           │                                   │
           ▼                                   ▼
   ┌───────────────┐                  ┌────────────────┐
   │   MySQL 8     │                  │  Anthropic API │
   │  (Flyway runs │                  │  (Claude model)│
   │  migrations)  │                  └────────────────┘
   └───────────────┘
```

### Key Technical Decisions

| Decision | Detail |
|---|---|
| **API key isolation** | `ANTHROPIC_API_KEY` is an environment variable read only by the backend — never sent to the browser |
| **Stateless JWT** | No server-side session; token carries `sub` (email) + `role` claim; validated per-request by `JwtAuthFilter` |
| **AI on ticket creation** | `AiService` is called inside `TicketService.createTicket()` — the AI reply is saved before the HTTP response returns, so the customer sees it immediately on the thread page |
| **Flyway migrations** | Schema versioned in `V1__init.sql` (tables) and `V2__seed_admin.sql` (admin user); run automatically on startup |
| **Standalone Angular** | No `NgModule`; each component declares its own `imports[]`; all feature components are lazy-loaded via `loadComponent` |
| **Role guard** | `roleGuard` reads the `role` key from `localStorage`; mismatched role redirects to the correct dashboard rather than login |

---

## 📁 Project Structure

```
customer-helpdesk-system/
├── backend/
│   ├── document/
│   │   └── helpdesk-api.postman_collection.json
│   ├── src/main/java/com/catmanscodes/backend/
│   │   ├── config/              # JwtAuthFilter, SecurityConfig
│   │   ├── controller/          # AuthController, TicketController,
│   │   │                        #   MessageController, UserController
│   │   ├── dto/                 # Request/Response DTOs
│   │   ├── enums/               # Role, SenderType, TicketStatus
│   │   ├── model/               # User, Ticket, Message (JPA entities)
│   │   ├── repository/          # Spring Data JPA repositories
│   │   ├── service/             # Business logic + AiService
│   │   ├── utils/               # JwtUtil
│   │   └── BackendApplication.java
│   ├── src/main/resources/
│   │   ├── db/migration/
│   │   │   ├── V1__init.sql
│   │   │   └── V2__seed_admin.sql
│   │   └── application.properties
│   └── pom.xml
│
└── frontend/
    └── src/app/
        ├── core/
        │   ├── guards/              # auth.guard.ts, role.guard.ts
        │   ├── interceptors/        # jwt.interceptor.ts
        │   └── services/            # auth.service.ts, ticket.service.ts,
        │                            #   user.service.ts
        ├── shared/
        │   └── layout/              # shell.component.ts
        ├── features/
        │   ├── auth/                # login, register
        │   ├── customer/            # dashboard, new-ticket, ticket-thread
        │   ├── admin/               # dashboard, ticket-thread
        │   └── shared/              # profile (used by both roles)
        ├── environments/
        │   └── environment.ts       # apiUrl: 'http://localhost:8080'
        ├── app.routes.ts
        └── app.config.ts
```

---

## 🚀 Getting Started

### Prerequisites

- Java 17+
- Node.js 18+ & Angular CLI 19
- MySQL 8 running locally
- Anthropic API key

### 1 — Database

```sql
CREATE DATABASE help_desk_db;
```

### 2 — Backend

```bash
# Set your Anthropic API key
export ANTHROPIC_API_KEY=sk-ant-...      # macOS/Linux
$env:ANTHROPIC_API_KEY="sk-ant-..."      # Windows PowerShell

cd backend
./mvnw spring-boot:run
# Flyway runs V1__init.sql + V2__seed_admin.sql automatically
# Server starts on http://localhost:8080
```

### 3 — Frontend

```bash
cd frontend
npm install
ng serve
# Dev server starts on http://localhost:4200
```

### 4 — Verify

| Check | URL |
|---|---|
| Swagger UI (all endpoints) | `http://localhost:8080/swagger-ui.html` |
| Frontend app | `http://localhost:4200` |

---

## 📡 API Reference

### Auth — `/api/auth`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register customer; returns JWT |
| `POST` | `/api/auth/login` | Public | Login; returns JWT + role + name |
| `POST` | `/api/auth/logout` | Any | Client-side token drop acknowledged |

### Users — `/api/users`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/users/profile` | Any | Current user's profile |

### Tickets — `/api/tickets`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/tickets` | CUSTOMER | Create ticket (AI auto-responds) |
| `GET` | `/api/tickets/my` | CUSTOMER | Own tickets |
| `GET` | `/api/tickets` | ADMIN | All tickets, newest first |
| `GET` | `/api/tickets/{id}` | Both | Single ticket |
| `PATCH` | `/api/tickets/{id}/escalate` | CUSTOMER | Mark AI response unresolved |
| `PATCH` | `/api/tickets/{id}/close` | ADMIN | Close ticket |
| `PATCH` | `/api/tickets/{id}/reopen` | ADMIN | Reopen closed ticket |

### Messages — `/api/tickets/{id}/messages`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/tickets/{id}/messages` | Both | Send message (role auto-detected) |
| `GET` | `/api/tickets/{id}/messages` | Both | Full thread, chronological |

---

## 🗺️ Route Map

| Path | Page | Access |
|---|---|---|
| `/login` | Login | Public |
| `/register` | Register | Public |
| `/customer/tickets` | My Tickets dashboard | CUSTOMER |
| `/customer/tickets/new` | New Ticket form | CUSTOMER |
| `/customer/tickets/:id` | Ticket thread + Mark Unresolved | CUSTOMER |
| `/customer/profile` | Profile | CUSTOMER |
| `/admin/tickets` | All Tickets + status filter tabs | ADMIN |
| `/admin/tickets/:id` | Ticket thread + Close / Reopen | ADMIN |
| `/admin/profile` | Profile | ADMIN |
| `**` | — | Redirects to `/login` |

---

## 🔑 Default Credentials

| Role | Email | Password |
|---|---|---|
| Admin | `admin@helpdesk.com` | `Admin@1234` |
| Customer | _(self-register at `/register`)_ | — |

> ⚠️ Change the admin password in `V2__seed_admin.sql` before deploying to any non-local environment.

---

## 📬 Postman Collection

A ready-to-import Postman collection covering all endpoints is included at:

```
backend/document/helpdesk-api.postman_collection.json
```

Import it into Postman, set the `{{base_url}}` variable to `http://localhost:8080`, run **Login** first to capture the JWT, then explore all endpoints.
