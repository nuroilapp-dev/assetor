const db = require('./config/db');

async function debug() {
    try {
        const [fields] = await db.execute('SELECT * FROM module_section_fields');
        console.log('Fields count:', fields.length);
        if (fields.length > 0) {
            console.log('First field:', JSON.stringify(fields[0]));
        }

        const [options] = await db.execute('SELECT * FROM module_section_field_options');
        console.log('Options count:', options.length);
    } catch (err) {
        console.error('Debug failed:', err.message);
    } finally {
        process.exit();
    }
}

debug();
