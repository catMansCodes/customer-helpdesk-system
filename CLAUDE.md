# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A customer helpdesk/ticketing system where customers raise tickets, Claude AI responds automatically first, and admins handle escalations. Two roles: **Customer** and **Admin**.

## Tech Stack

- **Frontend:** Angular 19 (standalone components, no NgModules), Bootstrap 5.3, ng-bootstrap 18, Font Awesome Free, Angular HttpClient + RxJS, JWT in localStorage via `HttpInterceptorFn`
- **Backend:** Spring Boot 3.5.14, Java 17, Maven, Spring Security + JWT (stateless), Spring Data JPA + Hibernate, Lombok, **Spring AI 1.1.5** (`spring-ai-starter-model-google-genai` — Google Gemini free tier via Google AI Studio, not Vertex AI)
- **Database:** MySQL 8, schema managed by Flyway

## Key Architecture Decisions

- Gemini API is called **only from the backend** — the API key never reaches the browser
- Auth is stateless JWT: issued on login, validated per-request via Spring Security filter
- Angular route guards protect customer/admin routes based on JWT role claim
- AI auto-response triggers on new ticket creation (backend event, not frontend-driven)
- All feature components are lazy-loaded via `loadComponent` in `app.routes.ts`

## Ticket Lifecycle

`OPEN` → `AI_RESPONDED` → `ESCALATED` (if customer marks unresolved) → `HUMAN_RESPONDED` (after admin replies) → `CLOSED`

Admin can close or reopen any ticket at any time.

## Project Structure (as built)

```
customer-helpdesk-system/
├── backend/
│   ├── src/main/java/com/catmanscodes/backend/
│   │   ├── config/              # JwtAuthFilter, SecurityConfig
│   │   ├── controller/          # AuthController, TicketController, MessageController, UserController
│   │   ├── dto/                 # AuthResponse, LoginRequest, RegisterRequest,
│   │   │                        #   CreateTicketRequest, SendMessageRequest,
│   │   │                        #   TicketResponse, MessageResponse, UserProfileResponse
│   │   ├── enums/               # Role, SenderType, TicketStatus
│   │   ├── model/               # User, Ticket, Message
│   │   ├── repository/          # UserRepository, TicketRepository, MessageRepository
│   │   ├── service/             # AuthService, TicketService, MessageService,
│   │   │                        #   AiService, UserDetailsServiceImpl
│   │   ├── utils/               # JwtUtil
│   │   └── BackendApplication.java
│   ├── src/main/resources/
│   │   ├── db/migration/
│   │   │   ├── V1__init.sql
│   │   │   └── V2__seed_admin.sql   # admin@helpdesk.com / Admin@1234
│   │   └── application.properties
│   └── pom.xml
└── frontend/
    └── src/app/
        ├── core/
        │   ├── guards/          # auth.guard.ts, role.guard.ts
        │   ├── interceptors/    # jwt.interceptor.ts
        │   └── services/        # auth.service.ts, ticket.service.ts, user.service.ts
        ├── shared/
        │   └── layout/          # shell.component.ts (sidebar + router-outlet)
        ├── features/
        │   ├── auth/
        │   │   ├── login/       # login.component.ts
        │   │   └── register/    # register.component.ts
        │   ├── customer/
        │   │   ├── dashboard/   # customer-dashboard.component.ts
        │   │   ├── new-ticket/  # new-ticket.component.ts
        │   │   └── ticket-thread/ # customer-ticket-thread.component.ts
        │   ├── admin/
        │   │   ├── dashboard/   # admin-dashboard.component.ts
        │   │   └── ticket-thread/ # admin-ticket-thread.component.ts
        │   └── shared/
        │       └── profile/     # profile.component.ts (shared by both roles)
        ├── app.routes.ts
        ├── app.config.ts
        └── environments/
            └── environment.ts   # apiUrl: 'http://localhost:8080'
```

## Commands

**Backend**
```bash
cd backend
mvn spring-boot:run            # start dev server (port 8080)
mvn test                       # run all tests
mvn test -Dtest=ClassName      # run a single test class
mvn clean package              # build fat JAR
```

**Frontend**
```bash
cd frontend
npm install
ng serve                       # dev server at http://localhost:4200
ng build --configuration development
ng build --configuration production
ng test                        # run unit tests (Karma)
```

**Database**
- Flyway migrations run automatically on backend startup
- Migration files go in `backend/src/main/resources/db/migration/` named `V{n}__{description}.sql`

## API

- Swagger UI available at `http://localhost:8080/swagger-ui.html` once backend is running
- CORS configured to allow `http://localhost:4200` in dev
- All protected endpoints require `Authorization: Bearer <jwt>` header (added automatically by the JWT interceptor)

## Admin Account

Pre-seeded via `V2__seed_admin.sql` (no self-signup for admin).
- **Email:** `admin@helpdesk.com`
- **Password:** `Admin@1234`

## Route Map

| Path | Component | Guard |
|---|---|---|
| `/login` | LoginComponent | — |
| `/register` | RegisterComponent | — |
| `/customer/tickets` | CustomerDashboardComponent | authGuard + CUSTOMER role |
| `/customer/tickets/new` | NewTicketComponent | authGuard + CUSTOMER role |
| `/customer/tickets/:id` | CustomerTicketThreadComponent | authGuard + CUSTOMER role |
| `/customer/profile` | ProfileComponent | authGuard + CUSTOMER role |
| `/admin/tickets` | AdminDashboardComponent | authGuard + ADMIN role |
| `/admin/tickets/:id` | AdminTicketThreadComponent | authGuard + ADMIN role |
| `/admin/profile` | ProfileComponent | authGuard + ADMIN role |
| `**` | — | redirectTo `/login` |
