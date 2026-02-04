const db = require('./config/db');
const fs = require('fs');
async function run() {
    try {
        const [rows] = await db.execute('SHOW CREATE TABLE company_modules');
        fs.writeFileSync('table_schema.txt', rows[0]['Create Table']);
        console.log('Schema saved to table_schema.txt');
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
run();
