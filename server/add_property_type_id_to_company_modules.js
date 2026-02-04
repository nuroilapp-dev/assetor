const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'software_db'
};

async function migrate() {
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        console.log('Connected to database.');

        // Check if column exists
        const [columns] = await connection.execute(`
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'company_modules' AND COLUMN_NAME = 'property_type_id'
        `, [dbConfig.database]);

        if (columns.length > 0) {
            console.log('Column property_type_id already exists in company_modules.');
            return;
        }

        console.log('Adding property_type_id column to company_modules...');

        // Add column
        await connection.execute(`
            ALTER TABLE company_modules
            ADD COLUMN property_type_id INT NULL DEFAULT NULL AFTER country_id
        `);
        console.log('Column added.');

        // Add Foreign Key
        // constraint name: fk_cm_property_type
        await connection.execute(`
            ALTER TABLE company_modules
            ADD CONSTRAINT fk_cm_property_type
            FOREIGN KEY (property_type_id) REFERENCES property_types(id)
            ON DELETE SET NULL
        `);
        console.log('Foreign key constraint added.');

    } catch (error) {
        console.error('Migration Error:', error);
    } finally {
        if (connection) await connection.end();
    }
}

migrate();
