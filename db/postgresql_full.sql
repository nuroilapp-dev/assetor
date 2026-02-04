-- TRakio Asset Management & Module Builder - PostgreSQL Full Schema & Seed
-- Drop and recreate public schema for a clean slate
DROP SCHEMA IF EXISTS public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;

-- ==========================================
-- 0. EXTENSIONS & FUNCTIONS
-- ==========================================

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- ==========================================
-- 1. SYSTEM CORE & TENANCY
-- ==========================================

CREATE TABLE IF NOT EXISTS companies (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    subdomain VARCHAR(100) UNIQUE,
    status VARCHAR(20) DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER update_companies_modtime BEFORE UPDATE ON companies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    company_id INT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    status VARCHAR(20) DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_user_company FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    CONSTRAINT unique_company_email UNIQUE(company_id, email)
);

CREATE TRIGGER update_users_modtime BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==========================================
-- 2. MASTER DATA (DROPDOWNS)
-- ==========================================

CREATE TABLE IF NOT EXISTS countries (
    id SERIAL PRIMARY KEY,
    country_name VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS property_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS premises_types (
    id SERIAL PRIMARY KEY,
    type_name VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS area (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE
);

-- ==========================================
-- 3. CUSTOM MODULE BUILDER SYSTEM (MAIN)
-- ==========================================

CREATE TABLE IF NOT EXISTS modules_master (
    id SERIAL PRIMARY KEY,
    module_key VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS modules (
    id SERIAL PRIMARY KEY,
    company_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_module_company FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

CREATE INDEX idx_modules_company ON modules(company_id);
CREATE TRIGGER update_modules_modtime BEFORE UPDATE ON modules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE IF NOT EXISTS module_sections (
    id SERIAL PRIMARY KEY,
    company_id INT NOT NULL,
    module_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_section_company FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    CONSTRAINT fk_section_module FOREIGN KEY (module_id) REFERENCES modules(id) ON DELETE CASCADE
);

CREATE INDEX idx_sections_company ON module_sections(company_id);
CREATE TRIGGER update_sections_modtime BEFORE UPDATE ON module_sections FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE IF NOT EXISTS module_section_fields (
    id SERIAL PRIMARY KEY,
    company_id INT NOT NULL,
    module_id INT NOT NULL,
    section_id INT NOT NULL,
    field_key VARCHAR(100) NOT NULL,
    label VARCHAR(255) NOT NULL,
    field_type VARCHAR(50) NOT NULL,
    placeholder VARCHAR(255),
    is_required BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_field_company FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    CONSTRAINT fk_field_module FOREIGN KEY (module_id) REFERENCES modules(id) ON DELETE CASCADE,
    CONSTRAINT fk_field_section FOREIGN KEY (section_id) REFERENCES module_sections(id) ON DELETE CASCADE,
    CONSTRAINT unique_field_key UNIQUE (company_id, section_id, field_key)
);

CREATE INDEX idx_fields_company ON module_section_fields(company_id);
CREATE TRIGGER update_fields_modtime BEFORE UPDATE ON module_section_fields FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE IF NOT EXISTS module_section_field_options (
    id SERIAL PRIMARY KEY,
    field_id INT NOT NULL,
    option_label VARCHAR(255) NOT NULL,
    option_value VARCHAR(255) NOT NULL,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_option_field FOREIGN KEY (field_id) REFERENCES module_section_fields(id) ON DELETE CASCADE
);

-- ==========================================
-- 4. ERP MODULE V2 SYSTEM (PARALLEL)
-- ==========================================

CREATE TABLE IF NOT EXISTS module_master (
    module_id SERIAL PRIMARY KEY,
    module_name VARCHAR(255) NOT NULL,
    is_active SMALLINT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS module_templates (
    id SERIAL PRIMARY KEY,
    company_id INT NOT NULL, 
    module_id INT NOT NULL,
    template_name VARCHAR(255),
    is_active SMALLINT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_templ_company FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    CONSTRAINT fk_templ_master FOREIGN KEY (module_id) REFERENCES module_master(module_id) ON DELETE CASCADE
);

CREATE TRIGGER update_templates_modtime BEFORE UPDATE ON module_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE IF NOT EXISTS module_heads (
    id SERIAL PRIMARY KEY,
    template_id INT NOT NULL,
    head_title VARCHAR(255) NOT NULL,
    head_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_head_template FOREIGN KEY (template_id) REFERENCES module_templates(id) ON DELETE CASCADE
);

CREATE TRIGGER update_heads_modtime BEFORE UPDATE ON module_heads FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE IF NOT EXISTS module_subheads (
    id SERIAL PRIMARY KEY,
    head_id INT NOT NULL,
    subhead_title VARCHAR(255) NOT NULL,
    field_type VARCHAR(50) NOT NULL,
    placeholder VARCHAR(255),
    is_required SMALLINT DEFAULT 0,
    subhead_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_subhead_head FOREIGN KEY (head_id) REFERENCES module_heads(id) ON DELETE CASCADE
);

CREATE TRIGGER update_subheads_modtime BEFORE UPDATE ON module_subheads FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE IF NOT EXISTS module_subhead_options (
    id SERIAL PRIMARY KEY,
    subhead_id INT NOT NULL,
    option_label VARCHAR(255) NOT NULL,
    option_value VARCHAR(255) NOT NULL,
    option_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_subopt_subhead FOREIGN KEY (subhead_id) REFERENCES module_subheads(id) ON DELETE CASCADE
);

-- ==========================================
-- 5. COMPANY MODULE CONFIGURATION
-- ==========================================

CREATE TABLE IF NOT EXISTS company_modules (
    id SERIAL PRIMARY KEY,
    company_id INT NOT NULL,
    module_id INT NOT NULL,
    is_enabled BOOLEAN DEFAULT TRUE,
    country_id INT NULL,
    property_type_id INT NULL,
    premises_type_id INT NULL,
    area_id INT NULL,
    status_id INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_cm_company FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    CONSTRAINT fk_cm_master FOREIGN KEY (module_id) REFERENCES module_master(module_id) ON DELETE CASCADE,
    CONSTRAINT unique_cm_config UNIQUE(company_id, module_id, country_id, property_type_id, premises_type_id, area_id)
);

CREATE TABLE IF NOT EXISTS company_module_field_selection (
    id SERIAL PRIMARY KEY,
    company_module_id INT NOT NULL,
    field_id INT NOT NULL,
    CONSTRAINT fk_sel_cm FOREIGN KEY (company_module_id) REFERENCES company_modules(id) ON DELETE CASCADE,
    CONSTRAINT fk_sel_field FOREIGN KEY (field_id) REFERENCES module_section_fields(id) ON DELETE CASCADE
);

-- ==========================================
-- 6. CORE ASSET MANAGEMENT
-- ==========================================

CREATE TABLE IF NOT EXISTS departments (
    id SERIAL PRIMARY KEY,
    company_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50),
    CONSTRAINT fk_dept_company FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS employees (
    id SERIAL PRIMARY KEY,
    company_id INT NOT NULL,
    department_id INT,
    employee_id_card VARCHAR(50),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    position VARCHAR(100),
    CONSTRAINT fk_emp_company FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    CONSTRAINT fk_emp_dept FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS asset_categories (
    id SERIAL PRIMARY KEY,
    company_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    CONSTRAINT fk_cat_company FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS assets (
    id SERIAL PRIMARY KEY,
    company_id INT NOT NULL,
    category_id INT,
    asset_code VARCHAR(100) NOT NULL,
    name VARCHAR(255) NOT NULL,
    brand VARCHAR(100),
    model VARCHAR(100),
    serial_number VARCHAR(100),
    purchase_date DATE,
    purchase_cost DECIMAL(15, 2),
    status VARCHAR(50) DEFAULT 'AVAILABLE',
    current_holder_id INT,
    location VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_asset_company FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    CONSTRAINT unique_asset_code UNIQUE(company_id, asset_code)
);

CREATE TABLE IF NOT EXISTS asset_assignments (
    id SERIAL PRIMARY KEY,
    company_id INT NOT NULL,
    asset_id INT NOT NULL,
    employee_id INT NOT NULL,
    assigned_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    returned_date TIMESTAMP NULL,
    notes TEXT,
    CONSTRAINT fk_asgn_company FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS asset_requests (
    id SERIAL PRIMARY KEY,
    company_id INT NOT NULL,
    employee_id INT NOT NULL,
    category_id INT,
    asset_id INT,
    reason TEXT,
    status VARCHAR(50) DEFAULT 'SUBMITTED',
    admin_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_req_company FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

CREATE TRIGGER update_requests_modtime BEFORE UPDATE ON asset_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE IF NOT EXISTS maintenance_tickets (
    id SERIAL PRIMARY KEY,
    company_id INT NOT NULL,
    asset_id INT NOT NULL,
    issue_description TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'OPEN',
    priority VARCHAR(50) DEFAULT 'MEDIUM',
    cost DECIMAL(15, 2) DEFAULT 0.00,
    scheduled_date DATE,
    completion_date DATE,
    performed_by VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_mt_company FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id SERIAL PRIMARY KEY,
    company_id INT,
    user_id INT,
    action VARCHAR(255) NOT NULL,
    entity_type VARCHAR(100),
    entity_id INT,
    details JSONB,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- 7. PREMISES MANAGEMENT (SRS)
-- ==========================================

CREATE TABLE IF NOT EXISTS office_premises (
    premise_id SERIAL PRIMARY KEY,
    company_id INT NOT NULL,
    premise_type VARCHAR(20) NOT NULL,
    premises_name VARCHAR(255) NOT NULL,
    building_name VARCHAR(255),
    premises_use VARCHAR(100),
    country VARCHAR(100),
    city VARCHAR(100),
    full_address TEXT,
    address_line1 VARCHAR(255),
    address_line2 VARCHAR(255),
    landmark VARCHAR(255),
    location_lat DECIMAL(10,7),
    location_lng DECIMAL(10,7),
    area_sqft DECIMAL(10,2),
    floors INT,
    capacity INT,
    status VARCHAR(20) DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT NULL,
    CONSTRAINT fk_op_company FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

CREATE TRIGGER update_op_modtime BEFORE UPDATE ON office_premises FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE IF NOT EXISTS office_owned_details (
    premise_id INT PRIMARY KEY,
    ownership_type VARCHAR(50),
    buy_date DATE,
    purchase_value DECIMAL(15,2),
    vendor_name VARCHAR(150),
    warranty_end_date DATE,
    insurance_expiry DATE,
    property_tax_id VARCHAR(80),
    depreciation_percent DECIMAL(5,2),
    electricity_available SMALLINT DEFAULT 1,
    CONSTRAINT fk_ood_premise FOREIGN KEY (premise_id) REFERENCES office_premises(premise_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS office_rental_details (
    premise_id INT PRIMARY KEY,
    landlord_name VARCHAR(255),
    landlord_email VARCHAR(150),
    lease_start_date DATE,
    lease_end_date DATE,
    rent_amount DECIMAL(12,2),
    payment_cycle VARCHAR(50) DEFAULT 'MONTHLY',
    deposit_amount DECIMAL(12,2),
    next_due_date DATE,
    CONSTRAINT fk_ord_premise FOREIGN KEY (premise_id) REFERENCES office_premises(premise_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS office_premises_documents (
    doc_id SERIAL PRIMARY KEY,
    company_id INT NOT NULL,
    premise_id INT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    mime_type VARCHAR(80) NOT NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_doc_company FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    CONSTRAINT fk_doc_premise FOREIGN KEY (premise_id) REFERENCES office_premises(premise_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS office_premise_attachments (
    id SERIAL PRIMARY KEY,
    premise_id INT NOT NULL,
    company_id INT NOT NULL,
    file_name VARCHAR(255),
    file_path VARCHAR(255),
    file_type VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_att_premise FOREIGN KEY (premise_id) REFERENCES office_premises(premise_id) ON DELETE CASCADE,
    CONSTRAINT fk_att_company FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS office_premises_utilities (
    premise_id INT PRIMARY KEY,
    company_id INT NOT NULL,
    electricity_no VARCHAR(80),
    water_no VARCHAR(80),
    internet_provider VARCHAR(120),
    utility_notes TEXT,
    CONSTRAINT fk_util_premise FOREIGN KEY (premise_id) REFERENCES office_premises(premise_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS premises_module_details (
    id SERIAL PRIMARY KEY,
    premise_id INT NOT NULL,
    company_id INT NOT NULL,
    field_key VARCHAR(255) NOT NULL,
    field_value TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_pmd_premise FOREIGN KEY (premise_id) REFERENCES office_premises(premise_id) ON DELETE CASCADE,
    CONSTRAINT fk_pmd_company FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

CREATE TRIGGER update_pmd_modtime BEFORE UPDATE ON premises_module_details FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==========================================
-- 8. SEED DATA
-- ==========================================

-- Companies
INSERT INTO companies (id, name, subdomain) VALUES (1, 'TRakio Headquarters', 'admin') ON CONFLICT (id) DO NOTHING;
SELECT setval('companies_id_seq', (SELECT MAX(id) FROM companies));

-- Users (admin123)
-- Hash: $2a$10$wNghUvj3tB4zD4U8k6r4u.mH6HkY1oXpYp2/vYOn/lYy/Y6T3B9Uy
INSERT INTO users (company_id, name, email, password, role, status) VALUES 
(1, 'TRakio Admin', 'admin@trakio.com', '$2a$10$wNghUvj3tB4zD4U8k6r4u.mH6HkY1oXpYp2/vYOn/lYy/Y6T3B9Uy', 'COMPANY_ADMIN', 'ACTIVE')
ON CONFLICT (company_id, email) DO NOTHING;

-- Countries
INSERT INTO countries (country_name) VALUES ('UAE'), ('India'), ('USA'), ('UK'), ('Saudi Arabia') ON CONFLICT DO NOTHING;

-- Premises Types
INSERT INTO premises_types (type_name) VALUES ('OWNED'), ('RENTAL') ON CONFLICT DO NOTHING;

-- Property Types
INSERT INTO property_types (name) VALUES ('OFFICE'), ('WAREHOUSE'), ('RETAIL'), ('RESIDENTIAL') ON CONFLICT DO NOTHING;

-- Areas
INSERT INTO area (name) VALUES ('Downtown'), ('Industrial Zone'), ('Business Central') ON CONFLICT DO NOTHING;

-- Module Master
INSERT INTO module_master (module_name) VALUES ('Premises'), ('Assets'), ('Employees'), ('Maintenance') ON CONFLICT DO NOTHING;

-- Modules Master (Old/Dynamic)
INSERT INTO modules_master (module_key, name, description, icon) VALUES 
('dashboard', 'Dashboard', 'Overview', 'dashboard'),
('assets', 'Assets', 'Track items', 'inventory'),
('premises', 'Premises', 'Manage buildings', 'business')
ON CONFLICT DO NOTHING;

-- Enable for Company 1
INSERT INTO company_modules (company_id, module_id, is_enabled) VALUES (1, 1, true) ON CONFLICT DO NOTHING;
INSERT INTO company_modules (company_id, module_id, is_enabled) VALUES (1, 2, true) ON CONFLICT DO NOTHING;
INSERT INTO company_modules (company_id, module_id, is_enabled) VALUES (1, 3, true) ON CONFLICT DO NOTHING;
INSERT INTO company_modules (company_id, module_id, is_enabled) VALUES (1, 4, true) ON CONFLICT DO NOTHING;
