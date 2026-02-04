const mysql = require('mysql2/promise');

async function checkSchema() {
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'trakio_db'
    });

    try {
        const [tables] = await connection.execute('SHOW TABLES');
        console.log('Tables:', tables);

        const [cols] = await connection.execute('DESCRIBE company_modules');
        console.log('company_modules columns:', cols);

        const [data] = await connection.execute('SELECT * FROM company_modules');
        console.log('company_modules data:', data);

    } catch (err) {
        console.error(err);
    } finally {
        await connection.end();
    }
}

checkSchema();
