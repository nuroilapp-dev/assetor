const db = require('./config/db');
const fs = require('fs');
async function run() {
    const [rows] = await db.execute('DESCRIBE modules_master');
    fs.writeFileSync('cols_plural.txt', JSON.stringify(rows.map(r => r.Field)));
    process.exit(0);
}
run();
