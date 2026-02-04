const db = require('./config/db');

async function migrate() {
    try {
        console.log('Adding area_id and company_module_id to office_premises...');

        await db.execute(`
            ALTER TABLE office_premises 
            ADD COLUMN area_id INT NULL AFTER country,
            ADD COLUMN company_module_id INT NULL AFTER area_id;
        `);

        console.log('Migration successful!');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

migrate();
