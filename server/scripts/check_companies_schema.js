const db = require('../config/db');
async function run() {
    try {
        const [rows] = await db.execute(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'companies'
        `);
        console.log('Columns in companies table:');
        console.log(rows.map(r => r.column_name).sort().join('\n'));
        console.log('Count:', rows.length);
    } catch (e) {
        console.error(e);
    } finally {
        process.exit();
    }
}
run();
