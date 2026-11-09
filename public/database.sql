-- Mangu Service UG PostgreSQL schema
-- Schema-only setup for the Express API. No demo users or passwords are seeded.
-- Compatible with PostgreSQL 13+ (including Supabase, Neon, Railway, and psql).

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
BEGIN
    IF to_regtype('user_role') IS NULL THEN
        CREATE TYPE user_role AS ENUM ('admin', 'technician', 'client');
    END IF;
    IF to_regtype('technician_status') IS NULL THEN
        CREATE TYPE technician_status AS ENUM ('Active', 'Available', 'Busy', 'Inactive');
    END IF;
    IF to_regtype('booking_status') IS NULL THEN
        CREATE TYPE booking_status AS ENUM ('Pending', 'Accepted', 'Declined', 'Cancelled', 'Completed');
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS technicians (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(150) NOT NULL,
    trade VARCHAR(100) NOT NULL,
    phone VARCHAR(30) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    town VARCHAR(100) NOT NULL,
    hourly_rate_ugx NUMERIC(12, 2) NOT NULL DEFAULT 30000.00 CHECK (hourly_rate_ugx >= 0),
    bio TEXT NOT NULL,
    status technician_status NOT NULL DEFAULT 'Available',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(150) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    role user_role NOT NULL DEFAULT 'client',
    phone VARCHAR(30),
    town VARCHAR(100) NOT NULL DEFAULT 'Kampala',
    technician_id UUID UNIQUE REFERENCES technicians(id) ON DELETE SET NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMPTZ NOT NULL,
    used_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    technician_id UUID NOT NULL REFERENCES technicians(id) ON DELETE CASCADE,
    service_description TEXT NOT NULL,
    scheduled_for TIMESTAMPTZ NOT NULL,
    estimated_hours NUMERIC(5, 2) NOT NULL CHECK (estimated_hours > 0 AND estimated_hours <= 24),
    estimated_cost_ugx NUMERIC(12, 2) NOT NULL CHECK (estimated_cost_ugx >= 0),
    status booking_status NOT NULL DEFAULT 'Pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_technicians_trade ON technicians(trade);
CREATE INDEX IF NOT EXISTS idx_technicians_town ON technicians(town);
CREATE INDEX IF NOT EXISTS idx_technicians_status ON technicians(status);
CREATE INDEX IF NOT EXISTS idx_technicians_created_at ON technicians(created_at DESC);
CREATE UNIQUE INDEX IF NOT EXISTS idx_technicians_email_lower ON technicians(LOWER(email));
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email_lower ON users(LOWER(email));
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user ON password_reset_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_expiry ON password_reset_tokens(expires_at);
CREATE INDEX IF NOT EXISTS idx_bookings_client_schedule ON bookings(client_id, scheduled_for);
CREATE INDEX IF NOT EXISTS idx_bookings_technician_schedule ON bookings(technician_id, scheduled_for);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS technicians_set_updated_at ON technicians;
CREATE TRIGGER technicians_set_updated_at
BEFORE UPDATE ON technicians
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS bookings_set_updated_at ON bookings;
CREATE TRIGGER bookings_set_updated_at
BEFORE UPDATE ON bookings
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

COMMIT;
