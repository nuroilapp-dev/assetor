const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function runFullSchema() {
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

        const schema = fs.readFileSync(path.join(__dirname, '../../db/postgresql_full.sql'), 'utf8');

        // We'll try to execute the whole thing. If it fails due to size, we might need a better parser.
        // But for most local setups this works fine.
        await client.query(schema);
        console.log('Full Schema & Seed executed successfully!');

        await client.end();
        process.exit(0);
    } catch (err) {
        console.error('Execution failed:', err.message);
        console.error(err);
        process.exit(1);
    }
}

runFullSchema();
