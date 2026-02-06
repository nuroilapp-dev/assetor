-- TRakio PostgreSQL Seed Data
-- Run this in pgAdmin or psql

-- 1. Insert Companies
INSERT INTO companies (name, subdomain) VALUES 
('TRakio Headquarters', 'admin'),
('Tech Solutions Inc', 'techsol'),
('Global Logistics', 'globallog');

-- 2. Insert Master Modules (Primary ones)
INSERT INTO module_master (module_name) VALUES 
('Premises'), ('Assets'), ('Employees'), ('Maintenance');

-- 3. Insert Users (Note: Passwords here are bcrypt hashes for 'admin123')
-- Hash for 'admin123': $2a$10$wNghUvj3tB4zD4U8k6r4u.mH6HkY1oXpYp2/vYOn/lYy/Y6T3B9Uy
INSERT INTO users (company_id, name, email, password, role) VALUES 
(NULL, 'Superadmin', 'superadmin@trakio.com', '$2a$10$wNghUvj3tB4zD4U8k6r4u.mH6HkY1oXpYp2/vYOn/lYy/Y6T3B9Uy', 'SUPER_ADMIN'),
(1, 'TRakio Admin', 'admin@trakio.com', '$2a$10$wNghUvj3tB4zD4U8k6r4u.mH6HkY1oXpYp2/vYOn/lYy/Y6T3B9Uy', 'COMPANY_ADMIN');

-- 4. Enable a module for Company 1
-- Use appropriate module_id based on the insert above
INSERT INTO company_modules (company_id, module_id, is_enabled) VALUES
(1, 1, TRUE);
