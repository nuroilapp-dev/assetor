const db = require('./config/db');

async function fixSchema() {
    try {
        console.log('Fixing schema to link to module_master...');

        // Drop in reverse order of dependencies
        await db.execute('DROP TABLE IF EXISTS module_section_field_options');
        await db.execute('DROP TABLE IF EXISTS module_section_fields');
        await db.execute('DROP TABLE IF EXISTS module_sections');

        // Recreate module_sections with FK to module_master
        console.log('Creating module_sections...');
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
                FOREIGN KEY (module_id) REFERENCES module_master(module_id) ON DELETE CASCADE,
                INDEX (company_id),
                INDEX (module_id)
            )
        `);

        // Recreate module_section_fields
        console.log('Creating module_section_fields...');
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
                FOREIGN KEY (module_id) REFERENCES module_master(module_id) ON DELETE CASCADE,
                FOREIGN KEY (section_id) REFERENCES module_sections(id) ON DELETE CASCADE,
                INDEX (company_id),
                INDEX (section_id),
                UNIQUE KEY unique_field_key (company_id, section_id, field_key)
            )
        `);

        // Recreate options
        console.log('Creating module_section_field_options...');
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

        // Seed some default sections for Premises (assuming module_id = 1 for Premises, checking via name if possible but hard to do in SQL var safely without procedure)
        // Instead, I'll seed for all existing modules in module_master if they match known names? 
        // Or just let user add them. The user prompt asked effectively to "show a dropdown... module_sections".
        // I will add a default section "Premises Identity" for ANY module that looks like "Premises" if I can?
        // No, I'll leave it empty. The user allows "Add Module" -> "Configure". 
        // Wait, the prompt said: "When module = Premises, only show its related section names." ... "Inside this next form... dropdown called Module Head ... populated from table".
        // If the table is empty, the dropdown is empty.
        // The user might expect ME to seed the "Premises Identity" section.
        // I will seed "Premises Identity" for module_id=1 (assuming Premises is 1).

        // Attempt to find Premises module ID
        const [rows] = await db.execute("SELECT module_id FROM module_master WHERE module_name LIKE '%Premises%' LIMIT 1");
        if (rows.length > 0) {
            const premisesId = rows[0].module_id;
            // Insert default sections for Company 1 (Demo)
            await db.execute(`
                INSERT INTO module_sections (company_id, module_id, name, sort_order) 
                SELECT 1, ?, 'Premises Identity', 1 WHERE NOT EXISTS (SELECT 1 FROM module_sections WHERE module_id=? AND name='Premises Identity')
            `, [premisesId, premisesId]);
            await db.execute(`
                INSERT INTO module_sections (company_id, module_id, name, sort_order) 
                SELECT 1, ?, 'Facility Specifications', 2 WHERE NOT EXISTS (SELECT 1 FROM module_sections WHERE module_id=? AND name='Facility Specifications')
            `, [premisesId, premisesId]);
            console.log(`Seeded sections for Premises (ID: ${premisesId})`);
        } else {
            console.log('Premises module not found, skipping seed.');
        }

        console.log("Schema Link Fixed successfully.");
        process.exit(0);
    } catch (error) {
        console.error('Fix failed:', error);
        process.exit(1);
    }
}

fixSchema();
