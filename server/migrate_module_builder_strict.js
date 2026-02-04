const db = require('./config/db');

async function migrate() {
    try {
        console.log('Starting STRICT module builder migration...');

        // 1. Module Sections Table (Ensure it exists)
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
        console.log('Module Sections table ensured.');

        // 2. Module Section Fields Table (New name, replacing section_fields)
        // Dropping old table if it exists to clean up
        await db.execute('DROP TABLE IF EXISTS section_fields');

        await db.execute(`
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
            )
        `);
        console.log('Module Section Fields table created.');

        // 3. Module Section Field Options Table
        await db.execute(`
            CREATE TABLE IF NOT EXISTS module_section_field_options (
                id INT AUTO_INCREMENT PRIMARY KEY,
                field_id INT NOT NULL,
                option_label VARCHAR(255) NOT NULL,
                option_value VARCHAR(255) NOT NULL,
                sort_order INT DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (field_id) REFERENCES module_section_fields(id) ON DELETE CASCADE,
                INDEX (field_id)
            )
        `);
        console.log('Module Section Field Options table created.');

        console.log('Migration completed successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

migrate();
