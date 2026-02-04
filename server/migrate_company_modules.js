const db = require('./config/db');

async function fixSchema() {
    try {
        console.log('Adding created_at to company_modules if missing...');
        await db.execute(`
            ALTER TABLE company_modules 
            ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        `).catch(err => console.log('created_at might already exist or error:', err.message));

        console.log('Ensuring unique index on company_id, module_id...');
        // Drop old index if it's not unique or named differently, then add unique one
        try {
            await db.execute('ALTER TABLE company_modules DROP INDEX company_id');
        } catch (e) { }

        await db.execute(`
            ALTER TABLE company_modules 
            ADD UNIQUE INDEX idx_company_module (company_id, module_id)
        `).catch(err => console.log('Unique index might already exist:', err.message));

        console.log('Database schema fixed.');
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
}

fixSchema();
