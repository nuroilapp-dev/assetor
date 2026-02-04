const db = require('./config/db');

async function checkData() {
    try {
        console.log('--- All module_sections ---');
        const [sections] = await db.execute('SELECT * FROM module_sections');
        console.log(JSON.stringify(sections, null, 2));

        console.log('\n--- All module_subheads ---');
        const [subheads] = await db.execute('SELECT * FROM module_subheads');
        console.log(JSON.stringify(subheads, null, 2));

        console.log('\n--- All module_subhead_options ---');
        const [options] = await db.execute('SELECT * FROM module_subhead_options');
        console.log(JSON.stringify(options, null, 2));

        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

checkData();
