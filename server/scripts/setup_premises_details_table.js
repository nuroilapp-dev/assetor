const db = require('../config/db');

async function setupTable() {
    try {
        console.log('Checking database connection...');
        const connection = await db.getConnection();
        console.log('Connected!');

        const createTableQuery = `
            CREATE TABLE IF NOT EXISTS premises_module_details (
                id INT AUTO_INCREMENT PRIMARY KEY,
                premise_id INT NOT NULL,
                company_id INT NOT NULL,
                field_key VARCHAR(255) NOT NULL,
                field_value TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX (premise_id),
                INDEX (company_id)
            ) ENGINE=InnoDB;
        `;

        console.log('Creating table premises_module_details if not exists...');
        await connection.query(createTableQuery); // Use query logic if straight execute isn't working for DDL sometimes, but execute is fine.
        console.log('Table setup completed successfully.');

        connection.release();
        process.exit(0);
    } catch (error) {
        console.error('Setup failed:', error);
        process.exit(1);
    }
}

setupTable();
