-- ============================================================================
-- Mangu Service UG - Simplified Role-Based PostgreSQL Database Schema
-- Entities: users (client, technician, admin) and technicians
-- Compatible with: PostgreSQL 12+, pgAdmin, DBeaver, Supabase, Neon, psql
-- ============================================================================

BEGIN;

-- Drop previous tables if exist for clean reload
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS technicians CASCADE;
DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS technician_status CASCADE;

-- Enums
CREATE TYPE user_role AS ENUM (
    'admin',
    'technician',
    'client'
);

CREATE TYPE technician_status AS ENUM (
    'Active',
    'Available',
    'Busy',
    'Inactive'
);

-- Core Entity Table: technicians
CREATE TABLE technicians (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    trade VARCHAR(100) NOT NULL,
    phone VARCHAR(30) NOT NULL,
    email VARCHAR(255) NOT NULL,
    town VARCHAR(100) NOT NULL,
    hourly_rate_ugx NUMERIC(12, 2) NOT NULL DEFAULT 30000.00 CHECK (hourly_rate_ugx >= 0),
    bio TEXT NOT NULL,
    status technician_status NOT NULL DEFAULT 'Available',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Authentication & Role Table: users
CREATE TABLE users (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    role user_role NOT NULL DEFAULT 'client',
    phone VARCHAR(30),
    town VARCHAR(100) DEFAULT 'Kampala',
    technician_id VARCHAR(64) REFERENCES technicians(id) ON DELETE SET NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Helpful Indexes for Fast CRUD Queries
CREATE INDEX idx_technicians_trade ON technicians(trade);
CREATE INDEX idx_technicians_town ON technicians(town);
CREATE INDEX idx_technicians_status ON technicians(status);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- Seed Initial Ugandan Technician Records
INSERT INTO technicians (id, name, trade, phone, email, town, hourly_rate_ugx, bio, status) VALUES
('tech-1', 'Kato Joseph', 'Electrical', '+256 701 452 890', 'kato.joseph@mangu.ug', 'Kampala', 35000.00, 'Certified Master Electrician specializing in domestic wiring, solar power installations, and generator maintenance across Kampala.', 'Available'),
('tech-2', 'Akello Grace', 'Plumbing', '+256 772 314 902', 'akello.grace@mangu.ug', 'Entebbe', 30000.00, 'Licensed plumber with deep expertise in emergency leaks, pressure water tanks, drainage unclogging, and sanitary fittings.', 'Available'),
('tech-3', 'Mukasa Ivan', 'Appliance Repair', '+256 782 119 450', 'mukasa.ivan@mangu.ug', 'Jinja', 40000.00, 'Cooling technician with 10 years experience servicing Samsung, LG, and Hisense refrigerators, AC units, and washing machines.', 'Busy'),
('tech-4', 'Okello Patrick', 'ICT & Computers', '+256 753 980 123', 'okello.p@mangu.ug', 'Kampala', 30000.00, 'Computer engineer offering component-level laptop motherboard repairs, WiFi router setup, and CCTV security camera installation.', 'Available'),
('tech-5', 'Namubiru Sarah', 'Carpentry', '+256 704 551 889', 'sarah.namubiru@mangu.ug', 'Kampala', 35000.00, 'Precision woodworker specializing in custom kitchen cabinets, fitted bedroom wardrobes, office desks, and door lock installations.', 'Active'),
('tech-6', 'Ssemwanga David', 'Auto Mechanics', '+256 779 881 223', 'david.ssemwanga@mangu.ug', 'Jinja', 40000.00, 'Vehicle mechanic providing mobile OBD2 computer scanning, brake system overhauls, alternator repairs, and general engine tuning.', 'Inactive');

-- Seed Role Accounts (admin, technician, client)
INSERT INTO users (id, name, email, role, phone, town, technician_id, password_hash) VALUES
('user-admin', 'Mangu Admin', 'admin@mangu.ug', 'admin', '+256 700 100 001', 'Kampala', NULL, 'admin123'),
('user-tech-1', 'Kato Joseph', 'kato.joseph@mangu.ug', 'technician', '+256 701 452 890', 'Kampala', 'tech-1', 'tech123'),
('user-client-1', 'Harriet Nalubega', 'harriet@mangu.ug', 'client', '+256 702 334 112', 'Kampala', NULL, 'client123');

COMMIT;
