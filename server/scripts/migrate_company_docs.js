const db = require('../config/db');
async function run() {
    try {
        await db.execute(`CREATE TABLE IF NOT EXISTS company_documents (
            id SERIAL PRIMARY KEY,
            company_id INTEGER NOT NULL,
            name CHARACTER VARYING(255) NOT NULL,
            file_path CHARACTER VARYING(255) NOT NULL,
            file_type CHARACTER VARYING(100),
            uploaded_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )`);
        console.log('company_documents table created successfully');
    } catch (e) {
        console.error('Error creating table:', e);
    } finally {
        process.exit();
    }
}
run();
