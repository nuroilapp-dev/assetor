require('dotenv').config({ path: './.env' });
const mysql = require('mysql2/promise');

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'asset_db',
};

async function runMigration() {
    let connection;
    try {
        console.log('Connecting to database...');
        connection = await mysql.createConnection(dbConfig);
        console.log('Connected.');

        // 1. Add document columns to office_premises
        try {
            await connection.execute(`
                ALTER TABLE office_premises
                ADD COLUMN document_name VARCHAR(255) NULL,
                ADD COLUMN document_path VARCHAR(255) NULL,
                ADD COLUMN document_mime VARCHAR(50) NULL;
            `);
            console.log('Added document columns to office_premises');
        } catch (err) {
            if (err.code === 'ER_DUP_FIELDNAME') {
                console.log('Document columns already exist in office_premises');
            } else {
                console.error('Error adding document columns:', err.message);
            }
        }

        // 2. Add yearly_rent to office_rental_details
        try {
            await connection.execute(`
                ALTER TABLE office_rental_details
                ADD COLUMN yearly_rent DECIMAL(15,2) NULL;
            `);
            console.log('Added yearly_rent column to office_rental_details');
        } catch (err) {
            if (err.code === 'ER_DUP_FIELDNAME') {
                console.log('yearly_rent column already exists in office_rental_details');
            } else {
                console.error('Error adding yearly_rent column:', err.message);
            }
        }

    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        if (connection) await connection.end();
    }
}

runMigration();
