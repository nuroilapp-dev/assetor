const db = require('./config/db');

async function run() {
    try {
        console.log('Running migration to add section_area...');
        await db.execute('ALTER TABLE company_modules ADD COLUMN section_area VARCHAR(50) DEFAULT NULL AFTER premises_type');
        console.log('Success: section_area column added to company_modules');
        process.exit(0);
    } catch (error) {
        if (error.code === 'ER_DUP_COLUMN') {
            console.log('Note: section_area column already exists.');
            process.exit(0);
        }
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

run();
