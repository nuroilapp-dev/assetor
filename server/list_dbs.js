const { Client } = require('pg');

async function test() {
    const client = new Client({
        host: 'localhost',
        port: 5432,
        user: 'postgres',
        password: '',
        database: 'postgres' // Try the default DB
    });
    try {
        await client.connect();
        console.log('Connected to "postgres" database successfully!');
        const res = await client.query('SELECT datname FROM pg_database');
        console.log('Databases available:', res.rows.map(r => r.datname));
        await client.end();
    } catch (err) {
        console.error('Connection failed:', err.message);
    }
}

test();
