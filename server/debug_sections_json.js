const db = require('./config/db');

async function debugModulesJSON() {
    try {
        const [modules] = await db.execute('SELECT module_id, module_name FROM module_master');
        console.log('--- MODULES ---');
        console.log(JSON.stringify(modules, null, 2));

        const [sections] = await db.execute('SELECT * FROM module_sections');
        console.log('--- SECTIONS ---');
        console.log(JSON.stringify(sections, null, 2));

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
debugModulesJSON();
