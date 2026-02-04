const mysql = require('mysql2/promise');
const fs = require('fs');

async function getMySQLConstraints() {
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'software_db'
    });

    try {
        const [fks] = await connection.execute(`
            SELECT 
                TABLE_NAME, 
                COLUMN_NAME, 
                CONSTRAINT_NAME, 
                REFERENCED_TABLE_NAME, 
                REFERENCED_COLUMN_NAME
            FROM 
                INFORMATION_SCHEMA.KEY_COLUMN_USAGE
            WHERE 
                REFERENCED_TABLE_SCHEMA = 'software_db'
        `);
        fs.writeFileSync('mysql_constraints.json', JSON.stringify(fks, null, 2));
        console.log('Saved constraints to mysql_constraints.json');
    } catch (err) {
        console.error(err);
    } finally {
        await connection.end();
    }
}

getMySQLConstraints();
