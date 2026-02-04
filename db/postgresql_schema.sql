-- TRakio Asset Management & Module Builder - PostgreSQL Schema
-- Consolidated 33 tables from MySQL

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

-- Companies (Tenants)
CREATE TABLE IF NOT EXISTS companies (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    subdomain VARCHAR(100) UNIQUE,
    status VARCHAR(20) DEFAULT 'ACTIVE', -- Using VARCHAR for ENUM flexibility
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER update_companies_modtime BEFORE UPDATE ON companies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Users
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    company_id INT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL, -- SUPER_ADMIN, COMPANY_ADMIN, EMPLOYEE
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

-- Original Master list of modules
CREATE TABLE IF NOT EXISTS modules_master (
    id SERIAL PRIMARY KEY,
    module_key VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon VARCHAR(100)
);

-- Dynamic modules defined by companies
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

-- Sections within a module
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
CREATE INDEX idx_sections_module ON module_sections(module_id);
CREATE TRIGGER update_sections_modtime BEFORE UPDATE ON module_sections FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Dynamic fields within a section
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
CREATE INDEX idx_fields_section ON module_section_fields(section_id);
CREATE TRIGGER update_fields_modtime BEFORE UPDATE ON module_section_fields FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Options for dropdowns/radios
CREATE TABLE IF NOT EXISTS module_section_field_options (
    id SERIAL PRIMARY KEY,
    field_id INT NOT NULL,
    option_label VARCHAR(255) NOT NULL,
    option_value VARCHAR(255) NOT NULL,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_option_field FOREIGN KEY (field_id) REFERENCES module_section_fields(id) ON DELETE CASCADE
);

CREATE INDEX idx_options_field ON module_section_field_options(field_id);

-- ==========================================
-- 4. ERP MODULE V2 SYSTEM (PARALLEL)
-- ==========================================

-- ERP Master Modules
CREATE TABLE IF NOT EXISTS module_master (
    module_id SERIAL PRIMARY KEY,
    module_name VARCHAR(255) NOT NULL,
    is_active SMALLINT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Module Templates
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

CREATE INDEX idx_templates_company ON module_templates(company_id);
CREATE TRIGGER update_templates_modtime BEFORE UPDATE ON module_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Module Heads
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

-- Module Subheads
CREATE TABLE IF NOT EXISTS module_subheads (
    id SERIAL PRIMARY KEY,
    head_id INT NOT NULL,
    subhead_title VARCHAR(255) NOT NULL,
    field_type VARCHAR(50) NOT NULL, -- TEXT, SELECT, RADIO
    placeholder VARCHAR(255),
    is_required SMALLINT DEFAULT 0,
    subhead_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_subhead_head FOREIGN KEY (head_id) REFERENCES module_heads(id) ON DELETE CASCADE
);

CREATE TRIGGER update_subheads_modtime BEFORE UPDATE ON module_subheads FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Module Subhead Options
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

CREATE TRIGGER update_subhead_options_modtime BEFORE UPDATE ON module_subhead_options FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

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
    CONSTRAINT fk_cm_country FOREIGN KEY (country_id) REFERENCES countries(id) ON DELETE SET NULL,
    CONSTRAINT fk_cm_property FOREIGN KEY (property_type_id) REFERENCES property_types(id) ON DELETE SET NULL,
    CONSTRAINT fk_cm_premises FOREIGN KEY (premises_type_id) REFERENCES premises_types(id) ON DELETE SET NULL,
    CONSTRAINT fk_cm_area FOREIGN KEY (area_id) REFERENCES area(id) ON DELETE SET NULL,
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

CREATE INDEX idx_dept_company ON departments(company_id);

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

CREATE INDEX idx_emp_company ON employees(company_id);

CREATE TABLE IF NOT EXISTS asset_categories (
    id SERIAL PRIMARY KEY,
    company_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    CONSTRAINT fk_cat_company FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

CREATE INDEX idx_cat_company ON asset_categories(company_id);

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
    CONSTRAINT fk_asset_cat FOREIGN KEY (category_id) REFERENCES asset_categories(id) ON DELETE SET NULL,
    CONSTRAINT fk_asset_holder FOREIGN KEY (current_holder_id) REFERENCES employees(id) ON DELETE SET NULL,
    CONSTRAINT unique_asset_code UNIQUE(company_id, asset_code)
);

CREATE INDEX idx_asset_company ON assets(company_id);

CREATE TABLE IF NOT EXISTS asset_assignments (
    id SERIAL PRIMARY KEY,
    company_id INT NOT NULL,
    asset_id INT NOT NULL,
    employee_id INT NOT NULL,
    assigned_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    returned_date TIMESTAMP NULL,
    notes TEXT,
    CONSTRAINT fk_asgn_company FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    CONSTRAINT fk_asgn_asset FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE,
    CONSTRAINT fk_asgn_emp FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
);

CREATE INDEX idx_asgn_company ON asset_assignments(company_id);

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
    CONSTRAINT fk_req_company FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    CONSTRAINT fk_req_emp FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
);

CREATE INDEX idx_req_company ON asset_requests(company_id);
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
    CONSTRAINT fk_mt_company FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    CONSTRAINT fk_mt_asset FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE
);

CREATE INDEX idx_mt_company ON maintenance_tickets(company_id);

CREATE TABLE IF NOT EXISTS audit_logs (
    id SERIAL PRIMARY KEY,
    company_id INT,
    user_id INT,
    action VARCHAR(255) NOT NULL,
    entity_type VARCHAR(100),
    entity_id INT,
    details JSONB,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_audit_company FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE SET NULL,
    CONSTRAINT fk_audit_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_audit_company ON audit_logs(company_id);

-- ==========================================
-- 7. PREMISES MANAGEMENT (SRS)
-- ==========================================

CREATE TABLE IF NOT EXISTS office_premises (
    premise_id SERIAL PRIMARY KEY,
    company_id INT NOT NULL,
    premise_type VARCHAR(20) NOT NULL, -- OWNED, RENTAL
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

CREATE INDEX idx_op_company ON office_premises(company_id);
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

CREATE INDEX idx_doc_company ON office_premises_documents(company_id);
CREATE INDEX idx_doc_premise ON office_premises_documents(company_id, premise_id);

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

CREATE INDEX idx_util_company ON office_premises_utilities(company_id);

-- ==========================================
-- 8. DYNAMIC DATA CAPTURE
-- ==========================================

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

CREATE INDEX idx_pmd_premise ON premises_module_details(premise_id);
CREATE INDEX idx_pmd_company ON premises_module_details(company_id);
CREATE TRIGGER update_pmd_modtime BEFORE UPDATE ON premises_module_details FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
