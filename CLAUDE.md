# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A customer helpdesk/ticketing system where customers raise tickets, Claude AI responds automatically first, and admins handle escalations. Two roles: **Customer** and **Admin**.

## Tech Stack

- **Frontend:** Angular 19 (standalone components, no NgModules), Bootstrap 5.3 + ng-bootstrap, Font Awesome Free, Angular HttpClient + RxJS, JWT in localStorage via HTTP interceptor
- **Backend:** Spring Boot 3.5.14, Java 17, Maven, Spring Security + JWT (stateless), Spring Data JPA + Hibernate, Lombok, **Spring AI 1.1.5** (`spring-ai-starter-model-anthropic` — not the raw Anthropic SDK)
- **Database:** MySQL 8, schema managed by Flyway

## Key Architecture Decisions

- Claude API is called **only from the backend** — the API key never reaches the browser
- Auth is stateless JWT: issued on login, validated per-request via Spring Security filter
- Angular route guards protect customer/admin routes based on JWT role claim
- AI auto-response triggers on new ticket creation (backend event, not frontend-driven)

## Ticket Lifecycle

`open` → `ai_responded` → `escalated` (if customer marks unresolved) → `human_responded` (after admin replies) → `closed`

Admin can close or reopen any ticket at any time.

## Planned Project Structure

```
customer-helpdesk-system/
├── backend/                        # Spring Boot Maven project
│   ├── src/main/java/com/catmanscodes/
│   │   ├── auth/                   # JWT filter, Spring Security config, login endpoint
│   │   ├── ticket/                 # Ticket entity, repo, service, REST controller
│   │   ├── message/                # Message entity, repo, service, REST controller
│   │   ├── user/                   # User entity, repo, UserDetailsService
│   │   └── ai/                     # Claude API client, auto-response trigger
│   ├── src/main/resources/
│   │   ├── db/migration/           # Flyway: V1__init.sql, V2__seed_admin.sql, etc.
│   │   └── application.yml
│   └── pom.xml
└── frontend/                       # Angular 19 project
    └── src/app/
        ├── core/                   # AuthService, JwtInterceptor, auth guards
        ├── shared/                 # Layout shell, sidebar nav, shared components
        ├── customer/               # Customer dashboard, ticket-create, ticket-thread
        └── admin/                  # Admin dashboard, all-tickets list, ticket-thread
```

## Commands

Once scaffolded, the expected commands will be:

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
ng test                        # run unit tests (Karma)
ng test --include="**/foo.spec.ts"  # run a single spec file
ng build --configuration production
```

**Database**
- Flyway migrations run automatically on backend startup
- Migration files go in `backend/src/main/resources/db/migration/` named `V{n}__{description}.sql`

## API

- Swagger UI available at `http://localhost:8080/swagger-ui.html` once backend is running
- CORS configured to allow `http://localhost:4200` in dev
- All protected endpoints require `Authorization: Bearer <jwt>` header (added automatically by Angular interceptor)

## Admin Account

Admin is pre-seeded via Flyway (no self-signup). Seed SQL lives in a migration file (e.g., `V2__seed_admin.sql`). Default credentials should be set in that file and documented there.
