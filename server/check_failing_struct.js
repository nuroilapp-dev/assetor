const mysql = require('mysql2/promise');
const { Client } = require('pg');
require('dotenv').config();

async function checkStructure() {
    const mysqlConn = await mysql.createConnection({ host: 'localhost', user: 'root', database: 'software_db' });
    const pgClient = new Client({ host: 'localhost', user: 'postgres', database: 'software_db' });
    await pgClient.connect();

    const tables = ['office_premises', 'modules', 'company_module_field_selection', 'office_owned_details'];

    for (const table of tables) {
        console.log(`\n--- Table: ${table} ---`);
        try {
            const [mCols] = await mysqlConn.execute(`DESCRIBE \`${table}\``);
            console.log('MySQL Columns:', mCols.map(c => c.Field).join(', '));

            const pRes = await pgClient.query(`
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = $1
            `, [table]);
            console.log('PG Columns:', pRes.rows.map(r => r.column_name).join(', '));
        } catch (e) {
            console.error(`Error checking ${table}:`, e.message);
        }
    }

    await mysqlConn.end();
    await pgClient.end();
}
checkStructure();
