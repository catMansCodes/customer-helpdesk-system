-- Default admin credentials: admin@helpdesk.com / Admin@1234
-- Password hash: BCrypt cost 10 of "Admin@1234"
INSERT INTO users (name, email, password, role, created_at)
VALUES (
    'Admin',
    'admin@helpdesk.com',
    '$2a$10$aY3/t839VTKZgekMEpqFoeYWmWBxm1EmoNlCw8Oclqh6nTte6zg9O',
    'ADMIN',
    NOW()
);
