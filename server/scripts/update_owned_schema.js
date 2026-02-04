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

        // 1. Add google_map_url to office_premises
        try {
            await connection.execute(`
                ALTER TABLE office_premises
                ADD COLUMN google_map_url TEXT NULL;
            `);
            console.log('Added google_map_url to office_premises');
        } catch (err) {
            if (err.code === 'ER_DUP_FIELDNAME') {
                console.log('google_map_url already exists in office_premises');
            } else {
                console.error('Error adding google_map_url:', err.message);
            }
        }

        // 2. Add columns to office_owned_details
        const ownedCols = [
            'ADD COLUMN floors_count INT DEFAULT 0',
            'ADD COLUMN depreciation_rate DECIMAL(5,2) DEFAULT 0',
            'ADD COLUMN electricity_available BOOLEAN DEFAULT FALSE',
            'ADD COLUMN water_available BOOLEAN DEFAULT FALSE',
            'ADD COLUMN internet_available BOOLEAN DEFAULT FALSE'
        ];

        for (const col of ownedCols) {
            try {
                await connection.execute(`ALTER TABLE office_owned_details ${col};`);
                console.log(`Executed: ${col}`);
            } catch (err) {
                if (err.code === 'ER_DUP_FIELDNAME') {
                    console.log(`Column from "${col}" already exists`);
                } else {
                    console.error(`Error executing "${col}":`, err.message);
                }
            }
        }

    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        if (connection) await connection.end();
    }
}

runMigration();
