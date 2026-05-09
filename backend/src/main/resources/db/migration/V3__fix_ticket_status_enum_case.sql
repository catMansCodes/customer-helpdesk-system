-- V1 defined ticket status values in lowercase which conflicts with the Java
-- enum constants (OPEN, AI_RESPONDED, etc.). Hibernate's Enum.valueOf() is
-- case-sensitive, so reading 'ai_responded' from MySQL throws an exception.
-- This migration uppercases all existing rows and redefines the column to
-- match the Java enum constant names exactly.

ALTER TABLE tickets MODIFY COLUMN status VARCHAR(50) NOT NULL;

UPDATE tickets SET status = UPPER(status);

ALTER TABLE tickets
    MODIFY COLUMN status ENUM('OPEN','AI_RESPONDED','ESCALATED','HUMAN_RESPONDED','CLOSED')
    NOT NULL DEFAULT 'OPEN';
