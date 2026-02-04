const db = require('../config/db');

async function checkDetails() {
    try {
        const [rows] = await db.execute('SELECT * FROM premises_module_details');
        console.log('Total rows:', rows.length);
        console.log(rows);
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

checkDetails();
