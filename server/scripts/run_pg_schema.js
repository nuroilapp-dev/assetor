const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function runSchema() {
    const client = new Client({
        host: 'localhost',
        port: 5432,
        user: 'postgres',
        password: '',
        database: 'software_db'
    });
    try {
        await client.connect();
        console.log('Connected to software_db...');

        const schema = fs.readFileSync(path.join(__dirname, '../../db/postgresql_schema.sql'), 'utf8');
        // Standard Postgres doesn't like huge blocks with everything, so we split by semicolon
        // But functions have semicolons inside. For now, try running the whole thing.
        await client.query(schema);
        console.log('Schema executed successfully!');

        await client.end();
    } catch (err) {
        console.error('Schema execution failed:', err.message);
        console.error(err);
    }
}

runSchema();
