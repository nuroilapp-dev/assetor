const mysql = require('mysql2/promise');

async function getPreciseList() {
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'software_db'
    });

    try {
        const [tables] = await connection.execute('SHOW TABLES');
        const names = tables.map(r => Object.values(r)[0]);
        console.log(JSON.stringify(names));
    } catch (err) {
        console.error(err);
    } finally {
        await connection.end();
    }
}

getPreciseList();
