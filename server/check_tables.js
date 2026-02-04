const db = require('./config/db');
async function check() {
    try {
        const [r1] = await db.execute("DESCRIBE module_master");
        console.log('module_master:', r1.map(c => c.Field).join(','));
        const [r2] = await db.execute("DESCRIBE modules_master");
        console.log('modules_master:', r2.map(c => c.Field).join(','));
    } catch (e) { console.error(e); }
    process.exit(0);
}
check();
