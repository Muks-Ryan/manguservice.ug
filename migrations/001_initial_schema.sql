BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE user_role AS ENUM ('admin', 'technician', 'client');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'technician_status') THEN
    CREATE TYPE technician_status AS ENUM ('Active', 'Available', 'Busy', 'Inactive');
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

CREATE INDEX IF NOT EXISTS idx_technicians_trade ON technicians(trade);
CREATE INDEX IF NOT EXISTS idx_technicians_town ON technicians(town);
CREATE INDEX IF NOT EXISTS idx_technicians_status ON technicians(status);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

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

INSERT INTO technicians (id, name, trade, phone, email, town, hourly_rate_ugx, bio, status)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'Kato Joseph', 'Electrical', '+256 701 452 890', 'kato.joseph@mangu.ug', 'Kampala', 35000, 'Certified Master Electrician specializing in domestic wiring, solar power installations, and generator maintenance across Kampala.', 'Available'),
  ('00000000-0000-0000-0000-000000000002', 'Akello Grace', 'Plumbing', '+256 772 314 902', 'akello.grace@mangu.ug', 'Entebbe', 30000, 'Licensed plumber with deep expertise in emergency leaks, pressure water tanks, drainage unclogging, and sanitary fittings.', 'Available'),
  ('00000000-0000-0000-0000-000000000003', 'Mukasa Ivan', 'Appliance Repair', '+256 782 119 450', 'mukasa.ivan@mangu.ug', 'Jinja', 40000, 'Cooling technician with 10 years experience servicing Samsung, LG, and Hisense refrigerators, AC units, and washing machines.', 'Busy'),
  ('00000000-0000-0000-0000-000000000004', 'Okello Patrick', 'ICT & Computers', '+256 753 980 123', 'okello.p@mangu.ug', 'Kampala', 30000, 'Computer engineer offering component-level laptop motherboard repairs, WiFi router setup, and CCTV security camera installation.', 'Available'),
  ('00000000-0000-0000-0000-000000000005', 'Namubiru Sarah', 'Carpentry', '+256 704 551 889', 'sarah.namubiru@mangu.ug', 'Kampala', 35000, 'Precision woodworker specializing in custom kitchen cabinets, fitted bedroom wardrobes, office desks, and door lock installations.', 'Active'),
  ('00000000-0000-0000-0000-000000000006', 'Ssemwanga David', 'Auto Mechanics', '+256 779 881 223', 'david.ssemwanga@mangu.ug', 'Jinja', 40000, 'Vehicle mechanic providing mobile OBD2 computer scanning, brake system overhauls, alternator repairs, and general engine tuning.', 'Inactive')
ON CONFLICT (id) DO NOTHING;

INSERT INTO users (id, name, email, role, phone, town, technician_id, password_hash)
VALUES
  ('00000000-0000-0000-0000-000000000101', 'Mangu Admin', 'admin@mangu.ug', 'admin', '+256 700 100 001', 'Kampala', NULL, '$2b$12$oZEw00z.ujnrLLnTztwEnezReGuQaSmj.XWt3BTGyOFPzWKBleI5G'),
  ('00000000-0000-0000-0000-000000000102', 'Kato Joseph', 'kato.joseph@mangu.ug', 'technician', '+256 701 452 890', 'Kampala', '00000000-0000-0000-0000-000000000001', '$2b$12$CaAWUrn8IUDZ71.yR2.aUO3rUbwNheqgWrdRkVGPHclMiqzKDObFm'),
  ('00000000-0000-0000-0000-000000000103', 'Harriet Nalubega', 'harriet@mangu.ug', 'client', '+256 702 334 112', 'Kampala', NULL, '$2b$12$IdhVsPu19Kde/idbAwjFSenkVVogvuli5o8KB2NiV.Hr7txH71416')
ON CONFLICT (id) DO NOTHING;

COMMIT;