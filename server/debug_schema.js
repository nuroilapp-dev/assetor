const mysql = require('mysql2/promise');
require('dotenv').config();

async function run() {
    const pool = mysql.createPool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });

    try {
        const [rows] = await pool.execute('DESCRIBE office_premises');
        console.log("office_premises schema:");
        rows.forEach(r => {
            console.log(`${r.Field}: ${r.Type} (${r.Null})`);
        });

        const [rows2] = await pool.execute('DESCRIBE office_owned_details');
        console.log("\noffice_owned_details schema:");
        rows2.forEach(r => {
            console.log(`${r.Field}: ${r.Type} (${r.Null})`);
        });

        const [rows3] = await pool.execute('DESCRIBE office_rental_details');
        console.log("\noffice_rental_details schema:");
        rows3.forEach(r => {
            console.log(`${r.Field}: ${r.Type} (${r.Null})`);
        });
    } catch (e) {
        console.error(e);
    } finally {
        process.exit();
    }
}

run();
