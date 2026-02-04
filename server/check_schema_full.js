const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkSchema() {
    const pool = mysql.createPool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });

    const tables = ['office_premises', 'office_owned_details', 'office_rental_details'];
    for (const table of tables) {
        console.log(`\n--- ${table} ---`);
        const [rows] = await pool.execute(`DESCRIBE ${table}`);
        rows.forEach(r => console.log(`  ${r.Field}`));
    }
    process.exit();
}

checkSchema();
