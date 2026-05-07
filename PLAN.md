# Customer Helpdesk System — Feature Plan

## Context
A simple helpdesk/ticketing web app. Customers raise tickets, Claude AI responds first automatically. If the customer marks it unresolved, an Admin steps in. Two roles only: Admin and Customer. Tech stack to be decided separately.

---

## User Roles

| Role     | What they can do                                                   |
|----------|--------------------------------------------------------------------|
| Customer | Sign up, log in, create tickets, reply in thread, mark unresolved  |
| Admin    | Log in, view all tickets, reply to any ticket, close/reopen tickets |

---

## Features

### Authentication
- Customer: Sign up (name, email, password) + login
- Admin: Login only (pre-seeded account, no self-signup for admin)
- Session/token-based auth to protect routes

---

### Ticket Management

**Customer can:**
- Create a ticket with a Subject and Description
- View list of their own tickets with current status
- Open a ticket and see the full conversation thread
- Reply inside a ticket (add more messages)
- Click "This didn't help / Mark Unresolved" after AI responds → escalates to Admin

**Admin can:**
- View ALL tickets (filterable by status)
- Open any ticket and see the full conversation thread
- Reply to any ticket (human response)
- Close a ticket (status → `closed`)
- Reopen a closed ticket (status → `open`)

---

### Ticket Statuses

| Status            | Meaning                                                         |
|-------------------|-----------------------------------------------------------------|
| `open`            | Ticket created, waiting for AI response                         |
| `ai_responded`    | Claude AI has replied; awaiting customer feedback               |
| `escalated`       | Customer marked unresolved — waiting for Admin to reply         |
| `human_responded` | Admin has replied                                               |
| `closed`          | Admin closed the ticket                                         |

---

### Conversation Thread
- Each ticket has a threaded message list (like a chat)
- Messages have: sender (Customer / AI / Admin), content, timestamp
- Customer can continue replying even after AI response
- Admin can reply at any point
- Conversation is visible to both Customer (their own tickets) and Admin (all tickets)

---

### AI Auto-Response (Claude)
- Triggered automatically when a new ticket is created
- AI reads the ticket subject + description and generates a helpful reply
- AI reply is posted as a message in the thread (labeled as "AI")
- Ticket status moves to `ai_responded`
- If customer clicks "Mark Unresolved" → status moves to `escalated`, Admin notified in-app

---

### Admin Dashboard
- List of all tickets: Ticket ID, Customer name, Subject, Status, Last updated
- Filter / sort by status (open, escalated, closed, etc.)
- Click into any ticket to view thread and reply

---

### Customer Dashboard
- List of own tickets: Subject, Status, Last updated
- Click to open ticket thread
- Button to create a new ticket

---

## Out of Scope (for now)
- Email notifications
- Ticket categories / tags
- Priority levels
- AI confidence scoring / auto-skip
- Analytics / reporting

---

---

## Tech Stack

### Frontend
| Concern | Choice |
|---|---|
| Framework | **Angular 19** (standalone components, no NgModules) |
| UI Library | **Bootstrap 5.3** (latest) + **ng-bootstrap** (Angular-native modals, dropdowns, tooltips) |
| Icons | **Font Awesome Free** (latest, via npm `@fortawesome/fontawesome-free`) |
| Fonts | **Google Fonts** — Lato & Helvetica Neue |
| HTTP | Angular `HttpClient` + RxJS |
| Routing | Angular Router with route guards (auth protection) |
| Auth | JWT token stored in `localStorage`, attached to every API request via HTTP interceptor |
| Responsiveness | Bootstrap grid — fully responsive, mobile-first |
| UI Style | Simple, clean template-based layout (sidebar nav + main content area) |

### Backend
| Concern | Choice |
|---|---|
| Framework | **Spring Boot 3 LTS** |
| Language | **Java 17** |
| Build tool | **Maven** (`pom.xml`) |
| Auth | **Spring Security + JWT** (stateless, no sessions) |
| ORM | **Spring Data JPA + Hibernate** |
| DB Migrations | **Flyway** (schema versioning, safe migrations) |
| API Docs | **Springdoc OpenAPI** (Swagger UI at `/swagger-ui.html`) |
| Boilerplate | **Lombok** (auto-generates getters/setters/builders) |
| AI Integration | **Anthropic Java SDK** (Claude API calls from backend — never from frontend) |
| Connection pool | **HikariCP** (auto-included with Spring Boot) |
| CORS | Spring Boot CORS config to allow Angular dev server (`localhost:4200`) |

### Database
| Concern | Choice |
|---|---|
| Engine | **MySQL 8** |
| Schema management | Flyway migrations (versioned SQL files) |

### API Design
- **REST** — JSON over HTTP
- Angular calls Spring Boot REST endpoints
- Claude API called **only from the backend** (API key stays server-side, never exposed to browser)
- JWT: issued on login, validated on every protected request

---

## Project Structure

```
customer-helpdesk-system/
├── backend/                  (Spring Boot Maven project)
│   ├── src/main/java/
│   │   └── com/helpdesk/
│   │       ├── auth/         (JWT, Spring Security config)
│   │       ├── ticket/       (Ticket entity, service, controller)
│   │       ├── message/      (Message entity, service, controller)
│   │       ├── user/         (User entity, service)
│   │       └── ai/           (Claude API integration)
│   ├── src/main/resources/
│   │   ├── db/migration/     (Flyway SQL files: V1__init.sql, etc.)
│   │   └── application.yml
│   └── pom.xml
│
└── frontend/                 (Angular 19 project)
    ├── src/app/
    │   ├── core/             (auth service, JWT interceptor, guards)
    │   ├── shared/           (shared components, layout)
    │   ├── customer/         (customer dashboard, ticket create, ticket thread)
    │   └── admin/            (admin dashboard, all tickets, ticket thread)
    ├── angular.json
    └── package.json
```

---

## Next Step
Scaffold the project — initialize Angular frontend and Spring Boot backend with all dependencies configured.
