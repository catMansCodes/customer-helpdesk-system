-- ── Users ─────────────────────────────────────────────────────────────────────
CREATE TABLE users (
    id         BIGINT       NOT NULL AUTO_INCREMENT,
    name       VARCHAR(100) NOT NULL,
    email      VARCHAR(255) NOT NULL,
    password   VARCHAR(255) NOT NULL,
    role       ENUM('CUSTOMER', 'ADMIN') NOT NULL DEFAULT 'CUSTOMER',
    created_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_users_email (email)
);

-- ── Tickets ───────────────────────────────────────────────────────────────────
CREATE TABLE tickets (
    id          BIGINT       NOT NULL AUTO_INCREMENT,
    subject     VARCHAR(255) NOT NULL,
    description TEXT         NOT NULL,
    status      ENUM('open', 'ai_responded', 'escalated', 'human_responded', 'closed')
                             NOT NULL DEFAULT 'open',
    customer_id BIGINT       NOT NULL,
    created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_tickets_customer FOREIGN KEY (customer_id) REFERENCES users (id)
);

-- ── Messages ──────────────────────────────────────────────────────────────────
CREATE TABLE messages (
    id          BIGINT    NOT NULL AUTO_INCREMENT,
    ticket_id   BIGINT    NOT NULL,
    sender_type ENUM('CUSTOMER', 'AI', 'ADMIN') NOT NULL,
    content     TEXT      NOT NULL,
    created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_messages_ticket FOREIGN KEY (ticket_id) REFERENCES tickets (id)
);