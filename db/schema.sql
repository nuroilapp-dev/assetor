-- TRakio Asset Management & Module Builder Full Schema (33 Tables Total)
CREATE DATABASE IF NOT EXISTS software_db;
USE software_db;

-- ==========================================
-- 1. SYSTEM CORE & TENANCY
-- ==========================================

-- Companies (Tenants)
CREATE TABLE IF NOT EXISTS companies (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    subdomain VARCHAR(100) UNIQUE,
    status ENUM('ACTIVE', 'INACTIVE', 'SUSPENDED') DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Users
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    company_id INT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('SUPER_ADMIN', 'COMPANY_ADMIN', 'EMPLOYEE') NOT NULL,
    status ENUM('ACTIVE', 'INACTIVE') DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    UNIQUE(company_id, email)
);

-- ==========================================
-- 2. MASTER DATA (DROPDOWNS)
-- ==========================================

CREATE TABLE IF NOT EXISTS countries (
    id INT AUTO_INCREMENT PRIMARY KEY,
    country_name VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS property_types (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS premises_types (
    id INT AUTO_INCREMENT PRIMARY KEY,
    type_name VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS area (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE
);

-- ==========================================
-- 3. CUSTOM MODULE BUILDER SYSTEM (MAIN)
-- ==========================================

-- Original Master list of modules (Dashboard, Assets, etc.)
CREATE TABLE IF NOT EXISTS modules_master (
    id INT AUTO_INCREMENT PRIMARY KEY,
    module_key VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon VARCHAR(100)
);

-- Dynamic modules defined by companies
CREATE TABLE IF NOT EXISTS modules (
    id INT AUTO_INCREMENT PRIMARY KEY,
    company_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status ENUM('ACTIVE', 'INACTIVE') DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    INDEX (company_id)
);

-- Sections within a module
CREATE TABLE IF NOT EXISTS module_sections (
    id INT AUTO_INCREMENT PRIMARY KEY,
    company_id INT NOT NULL,
    module_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    FOREIGN KEY (module_id) REFERENCES modules(id) ON DELETE CASCADE,
    INDEX (company_id),
    INDEX (module_id)
);

-- Dynamic fields within a section
CREATE TABLE IF NOT EXISTS module_section_fields (
    id INT AUTO_INCREMENT PRIMARY KEY,
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
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    FOREIGN KEY (module_id) REFERENCES modules(id) ON DELETE CASCADE,
    FOREIGN KEY (section_id) REFERENCES module_sections(id) ON DELETE CASCADE,
    INDEX (company_id),
    INDEX (section_id),
    UNIQUE KEY unique_field_key (company_id, section_id, field_key)
);

-- Options for dropdowns/radios
CREATE TABLE IF NOT EXISTS module_section_field_options (
    id INT AUTO_INCREMENT PRIMARY KEY,
    field_id INT NOT NULL,
    option_label VARCHAR(255) NOT NULL,
    option_value VARCHAR(255) NOT NULL,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (field_id) REFERENCES module_section_fields(id) ON DELETE CASCADE,
    INDEX (field_id)
);

-- ==========================================
-- 4. ERP MODULE V2 SYSTEM (PARALLEL)
-- ==========================================

-- ERP Master Modules (Premises, Assets, etc.)
CREATE TABLE IF NOT EXISTS module_master (
    module_id INT AUTO_INCREMENT PRIMARY KEY,
    module_name VARCHAR(255) NOT NULL,
    is_active TINYINT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Module Templates for Company Isolation
CREATE TABLE IF NOT EXISTS module_templates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    company_id INT NOT NULL, 
    module_id INT NOT NULL,
    template_name VARCHAR(255),
    is_active TINYINT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    FOREIGN KEY (module_id) REFERENCES module_master(module_id) ON DELETE CASCADE
);

-- Grouping Headers within Templates
CREATE TABLE IF NOT EXISTS module_heads (
    id INT AUTO_INCREMENT PRIMARY KEY,
    template_id INT NOT NULL,
    head_title VARCHAR(255) NOT NULL,
    head_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (template_id) REFERENCES module_templates(id) ON DELETE CASCADE
);

-- Specific fields (Subheads) within Headers
CREATE TABLE IF NOT EXISTS module_subheads (
    id INT AUTO_INCREMENT PRIMARY KEY,
    head_id INT NOT NULL,
    subhead_title VARCHAR(255) NOT NULL,
    field_type ENUM('TEXT', 'SELECT', 'RADIO') NOT NULL,
    placeholder VARCHAR(255),
    is_required TINYINT DEFAULT 0,
    subhead_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (head_id) REFERENCES module_heads(id) ON DELETE CASCADE
);

-- Options for ERP Subheads
CREATE TABLE IF NOT EXISTS module_subhead_options (
    id INT AUTO_INCREMENT PRIMARY KEY,
    subhead_id INT NOT NULL,
    option_label VARCHAR(255) NOT NULL,
    option_value VARCHAR(255) NOT NULL,
    option_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (subhead_id) REFERENCES module_subheads(id) ON DELETE CASCADE
);

-- ==========================================
-- 5. COMPANY MODULE CONFIGURATION
-- ==========================================

-- Links a company to a master module with specific filtering
CREATE TABLE IF NOT EXISTS company_modules (
    id INT AUTO_INCREMENT PRIMARY KEY,
    company_id INT NOT NULL,
    module_id INT NOT NULL,
    is_enabled BOOLEAN DEFAULT TRUE,
    country_id INT NULL,
    property_type_id INT NULL,
    premises_type_id INT NULL,
    area_id INT NULL,
    status_id INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    FOREIGN KEY (module_id) REFERENCES module_master(module_id) ON DELETE CASCADE,
    FOREIGN KEY (country_id) REFERENCES countries(id) ON DELETE SET NULL,
    FOREIGN KEY (property_type_id) REFERENCES property_types(id) ON DELETE SET NULL,
    FOREIGN KEY (premises_type_id) REFERENCES premises_types(id) ON DELETE SET NULL,
    FOREIGN KEY (area_id) REFERENCES area(id) ON DELETE SET NULL,
    UNIQUE(company_id, module_id, country_id, property_type_id, premises_type_id, area_id)
);

-- Stores which specific fields are enabled for a company's module configuration
CREATE TABLE IF NOT EXISTS company_module_field_selection (
    id INT AUTO_INCREMENT PRIMARY KEY,
    company_module_id INT NOT NULL,
    field_id INT NOT NULL,
    FOREIGN KEY (company_module_id) REFERENCES company_modules(id) ON DELETE CASCADE,
    FOREIGN KEY (field_id) REFERENCES module_section_fields(id) ON DELETE CASCADE
);

-- ==========================================
-- 6. CORE ASSET MANAGEMENT
-- ==========================================

CREATE TABLE IF NOT EXISTS departments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    company_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50),
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    INDEX (company_id)
);

CREATE TABLE IF NOT EXISTS employees (
    id INT AUTO_INCREMENT PRIMARY KEY,
    company_id INT NOT NULL,
    department_id INT,
    employee_id_card VARCHAR(50),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    position VARCHAR(100),
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL,
    INDEX (company_id)
);

CREATE TABLE IF NOT EXISTS asset_categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    company_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    INDEX (company_id)
);

