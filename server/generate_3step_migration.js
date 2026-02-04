const mysql = require('mysql2/promise');
const fs = require('fs');
require('dotenv').config();

async function generate3StepMigration() {
    const mysqlConn = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'software_db'
    });

    try {
        const [tables] = await mysqlConn.execute('SHOW TABLES');
        const tableNames = tables.map(t => Object.values(t)[0]);

        let schemaTablesSql = "-- STEP 1: CREATE TABLES\nDROP SCHEMA IF EXISTS public CASCADE;\nCREATE SCHEMA public;\n\n";
        let dataSql = "-- STEP 2: LOAD DATA\nSET session_replication_role = 'replica';\n\n";
        let constraintsSql = "-- STEP 3: ADD CONSTRAINTS & INDEXES\n";

        for (const table of tableNames) {
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

                let colDef = `  "${col.Field}" ${pgType}`;
                if (col.Null === 'NO' && pgType !== 'SERIAL') colDef += ' NOT NULL';
                if (col.Default !== null) {
                    if (col.Default === 'CURRENT_TIMESTAMP' || col.Default === 'current_timestamp()') {
                        colDef += ' DEFAULT CURRENT_TIMESTAMP';
                    } else if (typeof col.Default === 'string') {
                        if (!col.Default.includes('0000-00-00')) {
                            colDef += ` DEFAULT '${col.Default.replace(/'/g, "''")}'`;
                        }
                    } else {
                        colDef += ` DEFAULT ${col.Default}`;
                    }
                }
                pgCols.push(colDef);
                if (col.Key === 'PRI') primaryKeyCols.push(`"${col.Field}"`);
            }

            schemaTablesSql += `CREATE TABLE "${table}" (\n${pgCols.join(',\n')}`;
            if (primaryKeyCols.length > 0) schemaTablesSql += `,\n  PRIMARY KEY (${primaryKeyCols.join(', ')})`;
            schemaTablesSql += '\n);\n\n';

            // Generate Data
            const [rows] = await mysqlConn.execute(`SELECT * FROM \`${table}\``);
            if (rows.length > 0) {
                dataSql += `-- Data for ${table}\n`;
                const colNames = Object.keys(rows[0]).map(c => `"${c}"`).join(', ');
                for (const row of rows) {
                    const values = Object.values(row).map(val => {
                        if (val === null) return 'NULL';
                        if (typeof val === 'boolean') return val ? 'TRUE' : 'FALSE';
                        if (val instanceof Date) return isNaN(val.getTime()) ? 'NULL' : `'${val.toISOString()}'`;
                        if (typeof val === 'string') {
                            if (val.includes('0000-00-00')) return 'NULL';
                            return `'${val.replace(/'/g, "''").replace(/\n/g, "\\n")}'`;
                        }
                        return `'${val}'`;
                    });
                    dataSql += `INSERT INTO "${table}" (${colNames}) VALUES (${values.join(', ')});\n`;
                }
                // Sequence Fix
                const autoCol = cols.find(c => c.Extra.includes('auto_increment'));
                if (autoCol) {
                    dataSql += `SELECT setval(pg_get_serial_sequence('"${table}"', '${autoCol.Field}'), COALESCE((SELECT MAX("${autoCol.Field}") FROM "${table}"), 1));\n`;
                }
                dataSql += '\n';
            }
        }

        dataSql += "SET session_replication_role = 'origin';\n";

        // Step 3: Indexes & Constraints with UNIQUE NAMES
        const [mysqlIndexes] = await mysqlConn.execute(`
            SELECT TABLE_NAME, INDEX_NAME, COLUMN_NAME, NON_UNIQUE, SEQ_IN_INDEX
            FROM INFORMATION_SCHEMA.STATISTICS
            WHERE TABLE_SCHEMA = 'software_db' AND INDEX_NAME != 'PRIMARY'
        `);
        const groupedIdx = {};
        mysqlIndexes.forEach(idx => {
            const key = `${idx.TABLE_NAME}.${idx.INDEX_NAME}`;
            if (!groupedIdx[key]) groupedIdx[key] = { table: idx.TABLE_NAME, name: idx.INDEX_NAME, unique: idx.NON_UNIQUE === 0, columns: [] };
            groupedIdx[key].columns[idx.SEQ_IN_INDEX - 1] = `"${idx.COLUMN_NAME}"`;
        });
        for (const k in groupedIdx) {
            const idx = groupedIdx[k];
            // Ensure unique index name in PG by prefixing with table name
            const pgIndexName = `idx_${idx.table}_${idx.name}`;
            constraintsSql += `CREATE ${idx.unique ? 'UNIQUE ' : ''}INDEX "${pgIndexName}" ON "${idx.table}" (${idx.columns.join(', ')});\n`;
        }

        const [mysqlFKs] = await mysqlConn.execute(`
            SELECT TABLE_NAME, COLUMN_NAME, CONSTRAINT_NAME, REFERENCED_TABLE_NAME, REFERENCED_COLUMN_NAME
            FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
            WHERE REFERENCED_TABLE_SCHEMA = 'software_db' AND REFERENCED_TABLE_NAME IS NOT NULL
        `);
        mysqlFKs.forEach(fk => {
            const pgFKName = `fk_${fk.TABLE_NAME}_${fk.COLUMN_NAME}_${fk.CONSTRAINT_NAME}`;
            constraintsSql += `ALTER TABLE "${fk.TABLE_NAME}" ADD CONSTRAINT "${pgFKName}" FOREIGN KEY ("${fk.COLUMN_NAME}") REFERENCES "${fk.REFERENCED_TABLE_NAME}" ("${fk.REFERENCED_COLUMN_NAME}") ON DELETE CASCADE;\n`;
        });

        fs.writeFileSync('step1_tables.sql', schemaTablesSql);
        fs.writeFileSync('step2_data.sql', dataSql);
        fs.writeFileSync('step3_constraints.sql', constraintsSql);

        console.log('REGENERATED: step1_tables.sql, step2_data.sql, and step3_constraints.sql with unique PG names');

    } catch (err) {
        console.error(err);
    } finally {
        await mysqlConn.end();
    }
}

generate3StepMigration();
