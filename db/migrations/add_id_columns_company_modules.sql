-- Migration to add ID columns to company_modules table
USE software_db;

-- Add ID columns if they don't exist
ALTER TABLE company_modules 
ADD COLUMN IF NOT EXISTS country_id INT(11) NULL AFTER country,
ADD COLUMN IF NOT EXISTS premises_type_id INT(11) NULL AFTER premises_type,
ADD COLUMN IF NOT EXISTS area_id INT(11) NULL AFTER section_area,
ADD COLUMN IF NOT EXISTS status_id INT(11) NULL DEFAULT 1;

-- Add indexes for better performance
ALTER TABLE company_modules 
ADD INDEX IF NOT EXISTS idx_country_id (country_id),
ADD INDEX IF NOT EXISTS idx_premises_type_id (premises_type_id),
ADD INDEX IF NOT EXISTS idx_area_id (area_id),
ADD INDEX IF NOT EXISTS idx_status_id (status_id);

-- Optional: Add foreign keys (uncomment if you want strict referential integrity)
-- ALTER TABLE company_modules ADD FOREIGN KEY (country_id) REFERENCES countries(id) ON DELETE SET NULL;
-- ALTER TABLE company_modules ADD FOREIGN KEY (premises_type_id) REFERENCES premises_types(id) ON DELETE SET NULL;
-- ALTER TABLE company_modules ADD FOREIGN KEY (area_id) REFERENCES area(id) ON DELETE SET NULL;
