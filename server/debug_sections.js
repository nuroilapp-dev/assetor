const db = require('./config/db');

async function debugModules() {
    try {
        const [modules] = await db.execute('SELECT module_id, module_name FROM module_master');
        console.log('--- MODULES ---');
        console.table(modules);

        const [sections] = await db.execute('SELECT * FROM module_sections');
        console.log('--- SECTIONS ---');
        console.table(sections);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
debugModules();
