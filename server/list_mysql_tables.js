const mysql = require('mysql2/promise');

async function listTables() {
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'trakio_db'
    });

    try {
        const [rows] = await connection.execute('SHOW TABLES');
        console.log('Tables in trakio_db:', rows);
    } catch (err) {
        console.error('Error listing tables:', err.message);
    } finally {
        await connection.end();
    }
}

listTables();
