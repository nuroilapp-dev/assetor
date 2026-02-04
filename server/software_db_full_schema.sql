-- PostgreSQL Full Schema Export
DROP SCHEMA IF EXISTS public CASCADE;
CREATE SCHEMA public;

-- Table: area
CREATE TABLE "area" (
  "id" INTEGER NOT NULL DEFAULT nextval('area_id_seq'::regclass),
  "name" CHARACTER VARYING(100) NOT NULL,
  PRIMARY KEY ("id")
);

-- Table: asset_assignments
CREATE TABLE "asset_assignments" (
  "id" INTEGER NOT NULL DEFAULT nextval('asset_assignments_id_seq'::regclass),
  "company_id" INTEGER NOT NULL,
  "asset_id" INTEGER NOT NULL,
  "employee_id" INTEGER NOT NULL,
  "assigned_date" TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "returned_date" TIMESTAMP WITHOUT TIME ZONE,
  "notes" TEXT,
  PRIMARY KEY ("id")
);

-- Table: asset_categories
CREATE TABLE "asset_categories" (
  "id" INTEGER NOT NULL DEFAULT nextval('asset_categories_id_seq'::regclass),
  "company_id" INTEGER NOT NULL,
  "name" CHARACTER VARYING(255) NOT NULL,
  "description" TEXT,
  PRIMARY KEY ("id")
);

-- Table: asset_requests
CREATE TABLE "asset_requests" (
  "id" INTEGER NOT NULL DEFAULT nextval('asset_requests_id_seq'::regclass),
  "company_id" INTEGER NOT NULL,
  "employee_id" INTEGER NOT NULL,
  "category_id" INTEGER,
  "asset_id" INTEGER,
  "reason" TEXT,
  "status" CHARACTER VARYING(50) DEFAULT 'SUBMITTED'::character varying,
  "admin_notes" TEXT,
  "created_at" TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("id")
);

-- Table: assets
CREATE TABLE "assets" (
  "id" INTEGER NOT NULL DEFAULT nextval('assets_id_seq'::regclass),
  "company_id" INTEGER NOT NULL,
  "category_id" INTEGER,
  "asset_code" CHARACTER VARYING(100) NOT NULL,
  "name" CHARACTER VARYING(255) NOT NULL,
  "brand" CHARACTER VARYING(100),
  "model" CHARACTER VARYING(100),
  "serial_number" CHARACTER VARYING(100),
  "purchase_date" DATE,
  "purchase_cost" NUMERIC,
  "status" CHARACTER VARYING(50) DEFAULT 'AVAILABLE'::character varying,
  "current_holder_id" INTEGER,
  "location" CHARACTER VARYING(255),
  "notes" TEXT,
  "created_at" TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("id")
);

-- Table: audit_logs
CREATE TABLE "audit_logs" (
  "id" INTEGER NOT NULL DEFAULT nextval('audit_logs_id_seq'::regclass),
  "company_id" INTEGER,
  "user_id" INTEGER,
  "action" CHARACTER VARYING(255) NOT NULL,
  "entity_type" CHARACTER VARYING(100),
  "entity_id" INTEGER,
  "details" JSONB,
  "ip_address" CHARACTER VARYING(45),
  "created_at" TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("id")
);

-- Table: companies
CREATE TABLE "companies" (
  "id" INTEGER NOT NULL DEFAULT nextval('companies_id_seq'::regclass),
  "name" CHARACTER VARYING(255) NOT NULL,
  "subdomain" CHARACTER VARYING(100),
  "status" CHARACTER VARYING(20) DEFAULT 'ACTIVE'::character varying,
  "created_at" TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("id")
);

-- Table: company_module_field_selection
CREATE TABLE "company_module_field_selection" (
  "id" INTEGER NOT NULL DEFAULT nextval('company_module_field_selection_id_seq'::regclass),
  "company_module_id" INTEGER NOT NULL,
  "field_id" INTEGER NOT NULL,
  "created_at" TIMESTAMP WITHOUT TIME ZONE,
  PRIMARY KEY ("id")
);

-- Table: company_modules
CREATE TABLE "company_modules" (
  "id" INTEGER NOT NULL DEFAULT nextval('company_modules_id_seq'::regclass),
  "company_id" INTEGER NOT NULL,
  "module_id" INTEGER NOT NULL,
  "is_enabled" BOOLEAN DEFAULT true,
  "country_id" INTEGER,
  "property_type_id" INTEGER,
  "premises_type_id" INTEGER,
  "area_id" INTEGER,
  "status_id" INTEGER DEFAULT 1,
  "created_at" TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("id")
);

