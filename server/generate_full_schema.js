const { Client } = require('pg');
const fs = require('fs');
require('dotenv').config();

async function generateSchema() {
    const client = new Client({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT || 5432,
    });

    try {
        await client.connect();

        const tablesRes = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            ORDER BY table_name
        `);

        let schemaSql = "-- PostgreSQL Full Schema Export\n";
        schemaSql += "DROP SCHEMA IF EXISTS public CASCADE;\nCREATE SCHEMA public;\n\n";

        for (const row of tablesRes.rows) {
            const tableName = row.table_name;
            schemaSql += `-- Table: ${tableName}\n`;

            // Get columns
            const colRes = await client.query(`
                SELECT column_name, data_type, character_maximum_length, is_nullable, column_default
                FROM information_schema.columns 
                WHERE table_name = $1
                ORDER BY ordinal_position
            `, [tableName]);

            schemaSql += `CREATE TABLE "${tableName}" (\n`;
            const cols = colRes.rows.map(c => {
                let def = `  "${c.column_name}" ${c.data_type.toUpperCase()}`;
                if (c.character_maximum_length) def += `(${c.character_maximum_length})`;
                if (c.is_nullable === 'NO') def += " NOT NULL";
                if (c.column_default) def += ` DEFAULT ${c.column_default}`;
                return def;
            });

            // Add Primary Key info (simplified)
            try {
                const pkRes = await client.query(`
                    SELECT a.attname
                    FROM   pg_index i
                    JOIN   pg_attribute a ON a.attrelid = i.indrelid AND a.attnum = ANY(i.indkey)
                    WHERE  i.indrelid = '"${tableName}"'::regclass AND i.indisprimary
                `);
                if (pkRes.rows.length > 0) {
                    cols.push(`  PRIMARY KEY ("${pkRes.rows[0].attname}")`);
                }
            } catch (e) { }

            schemaSql += cols.join(",\n") + "\n);\n\n";
        }

        fs.writeFileSync('software_db_full_schema.sql', schemaSql);
        console.log('Schema saved to software_db_full_schema.sql');
    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
}

generateSchema();
