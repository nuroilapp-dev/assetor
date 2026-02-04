const db = require('../config/db');
async function run() {
    const [mm] = await db.execute('DESCRIBE module_master');
    console.log('--- module_master ---');
    mm.forEach(r => console.log(`${r.Field}: ${r.Type}`));

    const [cm] = await db.execute('DESCRIBE company_modules');
    console.log('\n--- company_modules ---');
    cm.forEach(r => console.log(`${r.Field}: ${r.Type}`));
    process.exit(0);
}
run();
