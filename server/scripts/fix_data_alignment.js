const db = require('../config/db');

async function fixData() {
    try {
        const connection = await db.getConnection();
        console.log("Aligning all data to Company ID 1...");

        await connection.execute('UPDATE users SET company_id = 1, status="ACTIVE"');
        await connection.execute('UPDATE office_premises SET company_id = 1');
        await connection.execute('UPDATE office_premises_documents SET company_id = 1');
        await connection.execute('UPDATE office_premises_utilities SET company_id = 1');

        console.log("Data aligned. Please logout and login if issues persist.");
        process.exit(0);
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
}

fixData();