-- Table: countries
CREATE TABLE "countries" (
  "id" INTEGER NOT NULL DEFAULT nextval('countries_id_seq'::regclass),
  "country_name" CHARACTER VARYING(100) NOT NULL,
  PRIMARY KEY ("id")
);

-- Table: departments
CREATE TABLE "departments" (
  "id" INTEGER NOT NULL DEFAULT nextval('departments_id_seq'::regclass),
  "company_id" INTEGER NOT NULL,
  "name" CHARACTER VARYING(255) NOT NULL,
  "code" CHARACTER VARYING(50),
  PRIMARY KEY ("id")
);

-- Table: employees
CREATE TABLE "employees" (
  "id" INTEGER NOT NULL DEFAULT nextval('employees_id_seq'::regclass),
  "company_id" INTEGER NOT NULL,
  "department_id" INTEGER,
  "employee_id_card" CHARACTER VARYING(50),
  "name" CHARACTER VARYING(255) NOT NULL,
  "email" CHARACTER VARYING(255),
  "phone" CHARACTER VARYING(50),
  "position" CHARACTER VARYING(100),
  PRIMARY KEY ("id")
);

-- Table: maintenance_tickets
CREATE TABLE "maintenance_tickets" (
  "id" INTEGER NOT NULL DEFAULT nextval('maintenance_tickets_id_seq'::regclass),
  "company_id" INTEGER NOT NULL,
  "asset_id" INTEGER NOT NULL,
  "issue_description" TEXT NOT NULL,
  "status" CHARACTER VARYING(50) DEFAULT 'OPEN'::character varying,
  "priority" CHARACTER VARYING(50) DEFAULT 'MEDIUM'::character varying,
  "cost" NUMERIC DEFAULT 0.00,
  "scheduled_date" DATE,
  "completion_date" DATE,
  "performed_by" CHARACTER VARYING(255),
  "notes" TEXT,
  "created_at" TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("id")
);

-- Table: module_heads
CREATE TABLE "module_heads" (
  "id" INTEGER NOT NULL DEFAULT nextval('module_heads_id_seq'::regclass),
  "template_id" INTEGER NOT NULL,
  "head_title" CHARACTER VARYING(255) NOT NULL,
  "head_order" INTEGER DEFAULT 0,
  "created_at" TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("id")
);

-- Table: module_master
CREATE TABLE "module_master" (
  "module_id" INTEGER NOT NULL DEFAULT nextval('module_master_module_id_seq'::regclass),
  "module_name" CHARACTER VARYING(255) NOT NULL,
  "is_active" SMALLINT DEFAULT 1,
  "created_at" TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("module_id")
);

-- Table: module_section_field_options
CREATE TABLE "module_section_field_options" (
  "id" INTEGER NOT NULL DEFAULT nextval('module_section_field_options_id_seq'::regclass),
  "field_id" INTEGER NOT NULL,
  "option_label" CHARACTER VARYING(255) NOT NULL,
  "option_value" CHARACTER VARYING(255) NOT NULL,
  "sort_order" INTEGER DEFAULT 0,
  "created_at" TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("id")
);

-- Table: module_section_fields
CREATE TABLE "module_section_fields" (
  "id" INTEGER NOT NULL DEFAULT nextval('module_section_fields_id_seq'::regclass),
  "company_id" INTEGER NOT NULL,
  "module_id" INTEGER NOT NULL,
  "section_id" INTEGER NOT NULL,
  "field_key" CHARACTER VARYING(100) NOT NULL,
  "label" CHARACTER VARYING(255) NOT NULL,
  "field_type" CHARACTER VARYING(50) NOT NULL,
  "placeholder" CHARACTER VARYING(255),
  "is_required" BOOLEAN DEFAULT false,
  "is_active" BOOLEAN DEFAULT true,
  "sort_order" INTEGER DEFAULT 0,
  "created_at" TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("id")
);

-- Table: module_sections
CREATE TABLE "module_sections" (
  "id" INTEGER NOT NULL DEFAULT nextval('module_sections_id_seq'::regclass),
  "company_id" INTEGER NOT NULL,
  "module_id" INTEGER NOT NULL,
  "name" CHARACTER VARYING(255) NOT NULL,
  "sort_order" INTEGER DEFAULT 0,
  "created_at" TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("id")
);

