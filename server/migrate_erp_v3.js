const db = require('./config/db');

async function migrate() {
    try {
        console.log('Updating module_subheads field_type ENUM...');

        // 1. Update ENUM values
        await db.execute(`
            ALTER TABLE module_subheads 
            MODIFY COLUMN field_type ENUM('TEXT', 'NUMBER', 'TEXTAREA', 'DATE', 'SELECT', 'RADIO', 'CHECKBOX') NOT NULL
        `);

        // 2. Ensure "Asset Categories" exists in module_master
        const [rows] = await db.execute("SELECT * FROM module_master WHERE module_name = 'Asset Categories'");
        if (rows.length === 0) {
            await db.execute("INSERT INTO module_master (module_name) VALUES ('Asset Categories')");
            console.log('Added Asset Categories to module_master.');
        }

        console.log('Migration step completed.');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

migrate();