CREATE TABLE IF NOT EXISTS assets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    company_id INT NOT NULL,
    category_id INT,
    asset_code VARCHAR(100) NOT NULL,
    name VARCHAR(255) NOT NULL,
    brand VARCHAR(100),
    model VARCHAR(100),
    serial_number VARCHAR(100),
    purchase_date DATE,
    purchase_cost DECIMAL(15, 2),
    status ENUM('AVAILABLE', 'ASSIGNED', 'MAINTENANCE', 'RETIRED') DEFAULT 'AVAILABLE',
    current_holder_id INT,
    location VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES asset_categories(id) ON DELETE SET NULL,
    FOREIGN KEY (current_holder_id) REFERENCES employees(id) ON DELETE SET NULL,
    UNIQUE(company_id, asset_code),
    INDEX (company_id)
);

CREATE TABLE IF NOT EXISTS asset_assignments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    company_id INT NOT NULL,
    asset_id INT NOT NULL,
    employee_id INT NOT NULL,
    assigned_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    returned_date TIMESTAMP NULL,
    notes TEXT,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    INDEX (company_id)
);

CREATE TABLE IF NOT EXISTS asset_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    company_id INT NOT NULL,
    employee_id INT NOT NULL,
    category_id INT,
    asset_id INT,
    reason TEXT,
    status ENUM('SUBMITTED', 'APPROVED', 'REJECTED', 'FULFILLED') DEFAULT 'SUBMITTED',
    admin_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    INDEX (company_id)
);