-- Table: module_subhead_options
CREATE TABLE "module_subhead_options" (
  "id" INTEGER NOT NULL DEFAULT nextval('module_subhead_options_id_seq'::regclass),
  "subhead_id" INTEGER NOT NULL,
  "option_label" CHARACTER VARYING(255) NOT NULL,
  "option_value" CHARACTER VARYING(255) NOT NULL,
  "option_order" INTEGER DEFAULT 0,
  "created_at" TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("id")
);

-- Table: module_subheads
CREATE TABLE "module_subheads" (
  "id" INTEGER NOT NULL DEFAULT nextval('module_subheads_id_seq'::regclass),
  "head_id" INTEGER NOT NULL,
  "subhead_title" CHARACTER VARYING(255) NOT NULL,
  "field_type" CHARACTER VARYING(50) NOT NULL,
  "placeholder" CHARACTER VARYING(255),
  "is_required" SMALLINT DEFAULT 0,
  "subhead_order" INTEGER DEFAULT 0,
  "created_at" TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("id")
);

-- Table: module_templates
CREATE TABLE "module_templates" (
  "id" INTEGER NOT NULL DEFAULT nextval('module_templates_id_seq'::regclass),
  "company_id" INTEGER NOT NULL,
  "module_id" INTEGER NOT NULL,
  "template_name" CHARACTER VARYING(255),
  "is_active" SMALLINT DEFAULT 1,
  "created_at" TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "description" TEXT,
  PRIMARY KEY ("id")
);

-- Table: modules
CREATE TABLE "modules" (
  "id" INTEGER NOT NULL DEFAULT nextval('modules_id_seq'::regclass),
  "company_id" INTEGER NOT NULL,
  "name" CHARACTER VARYING(255) NOT NULL,
  "description" TEXT,
  "status" CHARACTER VARYING(20) DEFAULT 'ACTIVE'::character varying,
  "created_at" TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "module_key" CHARACTER VARYING(255),
  PRIMARY KEY ("id")
);

-- Table: modules_master
CREATE TABLE "modules_master" (
  "id" INTEGER NOT NULL DEFAULT nextval('modules_master_id_seq'::regclass),
  "module_key" CHARACTER VARYING(50) NOT NULL,
  "name" CHARACTER VARYING(100) NOT NULL,
  "description" TEXT,
  "icon" CHARACTER VARYING(100),
  PRIMARY KEY ("id")
);

-- Table: office_owned_details
CREATE TABLE "office_owned_details" (
  "premise_id" INTEGER NOT NULL,
  "ownership_type" CHARACTER VARYING(50),
  "buy_date" DATE,
  "purchase_value" NUMERIC,
  "vendor_name" CHARACTER VARYING(150),
  "warranty_end_date" DATE,
  "insurance_expiry" DATE,
  "property_tax_id" CHARACTER VARYING(80),
  "depreciation_percent" NUMERIC,
  "electricity_available" SMALLINT DEFAULT 1,
  "property_size_sqft" NUMERIC,
  "title_deed_ref" CHARACTER VARYING(255),
  "owner_name" CHARACTER VARYING(255),
  "renewal_required" INTEGER,
  "renewal_date" DATE,
  "insurance_required" INTEGER,
  "notes" TEXT,
  "floors_count" INTEGER,
  "depreciation_rate" NUMERIC,
  "water_available" INTEGER,
  "internet_available" INTEGER,
  PRIMARY KEY ("premise_id")
);

-- Table: office_premise_attachments
CREATE TABLE "office_premise_attachments" (
  "id" INTEGER NOT NULL DEFAULT nextval('office_premise_attachments_id_seq'::regclass),
  "premise_id" INTEGER NOT NULL,
  "company_id" INTEGER NOT NULL,
  "file_name" CHARACTER VARYING(255),
  "file_path" CHARACTER VARYING(255),
  "file_type" CHARACTER VARYING(100),
  "created_at" TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "attachment_id" INTEGER,
  "mime_type" CHARACTER VARYING(255),
  "uploaded_at" TIMESTAMP WITHOUT TIME ZONE,
  PRIMARY KEY ("id")
);

