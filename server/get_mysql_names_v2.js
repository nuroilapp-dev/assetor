const mysql = require('mysql2/promise');
const fs = require('fs');

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
        fs.writeFileSync('mysql_tables.json', JSON.stringify(names, null, 2));
        console.log('Saved to mysql_tables.json');
    } catch (err) {
        console.error(err);
    } finally {
        await connection.end();
    }
}

getPreciseList();
