const db = require('./server/config/db');

async function checkData() {
    try {
        const [modules] = await db.execute('SELECT module_id, module_name FROM module_master');
        console.log('Modules:', JSON.stringify(modules, null, 2));

        const [sections] = await db.execute('SELECT * FROM module_sections');
        console.log('Sections:', JSON.stringify(sections, null, 2));

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkData();
