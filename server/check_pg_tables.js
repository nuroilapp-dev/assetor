const { Client } = require('pg');
require('dotenv').config();

async function checkPGTables() {
    const client = new Client({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT || 5432,
    });

    try {
        await client.connect();
        const res = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
        `);
        console.log('PostgreSQL Tables:');
        res.rows.forEach(r => console.log(` - ${r.table_name}`));
    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
}

checkPGTables();
