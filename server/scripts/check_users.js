const db = require('../config/db');

async function checkUsers() {
    try {
        const connection = await db.getConnection();
        const [users] = await connection.execute('SELECT id, email, role, company_id FROM users');
        console.log("Users List:");
        users.forEach(u => console.log(`${u.id} | ${u.email} | ${u.role} | ${u.company_id}`));
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}
checkUsers();
