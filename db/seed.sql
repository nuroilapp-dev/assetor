USE software_db;

-- 1. Insert Companies
INSERT INTO companies (name, subdomain) VALUES 
('TRakio Headquarters', 'admin'),
('Tech Solutions Inc', 'techsol'),
('Global Logistics', 'globallog');

-- 2. Insert Master Modules
INSERT INTO modules_master (module_key, name, description, icon) VALUES 
('dashboard', 'Dashboard', 'Overview of all assets and activities', 'dashboard'),
('assets', 'Asset Management', 'Manage and track company assets', 'inventory'),
('departments', 'Departments', 'Manage company departments', 'business'),
('employees', 'Employee Directory', 'Manage employees and their assignments', 'people'),
('categories', 'Asset Categories', 'Define types of assets', 'category'),
('requests', 'Asset Requests', 'Handle employee asset requests', 'assignment'),
('maintenance', 'Maintenance', 'Schedule and track asset maintenance', 'build'),
('reports', 'Reports', 'Generate and export asset reports', 'bar-chart'),
('settings', 'Settings', 'Company and user configuration', 'settings');

-- 3. Enable modules for Company 1 (TRakio) and Company 2 (Tech Solutions)
INSERT INTO company_modules (company_id, module_id, is_enabled)
SELECT 1, id, TRUE FROM modules_master;

INSERT INTO company_modules (company_id, module_id, is_enabled)
SELECT 2, id, TRUE FROM modules_master WHERE module_key IN ('dashboard', 'assets', 'departments', 'employees', 'categories', 'requests', 'settings');

-- 4. Insert Users (Plain text passwords for development as requested)
INSERT INTO users (company_id, name, email, password, role) VALUES 
(NULL, 'System Admin', 'superadmin@trakio.com', 'admin123', 'SUPER_ADMIN'),
(1, 'TRakio Admin', 'admin@trakio.com', 'admin123', 'COMPANY_ADMIN'),
(2, 'TechSol Admin', 'admin@techsol.com', 'admin123', 'COMPANY_ADMIN'),
(1, 'John Doe Employee', 'john@trakio.com', 'user123', 'EMPLOYEE');

-- 5. Insert Departments
INSERT INTO departments (company_id, name, code) VALUES 
(1, 'IT Engineering', 'IT-ENG'),
(1, 'Human Resources', 'HR'),
(2, 'Electronics', 'ELEC');

-- 6. Insert Employees
INSERT INTO employees (company_id, department_id, name, email, employee_id_card, position) VALUES 
(1, 1, 'John Doe', 'john@trakio.com', 'EMP001', 'Senior Developer'),
(1, 2, 'Jane Smith', 'jane@trakio.com', 'EMP002', 'HR Manager'),
(2, 3, 'Bob Wilson', 'bob@techsol.com', 'TS001', 'Technician');

-- 7. Insert Asset Categories
INSERT INTO asset_categories (company_id, name, description) VALUES 
(1, 'Laptops', 'Portable computing devices'),
(1, 'Monitors', 'Display units'),
(1, 'Furniture', 'Office chairs, desks, etc.'),
(2, 'Diagnostic Tools', 'Specialized tech equipment');

-- 8. Insert Assets
INSERT INTO assets (company_id, category_id, asset_code, name, brand, model, status, current_holder_id) VALUES 
(1, 1, 'LT-001', 'MacBook Pro 16', 'Apple', 'M2 Pro', 'ASSIGNED', 1),
(1, 1, 'LT-002', 'ThinkPad Z13', 'Lenovo', 'Gen 1', 'AVAILABLE', NULL),
(1, 2, 'MN-001', 'UltraSharp 27', 'Dell', 'U2723QE', 'AVAILABLE', NULL),
(2, 4, 'DT-001', 'Oscilloscope', 'Tektronix', 'TBS1000', 'AVAILABLE', NULL);

-- 9. Insert Sample Maintenance
INSERT INTO maintenance_tickets (company_id, asset_id, issue_description, status, priority, scheduled_date) VALUES 
(1, 1, 'Battery replacement', 'OPEN', 'MEDIUM', '2026-02-15');

-- 10. Insert Sample Request
INSERT INTO asset_requests (company_id, employee_id, category_id, reason, status) VALUES 
(1, 1, 2, 'Need a second monitor for design work', 'SUBMITTED');
