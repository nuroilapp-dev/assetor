const db = require('./config/db');
async function run() {
    const [m] = await db.execute('SELECT id, name FROM modules');
    const [s] = await db.execute('SELECT id, name, module_id FROM module_sections');
    const [f] = await db.execute('SELECT id, label, section_id FROM module_section_fields');

    console.log('--- MODULES ---');
    m.forEach(x => console.log(`M ID: ${x.id} | Name: ${x.name}`));

    console.log('\n--- SECTIONS ---');
    s.forEach(x => console.log(`S ID: ${x.id} | Name: ${x.name} | M_ID: ${x.module_id}`));

    console.log('\n--- FIELDS ---');
    f.forEach(x => console.log(`F ID: ${x.id} | Label: ${x.label} | S_ID: ${x.section_id}`));

    process.exit();
}
run();
