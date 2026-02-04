const mysql = require('mysql2/promise');
const { Client } = require('pg');
require('dotenv').config();

async function syncSchema() {
    const mysqlConn = await mysql.createConnection({ host: 'localhost', user: 'root', database: 'software_db' });
    const pgClient = new Client({ host: 'localhost', user: 'postgres', database: 'software_db' });
    await pgClient.connect();

    try {
        const [mysqlTables] = await mysqlConn.execute('SHOW TABLES');
        const tableNames = mysqlTables.map(r => Object.values(r)[0]);

        for (const table of tableNames) {
            console.log(`Checking schema for table: ${table}`);

            // Get MySQL Columns
            const [mCols] = await mysqlConn.execute(`DESCRIBE \`${table}\``);

            // Get PG Columns
            const pRes = await pgClient.query(`
                SELECT column_name, data_type 
                FROM information_schema.columns 
                WHERE table_name = $1
            `, [table]);
            const pColNames = pRes.rows.map(r => r.column_name);

            for (const mCol of mCols) {
                if (!pColNames.includes(mCol.Field.toLowerCase())) {
                    console.log(`  Adding column ${mCol.Field} to PG table ${table}...`);

                    let pgType = 'TEXT';
                    let mType = mCol.Type.toLowerCase();

                    if (mType.includes('int')) pgType = 'INT';
                    else if (mType.includes('decimal')) pgType = 'DECIMAL(15,2)';
                    else if (mType.includes('varchar')) pgType = 'VARCHAR(255)';
                    else if (mType.includes('text')) pgType = 'TEXT';
                    else if (mType.includes('timestamp') || mType.includes('datetime')) pgType = 'TIMESTAMP';
                    else if (mType.includes('date')) pgType = 'DATE';
                    else if (mType.includes('tinyint')) pgType = 'SMALLINT';

                    const alterSql = `ALTER TABLE "${table}" ADD COLUMN "${mCol.Field}" ${pgType}`;
                    try {
                        await pgClient.query(alterSql);
                        console.log(`    Successfully added ${mCol.Field}`);
                    } catch (e) {
                        console.error(`    Failed to add ${mCol.Field}: ${e.message}`);
                    }
                }
            }
        }
        console.log('Schema sync complete.');
    } catch (err) {
        console.error(err);
    } finally {
        await mysqlConn.end();
        await pgClient.end();
    }
}

syncSchema();
