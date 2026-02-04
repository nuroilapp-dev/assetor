const db = require('./config/db');
async function check() {
    try {
        const [rows] = await db.execute("SHOW TABLES LIKE 'company_module%'");
        console.log('Existing configuration tables:', rows);
    } catch (e) {
        console.error(e);
    }
    process.exit(0);
}
check();
