require('dotenv').config({ path: '../.env' });
const { Pool } = require('pg');

const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'software_db'
});

(async () => {
    try {
        const res = await pool.query('SELECT premise_id, company_id, premises_name FROM office_premises LIMIT 20');
        console.log('--- PREMISES LIST ---');
        console.table(res.rows); // Use console.table for cleaner output

        const userRes = await pool.query('SELECT id, name, email, company_id FROM users LIMIT 10');
        console.log('\n--- USERS LIST ---');
        console.table(userRes.rows);

        await pool.end();
    } catch (error) {
        console.error('Error:', error);
        await pool.end();
    }
})();
