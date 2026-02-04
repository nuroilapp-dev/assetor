const db = require('./config/db');

async function migrate() {
    try {
        console.log('Starting ERP Module V2 Migration...');
        const connection = await db.getConnection();
        await connection.beginTransaction();

        try {
            // 1. Module Master (Ensure exists)
            await connection.execute(`
                CREATE TABLE IF NOT EXISTS module_master (
                    module_id INT AUTO_INCREMENT PRIMARY KEY,
                    module_name VARCHAR(255) NOT NULL,
                    is_active TINYINT DEFAULT 1,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `);

            // Seed Master Data if empty
            const [rows] = await connection.execute('SELECT COUNT(*) as count FROM module_master');
            if (rows[0].count === 0) {
                await connection.execute(`
                    INSERT INTO module_master (module_name) VALUES 
                    ('Premises'), ('Assets'), ('Employees'), ('Maintenance')
                `);
                console.log('Seeded module_master.');
            }

            // 2. Module Templates
            // Added company_id for tenant isolation
            await connection.execute(`
                CREATE TABLE IF NOT EXISTS module_templates (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    company_id INT NOT NULL, 
                    module_id INT NOT NULL,
                    template_name VARCHAR(255),
                    is_active TINYINT DEFAULT 1,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    FOREIGN KEY (module_id) REFERENCES module_master(module_id) ON DELETE CASCADE,
                    INDEX (company_id)
                )
            `);

            // 3. Module Heads
            await connection.execute(`
                CREATE TABLE IF NOT EXISTS module_heads (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    template_id INT NOT NULL,
                    head_title VARCHAR(255) NOT NULL,
                    head_order INT DEFAULT 0,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    FOREIGN KEY (template_id) REFERENCES module_templates(id) ON DELETE CASCADE
                )
            `);

            // 4. Module Subheads
            await connection.execute(`
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
                )
            `);

            // 5. Module Subhead Options
            await connection.execute(`
                CREATE TABLE IF NOT EXISTS module_subhead_options (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    subhead_id INT NOT NULL,
                    option_label VARCHAR(255) NOT NULL,
                    option_value VARCHAR(255) NOT NULL,
                    option_order INT DEFAULT 0,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    FOREIGN KEY (subhead_id) REFERENCES module_subheads(id) ON DELETE CASCADE
                )
            `);

            await connection.commit();
            console.log('ERP Module V2 migration completed successfully.');
        } catch (err) {
            await connection.rollback();
            throw err;
        } finally {
            connection.release();
        }

        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

migrate();
