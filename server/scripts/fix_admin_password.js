const db = require('../config/db');
const bcrypt = require('bcryptjs');

const fixPassword = async () => {
    try {
        // First, check current users
        console.log('=== Checking current users ===');
        const [users] = await db.execute("SELECT id, name, email, role, LEFT(password, 20) as pwd_preview FROM users");
        console.log('Current users:');
        users.forEach(u => console.log(`  ID: ${u.id}, Email: ${u.email}, Role: ${u.role}, Pwd: ${u.pwd_preview}...`));

        // Generate correct bcrypt hash for 'admin123'
        const correctHash = await bcrypt.hash('admin123', 10);
        console.log('\n=== Generated new hash for "admin123" ===');
        console.log(`New hash: ${correctHash}`);

        // Verify the hash works
        const testMatch = await bcrypt.compare('admin123', correctHash);
        console.log(`Hash verification test: ${testMatch ? 'PASSED ✓' : 'FAILED ✗'}`);

        // Update both admin users
        console.log('\n=== Updating passwords ===');

        const [result1] = await db.execute(
            "UPDATE users SET password = $1 WHERE email = 'superadmin@trakio.com'",
            [correctHash]
        );
        console.log(`Updated superadmin@trakio.com`);

        const [result2] = await db.execute(
            "UPDATE users SET password = $1 WHERE email = 'admin@trakio.com'",
            [correctHash]
        );
        console.log(`Updated admin@trakio.com`);

        // Verify the update
        console.log('\n=== Verifying updates ===');
        const [updatedUsers] = await db.execute(
            "SELECT email, password FROM users WHERE email IN ('superadmin@trakio.com', 'admin@trakio.com')"
        );

        for (const user of updatedUsers) {
            const match = await bcrypt.compare('admin123', user.password);
            console.log(`${user.email}: Password test ${match ? 'PASSED ✓' : 'FAILED ✗'}`);
        }

        console.log('\n✅ Password fix completed!');
        console.log('You can now login with:');
        console.log('  Email: admin@trakio.com');
        console.log('  Password: admin123');

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        process.exit();
    }
};

fixPassword();
