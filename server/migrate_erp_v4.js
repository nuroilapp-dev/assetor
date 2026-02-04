const db = require('./config/db');

async function migrate() {
    try {
        console.log('Adding description column to module_templates...');

        // Check if description column exists
        const [columns] = await db.execute("SHOW COLUMNS FROM module_templates LIKE 'description'");

        if (columns.length === 0) {
            await db.execute("ALTER TABLE module_templates ADD COLUMN description TEXT AFTER template_name");
            console.log('Added description column.');
        } else {
            console.log('Description column already exists.');
        }

        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

migrate();
