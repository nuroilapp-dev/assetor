const db = require('./config/db');

async function fix() {
    try {
        console.log('Attempting to drop the actual unique key: company_id');
        // This is the UNIQUE index that's causing the trouble
        await db.execute('ALTER TABLE company_modules DROP INDEX company_id');
        console.log('Successfully dropped UNIQUE index company_id');

        process.exit(0);
    } catch (e) {
        console.error('Error dropping unique index:', e.message);
        process.exit(1);
    }
}
fix();
