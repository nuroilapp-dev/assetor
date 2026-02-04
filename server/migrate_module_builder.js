const db = require('./config/db');

async function migrate() {
    try {
        console.log('Starting module builder migration...');

        // 1. Modules Table
        await db.execute(`
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
            )
        `);
        console.log('Modules table created.');

        // 2. Module Sections Table
        await db.execute(`
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
            )
        `);
        console.log('Module Sections table created.');

        // 3. Section Fields Table
        await db.execute(`
            CREATE TABLE IF NOT EXISTS section_fields (
                id INT AUTO_INCREMENT PRIMARY KEY,
                company_id INT NOT NULL,
                section_id INT NOT NULL,
                label VARCHAR(255) NOT NULL,
                field_key VARCHAR(100) NOT NULL,
                field_type VARCHAR(50) NOT NULL,
                required BOOLEAN DEFAULT FALSE,
                options_json JSON,
                meta_json JSON,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
                FOREIGN KEY (section_id) REFERENCES module_sections(id) ON DELETE CASCADE,
                INDEX (company_id),
                INDEX (section_id)
            )
        `);
        console.log('Section Fields table created.');

        console.log('Migration completed successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

migrate();
