const db = require('../config/db');
async function run() {
    try {
        const [rows] = await db.execute("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
        const tables = rows.map(r => r.table_name || r.TABLE_NAME);
        console.log('Available Tables:', tables.join(', '));

        for (const table of tables) {
            if (table.includes('type')) {
                const [data] = await db.execute(`SELECT * FROM ${table}`);
                console.log(`\nData for ${table}:`);
                console.log(data);
            }
        }
    } catch (e) {
        console.error('Error:', e);
    } finally {
        process.exit();
    }
}
run();