CREATE TABLE IF NOT EXISTS maintenance_tickets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    company_id INT NOT NULL,
    asset_id INT NOT NULL,
    issue_description TEXT NOT NULL,
    status ENUM('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED') DEFAULT 'OPEN',
    priority ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL') DEFAULT 'MEDIUM',
    cost DECIMAL(15, 2) DEFAULT 0.00,
    scheduled_date DATE,
    completion_date DATE,
    performed_by VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE,
    INDEX (company_id)
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    company_id INT,
    user_id INT,
    action VARCHAR(255) NOT NULL,
    entity_type VARCHAR(100),
    entity_id INT,
    details JSON,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE SET NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX (company_id)
);

-- ==========================================
-- 7. PREMISES MANAGEMENT (SRS)
-- ==========================================

CREATE TABLE IF NOT EXISTS office_premises (
    premise_id INT AUTO_INCREMENT PRIMARY KEY,
    company_id INT NOT NULL,
    premise_type ENUM('OWNED', 'RENTAL') NOT NULL,
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
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NULL ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    INDEX (company_id)
);

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
    electricity_available TINYINT DEFAULT 1,
    FOREIGN KEY (premise_id) REFERENCES office_premises(premise_id) ON DELETE CASCADE
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
    FOREIGN KEY (premise_id) REFERENCES office_premises(premise_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS office_premises_documents (
    doc_id INT AUTO_INCREMENT PRIMARY KEY,
    company_id INT NOT NULL,
    premise_id INT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    mime_type VARCHAR(80) NOT NULL,
    uploaded_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    FOREIGN KEY (premise_id) REFERENCES office_premises(premise_id) ON DELETE CASCADE,
    INDEX (company_id),
    INDEX (company_id, premise_id)
);

CREATE TABLE IF NOT EXISTS office_premise_attachments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    premise_id INT NOT NULL,
    company_id INT NOT NULL,
    file_name VARCHAR(255),
    file_path VARCHAR(255),
    file_type VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (premise_id) REFERENCES office_premises(premise_id) ON DELETE CASCADE,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS office_premises_utilities (
    premise_id INT PRIMARY KEY,
    company_id INT NOT NULL,
    electricity_no VARCHAR(80),
    water_no VARCHAR(80),
    internet_provider VARCHAR(120),
    utility_notes TEXT,
    FOREIGN KEY (premise_id) REFERENCES office_premises(premise_id) ON DELETE CASCADE,
    INDEX (company_id)
);

-- ==========================================
-- 8. DYNAMIC DATA CAPTURE
-- ==========================================

-- Stores values for dynamic fields captured through the Module Builder system
CREATE TABLE IF NOT EXISTS premises_module_details (
    id INT AUTO_INCREMENT PRIMARY KEY,
    premise_id INT NOT NULL,
    company_id INT NOT NULL,
    field_key VARCHAR(255) NOT NULL,
    field_value TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (premise_id) REFERENCES office_premises(premise_id) ON DELETE CASCADE,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    INDEX (premise_id),
    INDEX (company_id)
);
