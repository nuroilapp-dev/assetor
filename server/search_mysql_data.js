const mysql = require('mysql2/promise');

async function searchData() {
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: ''
    });

    try {
        const [dbs] = await connection.execute('SHOW DATABASES');
        for (const dbRow of dbs) {
            const dbName = dbRow.Database;
            if (['information_schema', 'mysql', 'performance_schema', 'sys', 'phpmyadmin'].includes(dbName)) continue;

            try {
                const [result] = await connection.execute(`SELECT COUNT(*) as count FROM \`${dbName}\`.module_subhead_options`);
                if (result[0].count > 0) {
                    console.log(`DATA FOUND! Database: ${dbName}, Table: module_subhead_options, Count: ${result[0].count}`);
                }
            } catch (e) {
                // Table doesn't exist in this DB
            }
        }
    } catch (err) {
        console.error(err);
    } finally {
        await connection.end();
    }
}

searchData();
