const mysql = require('mysql2/promise');

async function checkTrakio() {
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'trakio_db'
    });

    try {
        const [tables] = await connection.execute('SHOW TABLES');
        for (const tRow of tables) {
            const table = Object.values(tRow)[0];
            const [count] = await connection.execute(`SELECT COUNT(*) as count FROM \`${table}\``);
            if (count[0].count > 0) {
                console.log(`trakio_db.${table}: ${count[0].count} rows`);
            }
        }
    } catch (err) {
        console.error(err);
    } finally {
        await connection.end();
    }
}

checkTrakio();
