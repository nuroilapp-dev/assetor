const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'software_db'
};

async function createTable() {
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        console.log('Connected to database.');

        // Create property_types table
        const createTableQuery = `
            CREATE TABLE IF NOT EXISTS property_types (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL UNIQUE
            );
        `;
        await connection.execute(createTableQuery);
        console.log('Table property_types created or already exists.');

        // Insert default values
        const insertQuery = `
            INSERT IGNORE INTO property_types (name) VALUES 
            ('Owned'), 
            ('Rental');
        `;
        await connection.execute(insertQuery);
        console.log('Inserted default values (Owned, Rental).');

        // Check values
        const [rows] = await connection.execute('SELECT * FROM property_types');
        console.log('Current property_types:', rows);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        if (connection) await connection.end();
    }
}

createTable();
