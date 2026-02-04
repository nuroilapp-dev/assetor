const { Client } = require('pg');

async function debug() {
    const client = new Client({
        host: 'localhost',
        port: 5432,
        user: 'postgres',
        password: '',
        database: 'software_db'
    });
    try {
        await client.connect();
        console.log('--- DB DEBUG START ---');

        const companies = await client.query('SELECT * FROM companies');
        console.log(`Companies count: ${companies.rowCount}`);
        console.log('Companies:', companies.rows);

        const users = await client.query('SELECT id, email, company_id, password FROM users');
        console.log(`Users count: ${users.rowCount}`);
        console.log('Users:', users.rows);

        const modules = await client.query('SELECT * FROM module_master');
        console.log(`Module Master count: ${modules.rowCount}`);

        console.log('--- DB DEBUG END ---');
        await client.end();
    } catch (err) {
        console.error('Debug script failed:', err.message);
    }
}

debug();
