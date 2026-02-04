-- STEP 1: CREATE TABLES
DROP SCHEMA IF EXISTS public CASCADE;
CREATE SCHEMA public;

CREATE TABLE "area" (
  "id" SERIAL,
  "name" VARCHAR(100),
  PRIMARY KEY ("id")
);

CREATE TABLE "asset_assignments" (
  "id" SERIAL,
  "company_id" INTEGER NOT NULL,
  "asset_id" INTEGER NOT NULL,
  "employee_id" INTEGER NOT NULL,
  "assigned_date" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "returned_date" TIMESTAMP,
  "notes" TEXT,
  PRIMARY KEY ("id")
);

CREATE TABLE "asset_categories" (
  "id" SERIAL,
  "company_id" INTEGER NOT NULL,
  "name" VARCHAR(255) NOT NULL,
  "description" TEXT,
  PRIMARY KEY ("id")
);

CREATE TABLE "asset_requests" (
  "id" SERIAL,
  "company_id" INTEGER NOT NULL,
  "employee_id" INTEGER NOT NULL,
  "category_id" INTEGER,
  "asset_id" INTEGER,
  "reason" TEXT,
  "status" TEXT DEFAULT 'SUBMITTED',
  "admin_notes" TEXT,
  "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("id")
);

CREATE TABLE "assets" (
  "id" SERIAL,
  "company_id" INTEGER NOT NULL,
  "category_id" INTEGER,
  "asset_code" VARCHAR(100) NOT NULL,
  "name" VARCHAR(255) NOT NULL,
  "brand" VARCHAR(100),
  "model" VARCHAR(100),
  "serial_number" VARCHAR(100),
  "purchase_date" DATE,
  "purchase_cost" NUMERIC,
  "status" TEXT DEFAULT 'AVAILABLE',
  "current_holder_id" INTEGER,
  "location" VARCHAR(255),
  "notes" TEXT,
  "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("id")
);

CREATE TABLE "audit_logs" (
  "id" SERIAL,
  "company_id" INTEGER,
  "user_id" INTEGER,
  "action" VARCHAR(255) NOT NULL,
  "entity_type" VARCHAR(100),
  "entity_id" INTEGER,
  "details" TEXT,
  "ip_address" VARCHAR(45),
  "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("id")
);

CREATE TABLE "companies" (
  "id" SERIAL,
  "name" VARCHAR(255) NOT NULL,
  "subdomain" VARCHAR(100),
  "status" TEXT DEFAULT 'ACTIVE',
  "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("id")
);

CREATE TABLE "company_module_field_selection" (
  "id" SERIAL,
  "company_module_id" INTEGER NOT NULL,
  "field_id" INTEGER NOT NULL,
  "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("id")
);

CREATE TABLE "company_modules" (
  "id" SERIAL,
  "company_id" INTEGER NOT NULL,
  "module_id" INTEGER NOT NULL,
  "is_enabled" INTEGER DEFAULT '1',
  "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "country_id" INTEGER,
  "property_type_id" INTEGER,
  "premises_type_id" INTEGER,
  "area_id" INTEGER,
  "status_id" INTEGER DEFAULT '1',
  PRIMARY KEY ("id")
);

CREATE TABLE "countries" (
  "id" SERIAL,
  "country_name" VARCHAR(100) NOT NULL,
  PRIMARY KEY ("id")
);

CREATE TABLE "departments" (
  "id" SERIAL,
  "company_id" INTEGER NOT NULL,
  "name" VARCHAR(255) NOT NULL,
  "code" VARCHAR(50),
  PRIMARY KEY ("id")
);

CREATE TABLE "employees" (
  "id" SERIAL,
  "company_id" INTEGER NOT NULL,
  "department_id" INTEGER,
  "employee_id_card" VARCHAR(50),
  "name" VARCHAR(255) NOT NULL,
  "email" VARCHAR(255),
  "phone" VARCHAR(50),
  "position" VARCHAR(100),
  PRIMARY KEY ("id")
);

CREATE TABLE "maintenance_tickets" (
  "id" SERIAL,
  "company_id" INTEGER NOT NULL,
  "asset_id" INTEGER NOT NULL,
  "issue_description" TEXT NOT NULL,
  "status" TEXT DEFAULT 'OPEN',
  "priority" TEXT DEFAULT 'MEDIUM',
  "cost" NUMERIC DEFAULT '0.00',
  "scheduled_date" DATE,
  "completion_date" DATE,
  "performed_by" VARCHAR(255),
  "notes" TEXT,
  "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("id")
);

