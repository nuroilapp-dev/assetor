const db = require('../config/db');

const verify = async () => {
    try {
        const [rows] = await db.execute("SELECT id, name, email, role FROM users WHERE name = 'Superadmin'");
        console.log('Found users with name "Superadmin":');
        console.log(JSON.stringify(rows, null, 2));

        const [allRows] = await db.execute("SELECT id, name, email, role FROM users");
        console.log('\nAll users:');
        console.log(JSON.stringify(allRows, null, 2));
    } catch (error) {
        console.error('Error:', error);
    } finally {
        process.exit();
    }
};

verify();
