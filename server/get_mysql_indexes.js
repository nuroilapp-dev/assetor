const mysql = require('mysql2/promise');
const fs = require('fs');

async function getMySQLIndexes() {
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'software_db'
    });

    try {
        const [indexes] = await connection.execute(`
            SELECT 
                TABLE_NAME, 
                INDEX_NAME, 
                COLUMN_NAME, 
                NON_UNIQUE, 
                SEQ_IN_INDEX
            FROM 
                INFORMATION_SCHEMA.STATISTICS
            WHERE 
                TABLE_SCHEMA = 'software_db'
                AND INDEX_NAME != 'PRIMARY'
        `);
        fs.writeFileSync('mysql_indexes.json', JSON.stringify(indexes, null, 2));
        console.log('Saved indexes to mysql_indexes.json');
    } catch (err) {
        console.error(err);
    } finally {
        await connection.end();
    }
}

getMySQLIndexes();
