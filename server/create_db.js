const { Client } = require('pg');

async function setup() {
    const client = new Client({
        host: 'localhost',
        port: 5432,
        user: 'postgres',
        password: '',
        database: 'postgres'
    });
    try {
        await client.connect();
        console.log('Connected to postgres...');

        // Try to create software_db if it really is missing
        try {
            await client.query('CREATE DATABASE software_db');
            console.log('Created software_db');
        } catch (e) {
            console.log('software_db might already exist (Error: ' + e.message + ')');
        }
        await client.end();
    } catch (err) {
        console.error('Setup failed:', err.message);
    }
}

setup();
