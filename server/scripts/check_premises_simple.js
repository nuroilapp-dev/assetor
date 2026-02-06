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
        console.log('PID, CID, NAME');
        res.rows.forEach(r => {
            console.log(`${r.premise_id}, ${r.company_id}, ${r.premises_name}`);
        });

        const userRes = await pool.query('SELECT id, email, company_id FROM users LIMIT 10');
        console.log('\n--- USERS ---');
        userRes.rows.forEach(u => {
            console.log(`UID: ${u.id}, Email: ${u.email}, CID: ${u.company_id}`);
        });

        await pool.end();
    } catch (error) {
        console.error('Error:', error);
        await pool.end();
    }
})();
