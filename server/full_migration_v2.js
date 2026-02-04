const mysql = require('mysql2/promise');
const { Client } = require('pg');
const fs = require('fs');
require('dotenv').config();

const TABLES = [
    "companies",
    "users",
    "countries",
    "property_types",
    "premises_types",
    "area",
    "modules_master",
    "modules",
    "module_master",
    "module_templates",
    "module_heads",
    "module_subheads",
    "module_subhead_options",
    "module_sections",
    "module_section_fields",
    "module_section_field_options",
    "company_modules",
    "company_module_field_selection",
    "departments",
    "employees",
    "asset_categories",
    "assets",
    "asset_assignments",
    "asset_requests",
    "maintenance_tickets",
    "audit_logs",
    "office_premises",
    "office_owned_details",
    "office_rental_details",
    "office_premises_documents",
    "office_premise_attachments",
    "office_premises_utilities",
    "premises_module_details"
];

async function migrate() {
    const mysqlConn = await mysql.createConnection({ host: 'localhost', user: 'root', password: '', database: 'software_db' });
    const pgClient = new Client({ host: 'localhost', user: 'postgres', database: 'software_db' });

    let errorLog = "";

    try {
        await pgClient.connect();
        await pgClient.query("SET session_replication_role = 'replica'");

        for (const table of TABLES) {
            console.log(`Migrating ${table}...`);
            const [rows] = await mysqlConn.execute(`SELECT * FROM \`${table}\``);
            if (rows.length === 0) continue;

            await pgClient.query(`TRUNCATE TABLE "${table}" CASCADE`);

            const columns = Object.keys(rows[0]);
            const pgColumns = columns.map(c => `"${c}"`).join(', ');

            for (const row of rows) {
                const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');
                const values = columns.map(col => row[col]);

                try {
                    await pgClient.query(`INSERT INTO "${table}" (${pgColumns}) VALUES (${placeholders})`, values);
                } catch (err) {
                    errorLog += `Error in ${table}: ${err.message}\nSQL: INSERT INTO "${table}" (${pgColumns})\nData: ${JSON.stringify(row)}\n\n`;
                }
            }

            try {
                const pkRes = await pgClient.query(`
                    SELECT a.attname
                    FROM   pg_index i
                    JOIN   pg_attribute a ON a.attrelid = i.indrelid
                                         AND a.attnum = ANY(i.indkey)
                    WHERE  i.indrelid = '"${table}"'::regclass
                    AND    i.indisprimary;
                `);
                if (pkRes.rows.length > 0) {
                    const pk = pkRes.rows[0].attname;
                    await pgClient.query(`SELECT setval(pg_get_serial_sequence('"${table}"', '${pk}'), coalesce(max("${pk}"), 1)) FROM "${table}"`);
                }
            } catch (e) { }
        }

        await pgClient.query("SET session_replication_role = 'origin'");
        fs.writeFileSync('migration_errors.txt', errorLog);
        console.log('Migration done. Errors saved to migration_errors.txt');
    } catch (err) {
        console.error(err);
    } finally {
        await mysqlConn.end();
        await pgClient.end();
    }
}
migrate();
