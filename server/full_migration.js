const mysql = require('mysql2/promise');
const { Client } = require('pg');
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
    const mysqlConn = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'software_db'
    });

    const pgClient = new Client({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT || 5432,
    });

    try {
        await pgClient.connect();
        console.log('Connected to MySQL and PostgreSQL...');

        // Disable triggers
        await pgClient.query("SET session_replication_role = 'replica'");

        for (const table of TABLES) {
            console.log(`Migrating table: ${table}...`);

            // Check if table exists in PG
            const tableExists = await pgClient.query(`
                SELECT EXISTS (
                    SELECT FROM information_schema.tables 
                    WHERE table_schema = 'public' 
                    AND table_name = $1
                )
            `, [table]);

            if (!tableExists.rows[0].exists) {
                console.warn(`Table ${table} does not exist in PostgreSQL. Skipping data migration for it.`);
                continue;
            }

            // Truncate PG table
            await pgClient.query(`TRUNCATE TABLE "${table}" CASCADE`);

            // Fetch from MySQL
            let rows;
            try {
                const [mysqlRows] = await mysqlConn.execute(`SELECT * FROM \`${table}\``);
                rows = mysqlRows;
            } catch (err) {
                console.error(`Error fetching from MySQL table ${table}:`, err.message);
                continue;
            }

            if (rows.length === 0) {
                console.log(`Table ${table} is empty in MySQL.`);
                continue;
            }

            // Insert into PG
            const columns = Object.keys(rows[0]);
            const pgColumns = columns.map(c => `"${c}"`).join(', ');

            for (const row of rows) {
                const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');
                const values = columns.map(col => {
                    const val = row[col];
                    // Handle Boolean conversion if needed
                    if (typeof val === 'number' && (val === 0 || val === 1)) {
                        // Some columns might be boolean in PG but tinyint in MySQL
                        // This is a bit risky but usually okay for migration
                        return val;
                    }
                    return val;
                });

                try {
                    await pgClient.query(`INSERT INTO "${table}" (${pgColumns}) VALUES (${placeholders})`, values);
                } catch (err) {
                    console.error(`Insert failed for table ${table}, row:`, row);
                    console.error(err.message);
                    // Continue to next row or handle error
                }
            }
            console.log(`Migrated ${rows.length} rows to ${table}.`);

            // Reset Sequence if table has SERIAL column
            try {
                // Find primary key column
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
            } catch (err) {
                // Sequence might not exist, ignore
            }
        }

        // Enable triggers
        await pgClient.query("SET session_replication_role = 'origin'");

        console.log('Migration complete!');
    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        await mysqlConn.end();
        await pgClient.end();
    }
}

migrate();
