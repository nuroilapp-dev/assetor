const db = require('../config/db');
async function run() {
    try {
        const [rows] = await db.execute('SELECT * FROM property_types');
        console.log('property_types:', rows);
    } catch (e) { console.error(e); } finally { process.exit(); }
}
run();
