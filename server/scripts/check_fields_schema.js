const db = require('../config/db');

async function checkSchema() {
    try {
        const [rows] = await db.execute('SHOW COLUMNS FROM module_section_fields');
        console.log(rows.map(r => r.Field));
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

checkSchema();
