const mysql = require('mysql2/promise');

async function listAll() {
    const databases = ['trakio_db', 'asset_db'];

    for (const dbName of databases) {
        console.log(`\n--- Database: ${dbName} ---`);
        const connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '',
            database: dbName
        });

        try {
            const [tables] = await connection.execute('SHOW TABLES');
            const tableNames = tables.map(r => Object.values(r)[0]);
            console.log(`Tables in ${dbName}:`, JSON.stringify(tableNames, null, 2));

            for (const table of tableNames) {
                const [count] = await connection.execute(`SELECT COUNT(*) as count FROM \`${table}\``);
                console.log(`  - ${table}: ${count[0].count} rows`);
            }
        } catch (err) {
            console.error(`Error in ${dbName}:`, err.message);
        } finally {
            await connection.end();
        }
    }
}

listAll();