CREATE TABLE "module_heads" (
  "id" SERIAL,
  "template_id" INTEGER NOT NULL,
  "head_title" VARCHAR(255) NOT NULL,
  "head_order" INTEGER DEFAULT '0',
  "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("id")
);

CREATE TABLE "module_master" (
  "module_id" SERIAL,
  "module_name" VARCHAR(255) NOT NULL,
  "is_active" INTEGER DEFAULT '1',
  "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("module_id")
);

CREATE TABLE "module_section_field_options" (
  "id" SERIAL,
  "field_id" INTEGER NOT NULL,
  "option_label" VARCHAR(255) NOT NULL,
  "option_value" VARCHAR(255) NOT NULL,
  "sort_order" INTEGER DEFAULT '0',
  "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("id")
);

CREATE TABLE "module_section_fields" (
  "id" SERIAL,
  "company_id" INTEGER NOT NULL,
  "module_id" INTEGER NOT NULL,
  "section_id" INTEGER NOT NULL,
  "field_key" VARCHAR(100) NOT NULL,
  "label" VARCHAR(255) NOT NULL,
  "field_type" VARCHAR(50) NOT NULL,
  "placeholder" VARCHAR(255),
  "is_required" INTEGER DEFAULT '0',
  "is_active" INTEGER DEFAULT '1',
  "sort_order" INTEGER DEFAULT '0',
  "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("id")
);

CREATE TABLE "module_sections" (
  "id" SERIAL,
  "company_id" INTEGER NOT NULL,
  "module_id" INTEGER NOT NULL,
  "name" VARCHAR(255) NOT NULL,
  "sort_order" INTEGER DEFAULT '0',
  "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("id")
);

CREATE TABLE "module_subhead_options" (
  "id" SERIAL,
  "subhead_id" INTEGER NOT NULL,
  "option_label" VARCHAR(255) NOT NULL,
  "option_value" VARCHAR(255) NOT NULL,
  "option_order" INTEGER DEFAULT '0',
  "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("id")
);

CREATE TABLE "module_subheads" (
  "id" SERIAL,
  "head_id" INTEGER NOT NULL,
  "subhead_title" VARCHAR(255) NOT NULL,
  "field_type" DATE NOT NULL,
  "placeholder" VARCHAR(255),
  "is_required" INTEGER DEFAULT '0',
  "subhead_order" INTEGER DEFAULT '0',
  "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("id")
);

CREATE TABLE "module_templates" (
  "id" SERIAL,
  "company_id" INTEGER NOT NULL,
  "module_id" INTEGER NOT NULL,
  "template_name" VARCHAR(255),
  "description" TEXT,
  "is_active" INTEGER DEFAULT '1',
  "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("id")
);

CREATE TABLE "modules" (
  "id" SERIAL,
  "company_id" INTEGER NOT NULL,
  "module_key" VARCHAR(50),
  "name" VARCHAR(255) NOT NULL,
  "description" TEXT,
  "status" TEXT DEFAULT 'ACTIVE',
  "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("id")
);

CREATE TABLE "modules_master" (
  "id" SERIAL,
  "module_key" VARCHAR(50) NOT NULL,
  "name" VARCHAR(100) NOT NULL,
  "description" TEXT,
  "icon" VARCHAR(100),
  PRIMARY KEY ("id")
);

CREATE TABLE "office_owned_details" (
  "premise_id" INTEGER NOT NULL,
  "buy_date" DATE NOT NULL,
  "purchase_value" NUMERIC NOT NULL,
  "property_size_sqft" NUMERIC,
  "title_deed_ref" VARCHAR(100),
  "owner_name" VARCHAR(120),
  "renewal_required" INTEGER DEFAULT '0',
  "renewal_date" DATE,
  "insurance_required" INTEGER DEFAULT '0',
  "insurance_expiry" DATE,
  "notes" TEXT,
  "floors_count" INTEGER DEFAULT '0',
  "depreciation_rate" NUMERIC DEFAULT '0.00',
  "electricity_available" INTEGER DEFAULT '0',
  "water_available" INTEGER DEFAULT '0',
  "internet_available" INTEGER DEFAULT '0',
  "ownership_type" VARCHAR(50),
  "vendor_name" VARCHAR(150),
  "warranty_end_date" DATE,
  "property_tax_id" VARCHAR(80),
  "depreciation_percent" NUMERIC,
  PRIMARY KEY ("premise_id")
);

