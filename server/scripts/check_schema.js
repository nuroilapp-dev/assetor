const db = require('../config/db');
async function run() {
    try {
        const [rows] = await db.execute(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'clients'
        `);
        console.log(rows);
    } catch (e) {
        console.error(e);
    } finally {
        process.exit();
    }
}
run();
