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
        console.log('Checking office_premises table...');
        const premisesRes = await pool.query('SELECT * FROM office_premises LIMIT 10');
        console.log(`Found ${premisesRes.rows.length} premises.`);
        if (premisesRes.rows.length > 0) {
            console.log(JSON.stringify(premisesRes.rows, null, 2));
        } else {
            console.log('No premises found in the database.');
        }

        console.log('\nChecking users to identify company IDs...');
        const usersRes = await pool.query('SELECT id, name, email, company_id, role FROM users LIMIT 10');
        console.log(JSON.stringify(usersRes.rows, null, 2));

        await pool.end();
    } catch (error) {
        console.error('Error:', error);
        await pool.end();
    }
})();