-- Table: office_premises
CREATE TABLE "office_premises" (
  "premise_id" INTEGER NOT NULL DEFAULT nextval('office_premises_premise_id_seq'::regclass),
  "company_id" INTEGER NOT NULL,
  "premise_type" CHARACTER VARYING(20) NOT NULL,
  "premises_name" CHARACTER VARYING(255) NOT NULL,
  "building_name" CHARACTER VARYING(255),
  "premises_use" CHARACTER VARYING(100),
  "country" CHARACTER VARYING(100),
  "city" CHARACTER VARYING(100),
  "full_address" TEXT,
  "address_line1" CHARACTER VARYING(255),
  "address_line2" CHARACTER VARYING(255),
  "landmark" CHARACTER VARYING(255),
  "location_lat" NUMERIC,
  "location_lng" NUMERIC,
  "area_sqft" NUMERIC,
  "floors" INTEGER,
  "capacity" INTEGER,
  "status" CHARACTER VARYING(20) DEFAULT 'ACTIVE'::character varying,
  "created_at" TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP WITHOUT TIME ZONE,
  "area_id" INTEGER,
  "company_module_id" INTEGER,
  "location_notes" TEXT,
  "document_name" CHARACTER VARYING(255),
  "document_path" CHARACTER VARYING(255),
  "document_mime" CHARACTER VARYING(255),
  "google_map_url" TEXT,
  "parking_available" INTEGER,
  "parking_area" CHARACTER VARYING(255),
  PRIMARY KEY ("premise_id")
);

-- Table: office_premises_documents
CREATE TABLE "office_premises_documents" (
  "doc_id" INTEGER NOT NULL DEFAULT nextval('office_premises_documents_doc_id_seq'::regclass),
  "company_id" INTEGER NOT NULL,
  "premise_id" INTEGER NOT NULL,
  "file_name" CHARACTER VARYING(255) NOT NULL,
  "file_path" CHARACTER VARYING(255) NOT NULL,
  "mime_type" CHARACTER VARYING(80) NOT NULL,
  "uploaded_at" TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("doc_id")
);

-- Table: office_premises_utilities
CREATE TABLE "office_premises_utilities" (
  "premise_id" INTEGER NOT NULL,
  "company_id" INTEGER NOT NULL,
  "electricity_no" CHARACTER VARYING(80),
  "water_no" CHARACTER VARYING(80),
  "internet_provider" CHARACTER VARYING(120),
  "utility_notes" TEXT,
  PRIMARY KEY ("premise_id")
);

-- Table: office_rental_details
CREATE TABLE "office_rental_details" (
  "premise_id" INTEGER NOT NULL,
  "landlord_name" CHARACTER VARYING(255),
  "landlord_email" CHARACTER VARYING(150),
  "lease_start_date" DATE,
  "lease_end_date" DATE,
  "rent_amount" NUMERIC,
  "payment_cycle" CHARACTER VARYING(50) DEFAULT 'MONTHLY'::character varying,
  "deposit_amount" NUMERIC,
  "next_due_date" DATE,
  "landlord_contact_person" CHARACTER VARYING(255),
  "landlord_phone" CHARACTER VARYING(255),
  "contract_start" DATE,
  "contract_end" DATE,
  "monthly_rent" NUMERIC,
  "security_deposit" NUMERIC,
  "renewal_reminder_date" DATE,
  "payment_frequency" TEXT,
  "next_payment_date" DATE,
  "late_fee_terms" CHARACTER VARYING(255),
  "notes" TEXT,
  "yearly_rent" NUMERIC,
  PRIMARY KEY ("premise_id")
);

-- Table: premises_module_details
CREATE TABLE "premises_module_details" (
  "id" INTEGER NOT NULL DEFAULT nextval('premises_module_details_id_seq'::regclass),
  "premise_id" INTEGER NOT NULL,
  "company_id" INTEGER NOT NULL,
  "field_key" CHARACTER VARYING(255) NOT NULL,
  "field_value" TEXT,
  "created_at" TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("id")
);

-- Table: premises_types
CREATE TABLE "premises_types" (
  "id" INTEGER NOT NULL DEFAULT nextval('premises_types_id_seq'::regclass),
  "type_name" CHARACTER VARYING(100) NOT NULL,
  PRIMARY KEY ("id")
);

-- Table: property_types
CREATE TABLE "property_types" (
  "id" INTEGER NOT NULL DEFAULT nextval('property_types_id_seq'::regclass),
  "name" CHARACTER VARYING(100) NOT NULL,
  PRIMARY KEY ("id")
);

-- Table: users
CREATE TABLE "users" (
  "id" INTEGER NOT NULL DEFAULT nextval('users_id_seq'::regclass),
  "company_id" INTEGER,
  "name" CHARACTER VARYING(255) NOT NULL,
  "email" CHARACTER VARYING(255) NOT NULL,
  "password" CHARACTER VARYING(255) NOT NULL,
  "role" CHARACTER VARYING(50) NOT NULL,
  "status" CHARACTER VARYING(20) DEFAULT 'ACTIVE'::character varying,
  "created_at" TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("id")
);

