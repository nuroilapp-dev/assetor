const db = require('./config/db');

async function checkFields() {
    try {
        console.log('--- All module_section_fields ---');
        const [fields] = await db.execute('SELECT * FROM module_section_fields');
        console.log(JSON.stringify(fields, null, 2));

        console.log('\n--- All module_section_field_options ---');
        const [options] = await db.execute('SELECT * FROM module_section_field_options');
        console.log(JSON.stringify(options, null, 2));

        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

checkFields();
