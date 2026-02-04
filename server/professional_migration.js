const mysql = require('mysql2/promise');
const { Client } = require('pg');
const fs = require('fs');
require('dotenv').config();

async function fullProfessionalMigration() {
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
        console.log('--- STARTING PROFESSIONAL MIGRATION ---');

        await pgClient.query('DROP SCHEMA IF EXISTS public CASCADE');
        await pgClient.query('CREATE SCHEMA public');
        await pgClient.query("SET session_replication_role = 'replica'");

        const [tables] = await mysqlConn.execute('SHOW TABLES');
        const tableNames = tables.map(t => Object.values(t)[0]);

        for (const table of tableNames) {
            console.log(`Table: ${table}`);
            const [cols] = await mysqlConn.execute(`SHOW FULL COLUMNS FROM \`${table}\``);

            let pgCols = [];
            let primaryKeyCols = [];

            for (const col of cols) {
                let type = col.Type.toLowerCase();
                let pgType = 'TEXT';
                if (type.includes('serial') || col.Extra.includes('auto_increment')) pgType = 'SERIAL';
                else if (type.includes('int(') || type === 'int') pgType = 'INTEGER';
                else if (type.includes('bigint')) pgType = 'BIGINT';
                else if (type.includes('tinyint(1)')) pgType = 'BOOLEAN';
                else if (type.includes('tinyint')) pgType = 'SMALLINT';
                else if (type.includes('decimal') || type.includes('numeric')) pgType = 'NUMERIC';
                else if (type.includes('float') || type.includes('double')) pgType = 'DOUBLE PRECISION';
                else if (type.includes('varchar')) {
                    const match = type.match(/\((\d+)\)/);
                    pgType = match ? `VARCHAR(${match[1]})` : 'VARCHAR(255)';
                } else if (type.includes('datetime') || type.includes('timestamp')) pgType = 'TIMESTAMP';
                else if (type.includes('date')) pgType = 'DATE';
                else if (type.includes('json')) pgType = 'JSONB';
                else if (type.includes('text')) pgType = 'TEXT';
                else if (type.includes('blob')) pgType = 'BYTEA';

                let colDef = `"${col.Field}" ${pgType}`;
                if (col.Null === 'NO' && pgType !== 'SERIAL') colDef += ' NOT NULL';
                if (col.Default !== null) {
                    if (col.Default === 'CURRENT_TIMESTAMP' || col.Default === 'current_timestamp()') {
                        colDef += ' DEFAULT CURRENT_TIMESTAMP';
                    } else if (typeof col.Default === 'string') {
                        if (col.Default.includes('0000-00-00')) { } // skip invalid mysql dates
                        else colDef += ` DEFAULT '${col.Default.replace(/'/g, "''")}'`;
                    } else {
                        colDef += ` DEFAULT ${col.Default}`;
                    }
                }
                pgCols.push(colDef);
                if (col.Key === 'PRI') primaryKeyCols.push(`"${col.Field}"`);
            }

            let createSql = `CREATE TABLE "${table}" (\n  ${pgCols.join(',\n  ')}`;
            if (primaryKeyCols.length > 0) createSql += `,\n  PRIMARY KEY (${primaryKeyCols.join(', ')})`;
            createSql += '\n)';

            await pgClient.query(createSql);

            const [rows] = await mysqlConn.execute(`SELECT * FROM \`${table}\``);
            if (rows.length > 0) {
                const colNames = Object.keys(rows[0]).map(c => `"${c}"`).join(', ');
                for (const row of rows) {
                    const values = Object.values(row).map(val => {
                        if (val instanceof Date) return isNaN(val.getTime()) ? null : val.toISOString();
                        if (typeof val === 'string' && val.includes('0000-00-00')) return null;
                        if (typeof val === 'object' && val !== null) return JSON.stringify(val);
                        return val;
                    });
                    const placeholders = Object.keys(row).map((_, i) => `$${i + 1}`).join(', ');
                    try {
                        await pgClient.query(`INSERT INTO "${table}" (${colNames}) VALUES (${placeholders})`, values);
                    } catch (e) {
                        console.error(`    Row Error: ${e.message}`);
                    }
                }
            }
            console.log(`  Done: ${rows.length} rows.`);
        }

        console.log('Applying Indexes...');
        const mysqlIndexes = JSON.parse(fs.readFileSync('mysql_indexes.json', 'utf8'));
        const groupedIndexes = {};
        for (const idx of mysqlIndexes) {
            const key = `${idx.TABLE_NAME}.${idx.INDEX_NAME}`;
            if (!groupedIndexes[key]) groupedIndexes[key] = { table: idx.TABLE_NAME, name: idx.INDEX_NAME, unique: idx.NON_UNIQUE === 0, columns: [] };
            groupedIndexes[key].columns[idx.SEQ_IN_INDEX - 1] = `"${idx.COLUMN_NAME}"`;
        }
        for (const key in groupedIndexes) {
            const idx = groupedIndexes[key];
            try {
                await pgClient.query(`CREATE ${idx.unique ? 'UNIQUE ' : ''}INDEX "${idx.name}" ON "${idx.table}" (${idx.columns.join(', ')})`);
            } catch (e) { }
        }

        console.log('Applying Foreign Keys...');
        const mysqlConstraints = JSON.parse(fs.readFileSync('mysql_constraints.json', 'utf8'));
        for (const fk of mysqlConstraints) {
            try {
                await pgClient.query(`ALTER TABLE "${fk.TABLE_NAME}" ADD CONSTRAINT "${fk.CONSTRAINT_NAME}" FOREIGN KEY ("${fk.COLUMN_NAME}") REFERENCES "${fk.REFERENCED_TABLE_NAME}" ("${fk.REFERENCED_COLUMN_NAME}") ON DELETE CASCADE`);
            } catch (e) { }
        }

        console.log('Fixing Sequences...');
        for (const table of tableNames) {
            const [cols] = await mysqlConn.execute(`SHOW COLUMNS FROM \`${table}\``);
            const autoCol = cols.find(c => c.Extra.includes('auto_increment'));
            if (autoCol) {
                try {
                    const seqRes = await pgClient.query(`SELECT pg_get_serial_sequence('"${table}"', '${autoCol.Field}') as seq`);
                    if (seqRes.rows[0].seq) {
                        await pgClient.query(`SELECT setval('${seqRes.rows[0].seq}', COALESCE((SELECT MAX("${autoCol.Field}") FROM "${table}"), 1))`);
                    }
                } catch (e) { }
            }
        }

        await pgClient.query("SET session_replication_role = 'origin'");
        console.log('--- PROFESSIONAL MIGRATION COMPLETED ---');
    } catch (err) {
        console.error('FAILED:', err);
    } finally {
        mysqlConn.end();
        pgClient.end();
    }
}
fullProfessionalMigration();
