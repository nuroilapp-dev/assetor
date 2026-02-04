const mysql = require('mysql2/promise');

async function checkMaster() {
    const dbs = ['software_db', 'trakio_db', 'asset_db'];
    for (const db of dbs) {
        let conn;
        try {
            conn = await mysql.createConnection({ host: 'localhost', user: 'root', database: db });
            const [r] = await conn.execute('SELECT COUNT(*) as count FROM module_master');
            console.log(`${db}.module_master: ${r[0].count} rows`);
        } catch (e) {
            console.log(`${db}.module_master: table not found`);
        } finally {
            if (conn) await conn.end();
        }
    }
}
checkMaster();
