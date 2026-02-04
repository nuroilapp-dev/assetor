const db = require('../config/db');

async function checkData() {
    try {
        const connection = await db.getConnection();
        console.log("--- DEBUG DATA CHECK ---");

        // 1. Check Companies
        const [companies] = await connection.execute('SELECT id, name FROM companies');
        console.log("Companies:", JSON.stringify(companies));

        // 2. Check Users
        const [users] = await connection.execute('SELECT id, email, role, company_id FROM users');
        console.log("Users:", JSON.stringify(users));

        // 3. Check Premises
        const [premises] = await connection.execute('SELECT premise_id, company_id, premise_type, premises_name, status FROM office_premises');
        console.log("Premises:", JSON.stringify(premises));

        process.exit(0);
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
}

checkData();
