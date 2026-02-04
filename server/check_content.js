const db = require('./config/db');
async function run() {
    const [rows] = await db.execute('SELECT * FROM module_master LIMIT 5');
    console.log('SUM:', rows.map(r => r.module_name));
    process.exit(0);
}
run();
