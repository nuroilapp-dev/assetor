const db = require('../config/db');
async function run() {
    try {
        const tables = ['tenancy_types', 'premises_types', 'ownership_types'];
        for (const t of tables) {
            try {
                const [data] = await db.execute(`SELECT * FROM ${t}`);
                console.log(`\nTable ${t} data:`, data);
            } catch (e) {
                console.log(`\nTable ${t} not found or error.`);
            }
        }
    } catch (e) {
        console.error('Error:', e);
    } finally {
        process.exit();
    }
}
run();
