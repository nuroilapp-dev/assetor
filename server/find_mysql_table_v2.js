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
                    console.log(`--- DB FOUND: ${dbName} ---`);
                    tableNames.sort().forEach(t => console.log(`  ${t}`));
                    return; // Stop after finding the first one that has it
                }
            } catch (e) {
                // console.log(`Error checking ${dbName}: ${e.message}`);
            }
        }
        console.log('Finished search. No DB with module_subhead_options found.');
    } catch (err) {
        console.error(err);
    } finally {
        await connection.end();
    }
}

findTable();
