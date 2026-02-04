const mysql = require('mysql2/promise');

async function checkMySQLData() {
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'trakio_db'
    });

    try {
        const tablesToMigrate = [
            'module_master',
            'module_templates',
            'module_heads',
            'module_subheads',
            'module_subhead_options'
        ];

        for (const table of tablesToMigrate) {
            const [rows] = await connection.execute(`SELECT COUNT(*) as count FROM ${table}`);
            console.log(`Table ${table} count in MySQL: ${rows[0].count}`);
        }

    } catch (err) {
        console.error('Error checking MySQL data:', err.message);
    } finally {
        await connection.end();
    }
}

checkMySQLData();
