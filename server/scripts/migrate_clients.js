const db = require('../config/db');
const fs = require('fs');
const path = require('path');

const runMigration = async () => {
    try {
        const sqlPath = path.join(__dirname, '../../db/migrations/20260204_add_clients.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log('Running migration: 20260204_add_clients.sql...');

        // Split by semicolon to run individual statements if needed, 
        // but pg.query can handle multiple statements if they are not too complex.
        await db.query(sql);

        console.log('✅ Migration completed successfully!');
    } catch (error) {
        console.error('❌ Migration failed:', error);
    } finally {
        process.exit();
    }
};

runMigration();
