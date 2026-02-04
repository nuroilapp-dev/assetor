const { Client } = require('pg');
require('dotenv').config();

async function verifyData() {
    const client = new Client({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT || 5432,
    });

    try {
        await client.connect();

        const tables = ['module_subhead_options', 'module_subheads', 'module_heads', 'module_templates', 'module_master'];

        for (const table of tables) {
            const res = await client.query(`SELECT COUNT(*) FROM "${table}"`);
            console.log(`Table ${table} count in PG: ${res.rows[0].count}`);

            if (res.rows[0].count > 0) {
                const sample = await client.query(`SELECT * FROM "${table}" LIMIT 2`);
                console.log(`Sample from ${table}:`, JSON.stringify(sample.rows, null, 2));
            }
        }

    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
}

verifyData();
