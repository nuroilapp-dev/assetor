const mysql = require('mysql2/promise');

async function getFullTableList() {
    // We'll check both just in case, but focusing on where the schema is
    const dbs = ['trakio_db', 'asset_db', 'erp_db']; // erp_db is a guess too

    for (const dbName of dbs) {
        let connection;
        try {
            connection = await mysql.createConnection({
                host: 'localhost',
                user: 'root',
                password: '',
                database: dbName
            });
            const [tables] = await connection.execute('SHOW TABLES');
            const names = tables.map(r => Object.values(r)[0]);
            if (names.includes('module_subhead_options')) {
                console.log(`DATABASE_MATCH: ${dbName}`);
                console.log('TABLES_START');
                names.forEach(n => console.log(n));
                console.log('TABLES_END');
            }
        } catch (e) {
            // ignore missing dbs
        } finally {
            if (connection) await connection.end();
        }
    }
}

getFullTableList();
