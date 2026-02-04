const db = require('./config/db');
async function run() {
    const [mm] = await db.execute('SELECT * FROM module_master');
    const [m] = await db.execute('SELECT * FROM modules');

    console.log('--- MODULE MASTER ---');
    mm.forEach(x => console.log(`MM ID: ${x.module_id} | Name: ${x.module_name}`));

    console.log('\n--- COMPANY MODULES ---');
    m.forEach(x => console.log(`M ID: ${x.id} | Name: ${x.name} | MasterID: ${x.module_id}`));

    process.exit();
}
run();
