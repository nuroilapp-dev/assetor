const db = require('../config/db');

async function checkSuperadmin() {
    try {
        const connection = await db.getConnection();
        const [users] = await connection.execute('SELECT id, email, password, role, company_id FROM users WHERE email = ?', ['superadmin@trakio.com']);

        if (users.length === 0) {
            console.log('❌ No superadmin@trakio.com user found!');
        } else {
            const user = users[0];
            console.log('✅ Superadmin user found:');
            console.log(`   ID: ${user.id}`);
            console.log(`   Email: ${user.email}`);
            console.log(`   Role: ${user.role}`);
            console.log(`   Company ID: ${user.company_id}`);
            console.log(`   Password Hash: ${user.password}`);
            console.log(`   Hash Length: ${user.password ? user.password.length : 0}`);
        }

        connection.release();
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

checkSuperadmin();
