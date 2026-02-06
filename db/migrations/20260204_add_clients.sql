-- Migration: Introduce Clients and Limits for Superadmin Control Center

-- 0. Ensure updated_at function exists
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 1. Create Clients Table
CREATE TABLE IF NOT EXISTS clients (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    status VARCHAR(20) DEFAULT 'ACTIVE', -- ACTIVE, SUSPENDED
    max_companies INT DEFAULT 5,
    max_employees INT DEFAULT 100,
    max_assets INT DEFAULT 500,
    enabled_modules JSONB DEFAULT '[]', -- List of module keys enabled for this client
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Add client_id to Companies and Users
ALTER TABLE companies ADD COLUMN IF NOT EXISTS client_id INT;
ALTER TABLE companies ADD CONSTRAINT fk_company_client FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE SET NULL;

ALTER TABLE users ADD COLUMN IF NOT EXISTS client_id INT;
ALTER TABLE users ADD CONSTRAINT fk_user_client FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE SET NULL;

-- 3. Add timestamp trigger for clients
CREATE TRIGGER update_clients_modtime BEFORE UPDATE ON clients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 4. Seed a default client for existing data
INSERT INTO clients (name, max_companies, max_employees, max_assets, enabled_modules) 
VALUES ('Default Client', 10, 200, 1000, '["dashboard", "assets", "premises", "employees"]')
ON CONFLICT DO NOTHING;

-- 5. Link existing companies to the default client (if any exist)
UPDATE companies SET client_id = (SELECT id FROM clients WHERE name = 'Default Client' LIMIT 1) WHERE client_id IS NULL;
