const mysql = require('mysql2/promise');
const { Client } = require('pg');
const fs = require('fs');
require('dotenv').config();

async function checkStructure() {
    const mysqlConn = await mysql.createConnection({ host: 'localhost', user: 'root', database: 'software_db' });
    const pgClient = new Client({ host: 'localhost', user: 'postgres', database: 'software_db' });
    await pgClient.connect();

    const tables = ['office_premises', 'modules', 'company_module_field_selection', 'office_owned_details'];
    let out = "";

    for (const table of tables) {
        out += `\n--- Table: ${table} ---\n`;
        try {
            const [mCols] = await mysqlConn.execute(`DESCRIBE \`${table}\``);
            out += 'MySQL Columns: ' + mCols.map(c => c.Field).sort().join(', ') + '\n';

            const pRes = await pgClient.query(`
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = $1
                ORDER BY column_name
            `, [table]);
            out += 'PG Columns:    ' + pRes.rows.map(r => r.column_name).sort().join(', ') + '\n';
        } catch (e) {
            out += `Error checking ${table}: ${e.message}\n`;
        }
    }
    fs.writeFileSync('struct_diff.txt', out);
    console.log('Saved to struct_diff.txt');

    await mysqlConn.end();
    await pgClient.end();
}
checkStructure();
