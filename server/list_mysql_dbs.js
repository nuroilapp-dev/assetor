const mysql = require('mysql2/promise');

async function listDatabases() {
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: ''
    });

    try {
        const [rows] = await connection.execute('SHOW DATABASES');
        console.log('Databases in MySQL:', rows);
    } catch (err) {
        console.error('Error listing databases:', err.message);
    } finally {
        await connection.end();
    }
}

listDatabases();
