const mysql = require('mysql2/promise');
const { Client } = require('pg');
const fs = require('fs');
require('dotenv').config();

async function compareCounts() {
    const mysqlConn = await mysql.createConnection({ host: 'localhost', user: 'root', database: 'software_db' });
    const pgClient = new Client({ host: 'localhost', user: 'postgres', database: 'software_db' });
    await pgClient.connect();

    let output = "Table | MySQL | PG | Match?\n---|---|---|---\n";

    try {
        const [mysqlTables] = await mysqlConn.execute('SHOW TABLES');
        const names = mysqlTables.map(r => Object.values(r)[0]);

        for (const table of names) {
            const [mCount] = await mysqlConn.execute(`SELECT COUNT(*) as count FROM \`${table}\``);

            let pCount = 'N/A';
            let match = 'Table Missing';
            try {
                const res = await pgClient.query(`SELECT COUNT(*) FROM "${table}"`);
                pCount = res.rows[0].count;
                match = (String(mCount[0].count) === String(pCount)) ? 'YES' : 'NO';
            } catch (e) { }

            output += `${table} | ${mCount[0].count} | ${pCount} | ${match}\n`;
        }
        fs.writeFileSync('comparison.md', output);
        console.log('Saved to comparison.md');
    } catch (err) {
        console.error(err);
    } finally {
        await mysqlConn.end();
        await pgClient.end();
    }
}
compareCounts();
