const mysql = require('mysql2/promise');
const fs = require('fs');

async function checkSchema() {
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'software_db'
    });

    try {
        const [tables] = await connection.execute('SHOW TABLES');
        const [cols] = await connection.execute('DESCRIBE company_modules');
        const [data] = await connection.execute('SELECT * FROM company_modules');

        const result = { tables, columns: cols, data };
        fs.writeFileSync('db_info_v3.json', JSON.stringify(result, null, 2));
        console.log('Results written to db_info_v3.json');

    } catch (err) {
        console.error(err);
    } finally {
        await connection.end();
    }
}

checkSchema();
