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
        console.log("Checking all premises in DB:");
        const [all] = await pool.execute('SELECT premise_id, company_id, premises_name FROM office_premises');
        console.log(JSON.stringify(all, null, 2));

        console.log("\nChecking users:");
        const [users] = await pool.execute('SELECT id, email, company_id, role FROM users');
        console.log(JSON.stringify(users, null, 2));
    } catch (e) {
        console.error(e);
    } finally {
        process.exit();
    }
}

run();
