const db = require('./config/db');

async function checkSchema() {
    try {
        console.log('--- module_sections ---');
        try {
            const [cols1] = await db.execute('SHOW COLUMNS FROM module_sections');
            console.log(JSON.stringify(cols1, null, 2));
            const [rows1] = await db.execute('SELECT * FROM module_sections LIMIT 5');
            console.log('Rows:', JSON.stringify(rows1, null, 2));
        } catch (e) { console.log('module_sections not found'); }

        console.log('\n--- module_subheads ---');
        try {
            const [cols2] = await db.execute('SHOW COLUMNS FROM module_subheads');
            console.log(JSON.stringify(cols2, null, 2));
            const [rows2] = await db.execute('SELECT * FROM module_subheads LIMIT 5');
            console.log('Rows:', JSON.stringify(rows2, null, 2));
        } catch (e) { console.log('module_subheads not found'); }

        console.log('\n--- module_subhead_options ---');
        try {
            const [cols3] = await db.execute('SHOW COLUMNS FROM module_subhead_options');
            console.log(JSON.stringify(cols3, null, 2));
            const [rows3] = await db.execute('SELECT * FROM module_subhead_options LIMIT 5');
            console.log('Rows:', JSON.stringify(rows3, null, 2));
        } catch (e) { console.log('module_subhead_options not found'); }

        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

checkSchema();
