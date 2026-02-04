const { Client } = require('pg');

async function check() {
    const client = new Client({
        host: 'localhost',
        port: 5432,
        user: 'postgres',
        password: '',
        database: 'software_db'
    });
    try {
        await client.connect();
        const res = await client.query('SELECT count(*) FROM users');
        console.log('USER_COUNT:', res.rows[0].count);

        const rows = await client.query('SELECT email FROM users');
        console.log('EMAILS_IN_DB:', rows.rows.map(r => r.email));

        await client.end();
    } catch (err) {
        console.error(err.message);
    }
}
check();
