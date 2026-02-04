const db = require('./config/db');
async function migrate() {
    try {
        console.log('Creating company_module_field_selection table...');

        await db.execute(`
            CREATE TABLE IF NOT EXISTS company_module_field_selection (
                id INT AUTO_INCREMENT PRIMARY KEY,
                company_module_id INT NOT NULL,
                field_id INT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                KEY idx_cm (company_module_id),
                KEY idx_field (field_id),
                CONSTRAINT fk_cm_sel FOREIGN KEY (company_module_id) REFERENCES company_modules(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
        `);

        console.log('Table created successfully.');
        process.exit(0);
    } catch (e) {
        console.error('Migration failed:', e.message);
        process.exit(1);
    }
}
migrate();