CREATE TABLE "office_premise_attachments" (
  "attachment_id" SERIAL,
  "premise_id" INTEGER NOT NULL,
  "company_id" INTEGER NOT NULL,
  "file_name" VARCHAR(255) NOT NULL,
  "file_path" VARCHAR(255) NOT NULL,
  "mime_type" VARCHAR(100),
  "uploaded_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("attachment_id")
);

CREATE TABLE "office_premises" (
  "premise_id" SERIAL,
  "company_id" INTEGER NOT NULL,
  "premise_type" TEXT NOT NULL,
  "premises_name" VARCHAR(255) NOT NULL,
  "building_name" VARCHAR(255) NOT NULL,
  "premises_use" TEXT NOT NULL,
  "country" VARCHAR(100) NOT NULL,
  "area_id" INTEGER,
  "company_module_id" INTEGER,
  "city" VARCHAR(100) NOT NULL,
  "full_address" TEXT NOT NULL,
  "location_notes" TEXT,
  "status" VARCHAR(20) DEFAULT 'ACTIVE',
  "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "document_name" VARCHAR(255),
  "document_path" VARCHAR(255),
  "document_mime" VARCHAR(50),
  "google_map_url" TEXT,
  "capacity" INTEGER DEFAULT '0',
  "address_line2" VARCHAR(255),
  "landmark" VARCHAR(255),
  "address_line1" VARCHAR(255),
  "location_lat" NUMERIC,
  "location_lng" NUMERIC,
  "area_sqft" NUMERIC,
  "floors" INTEGER,
  "parking_available" INTEGER DEFAULT '0',
  "parking_area" VARCHAR(255),
  PRIMARY KEY ("premise_id")
);

CREATE TABLE "office_premises_documents" (
  "doc_id" SERIAL,
  "company_id" INTEGER NOT NULL,
  "premise_id" INTEGER NOT NULL,
  "file_name" VARCHAR(255) NOT NULL,
  "file_path" VARCHAR(255) NOT NULL,
  "mime_type" VARCHAR(80) NOT NULL,
  "uploaded_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("doc_id")
);

CREATE TABLE "office_premises_utilities" (
  "premise_id" INTEGER NOT NULL,
  "company_id" INTEGER NOT NULL,
  "electricity_no" VARCHAR(80),
  "water_no" VARCHAR(80),
  "internet_provider" VARCHAR(120),
  "utility_notes" TEXT,
  PRIMARY KEY ("premise_id")
);

CREATE TABLE "office_rental_details" (
  "premise_id" INTEGER NOT NULL,
  "landlord_name" VARCHAR(255) NOT NULL,
  "landlord_contact_person" VARCHAR(120),
  "landlord_phone" VARCHAR(50) NOT NULL,
  "landlord_email" VARCHAR(120),
  "contract_start" DATE NOT NULL,
  "contract_end" DATE NOT NULL,
  "monthly_rent" NUMERIC NOT NULL,
  "security_deposit" NUMERIC,
  "renewal_reminder_date" DATE,
  "payment_frequency" TEXT DEFAULT 'MONTHLY',
  "next_payment_date" DATE,
  "late_fee_terms" VARCHAR(255),
  "notes" TEXT,
  "yearly_rent" NUMERIC,
  "deposit_amount" NUMERIC,
  "next_due_date" DATE,
  "lease_start_date" DATE,
  "lease_end_date" DATE,
  "rent_amount" NUMERIC,
  "payment_cycle" VARCHAR(50) DEFAULT 'MONTHLY',
  PRIMARY KEY ("premise_id")
);

CREATE TABLE "premises_module_details" (
  "id" SERIAL,
  "premise_id" INTEGER NOT NULL,
  "company_id" INTEGER NOT NULL,
  "field_key" VARCHAR(255) NOT NULL,
  "field_value" TEXT,
  "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("id")
);

CREATE TABLE "premises_types" (
  "id" SERIAL,
  "type_name" VARCHAR(50) NOT NULL,
  PRIMARY KEY ("id")
);

CREATE TABLE "property_types" (
  "id" SERIAL,
  "name" VARCHAR(255) NOT NULL,
  PRIMARY KEY ("id")
);

CREATE TABLE "users" (
  "id" SERIAL,
  "company_id" INTEGER,
  "name" VARCHAR(255) NOT NULL,
  "email" VARCHAR(255) NOT NULL,
  "password" VARCHAR(255) NOT NULL,
  "role" TEXT NOT NULL,
  "status" TEXT DEFAULT 'ACTIVE',
  "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("id")
);

