const db = require('../config/db');
async function run() {
    try {
        const [rows] = await db.execute("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
        const tables = rows.map(r => r.table_name || r.TABLE_NAME);
        for (const t of tables) {
            try {
                const [data] = await db.execute(`SELECT * FROM ${t} LIMIT 5`);
                if (data.some(row => row.name === 'Owned' || row.name === 'Rental' || row.name === 'Owned ' || row.name === 'Rental ')) {
                    console.log('--- FOUND TABLE:', t, '---');
                    console.log(data);
                }
            } catch (e) { }
        }
    } catch (e) {
        console.error('Error:', e);
    } finally {
        process.exit();
    }
}
run();
