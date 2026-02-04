const db = require('../config/db');

async function migrate() {
    try {
        const connection = await db.getConnection();
        console.log("Starting SRS Schema Extension...");

        // 1. Extend office_premises (Base)
        console.log("Updating office_premises...");
        await connection.query(`
            ALTER TABLE office_premises
            ADD COLUMN IF NOT EXISTS address_line1 VARCHAR(255) NULL,
            ADD COLUMN IF NOT EXISTS location_lat DECIMAL(10,7) NULL,
            ADD COLUMN IF NOT EXISTS location_lng DECIMAL(10,7) NULL,
            ADD COLUMN IF NOT EXISTS area_sqft DECIMAL(10,2) NULL,
            ADD COLUMN IF NOT EXISTS floors INT NULL,
            ADD COLUMN IF NOT EXISTS created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            ADD COLUMN IF NOT EXISTS updated_at DATETIME NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
            MODIFY COLUMN status VARCHAR(20) DEFAULT 'ACTIVE'
        `);

        // Sync old columns to new standard ones if needed (e.g. full_address -> address_line1)
        await connection.query(`UPDATE office_premises SET address_line1 = full_address WHERE address_line1 IS NULL AND full_address IS NOT NULL`);

        // 2. Extend office_owned_details
        console.log("Updating office_owned_details...");
        await connection.query(`
            ALTER TABLE office_owned_details
            ADD COLUMN IF NOT EXISTS ownership_type VARCHAR(50) NULL,
            ADD COLUMN IF NOT EXISTS vendor_name VARCHAR(150) NULL,
            ADD COLUMN IF NOT EXISTS warranty_end_date DATE NULL,
            ADD COLUMN IF NOT EXISTS property_tax_id VARCHAR(80) NULL,
            ADD COLUMN IF NOT EXISTS depreciation_percent DECIMAL(5,2) NULL
        `);

        // 3. Extend office_rental_details
        console.log("Updating office_rental_details...");
        await connection.query(`
            ALTER TABLE office_rental_details
            ADD COLUMN IF NOT EXISTS landlord_email VARCHAR(150) NULL,
            ADD COLUMN IF NOT EXISTS deposit_amount DECIMAL(12,2) NULL,
            ADD COLUMN IF NOT EXISTS next_due_date DATE NULL,
            ADD COLUMN IF NOT EXISTS lease_start_date DATE NULL,
            ADD COLUMN IF NOT EXISTS lease_end_date DATE NULL,
            ADD COLUMN IF NOT EXISTS rent_amount DECIMAL(12,2) NULL,
            ADD COLUMN IF NOT EXISTS payment_cycle VARCHAR(50) DEFAULT 'MONTHLY'
        `);

        // 4. Create office_premises_documents
        console.log("Creating office_premises_documents...");
        await connection.query(`
            CREATE TABLE IF NOT EXISTS office_premises_documents (
                doc_id INT AUTO_INCREMENT PRIMARY KEY,
                company_id INT NOT NULL,
                premise_id INT NOT NULL,
                file_name VARCHAR(255) NOT NULL,
                file_path VARCHAR(255) NOT NULL,
                mime_type VARCHAR(80) NOT NULL,
                uploaded_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                INDEX (company_id),
                INDEX (company_id, premise_id)
            )
        `);

        // 5. Create office_premises_utilities
        console.log("Creating office_premises_utilities...");
        await connection.query(`
            CREATE TABLE IF NOT EXISTS office_premises_utilities (
                premise_id INT PRIMARY KEY,
                company_id INT NOT NULL,
                electricity_no VARCHAR(80) NULL,
                water_no VARCHAR(80) NULL,
                internet_provider VARCHAR(120) NULL,
                utility_notes TEXT NULL,
                INDEX (company_id)
            )
        `);

        console.log("Schema Extension Complete.");
        process.exit(0);
    } catch (error) {
        console.error("Migration Error:", error);
        process.exit(1);
    }
}

migrate();
