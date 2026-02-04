const db = require('./config/db');
async function run() {
    const [f] = await db.execute('SELECT * FROM module_section_fields');
    f.forEach(x => {
        console.log(`F ID: ${x.id} | Label: ${x.label} | S_ID: ${x.section_id} | M_ID: ${x.module_id} | C_ID: ${x.company_id}`);
    });
    process.exit();
}
run();
