const mysql = require('mysql2/promise');

async function findTable() {
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
                const [tables] = await connection.execute(`SHOW TABLES FROM \`${dbName}\``);
                const tableNames = tables.map(r => Object.values(r)[0]);
                if (tableNames.includes('module_subhead_options')) {
                    console.log(`FOUND IT! Table 'module_subhead_options' is in database: ${dbName}`);

                    // List all tables in this DB to see the full set
                    console.log(`All tables in ${dbName}:`, tableNames);
                }
            } catch (e) { }
        }
    } catch (err) {
        console.error(err);
    } finally {
        await connection.end();
    }
}

findTable();
