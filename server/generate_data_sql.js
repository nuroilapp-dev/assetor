const mysql = require('mysql2/promise');
const fs = require('fs');

async function generateDataSQL() {
    const mysqlConn = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'software_db'
    });

    try {
        const [tables] = await mysqlConn.execute('SHOW TABLES');
        const tableNames = tables.map(t => Object.values(t)[0]);

        let sql = "-- PostgreSQL Data Load\n";
        sql += "SET session_replication_role = 'replica';\n\n";

        for (const table of tableNames) {
            const [rows] = await mysqlConn.execute(`SELECT * FROM \`${table}\``);
            if (rows.length === 0) continue;

            sql += `-- Data for table: ${table}\n`;
            sql += `TRUNCATE TABLE "${table}" CASCADE;\n`;

            const colNames = Object.keys(rows[0]).map(c => `"${c}"`).join(', ');

            for (const row of rows) {
                const values = Object.values(row).map(val => {
                    if (val === null) return 'NULL';
                    if (typeof val === 'boolean') return val ? 'TRUE' : 'FALSE';
                    if (typeof val === 'number') return val;
                    if (val instanceof Date) {
                        return isNaN(val.getTime()) ? 'NULL' : `'${val.toISOString()}'`;
                    }
                    if (typeof val === 'string') {
                        if (val === '0000-00-00 00:00:00' || val === '0000-00-00' || val === '0001-01-01 00:00:00') return 'NULL';
                        return `'${val.replace(/'/g, "''").replace(/\n/g, "\\n").replace(/\r/g, "\\r")}'`;
                    }
                    if (typeof val === 'object') return `'${JSON.stringify(val).replace(/'/g, "''")}'`;
                    return `'${val}'`;
                });

                sql += `INSERT INTO "${table}" (${colNames}) VALUES (${values.join(', ')});\n`;
            }

            // Fix sequences
            const [cols] = await mysqlConn.execute(`SHOW COLUMNS FROM \`${table}\``);
            const autoCol = cols.find(c => c.Extra.includes('auto_increment'));
            if (autoCol) {
                sql += `SELECT setval(pg_get_serial_sequence('"${table}"', '${autoCol.Field}'), COALESCE((SELECT MAX("${autoCol.Field}") FROM "${table}"), 1));\n`;
            }
            sql += "\n";
        }

        sql += "SET session_replication_role = 'origin';\n";
        fs.writeFileSync('data.sql', sql);
        console.log('Generated data.sql');

    } catch (err) {
        console.error(err);
    } finally {
        await mysqlConn.end();
    }
}

generateDataSQL();
