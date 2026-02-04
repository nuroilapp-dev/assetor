const mysql = require('mysql2/promise');
require('dotenv').config();
const fs = require('fs');

async function run() {
    const pool = mysql.createPool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });

    try {
        const [rows] = await pool.execute('DESCRIBE office_premises');
        const [rows2] = await pool.execute('DESCRIBE office_owned_details');
        const [rows3] = await pool.execute('DESCRIBE office_rental_details');

        const schema = {
            office_premises: rows,
            office_owned_details: rows2,
            office_rental_details: rows3
        };

        fs.writeFileSync('schema_dump.json', JSON.stringify(schema, null, 2));
        console.log("Schema dumped to schema_dump.json");
    } catch (e) {
        console.error(e);
    } finally {
        process.exit();
    }
}

run();
