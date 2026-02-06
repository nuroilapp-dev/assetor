const db = require('../config/db');
const bcrypt = require('bcryptjs');

async function fixSuperadmin() {
    try {
        console.log('=== Checking Superadmin Account ===\n');

        // Check if superadmin exists
        const [users] = await db.execute(
            "SELECT id, name, email, role, status FROM users WHERE email = ?",
            ['superadmin@trakio.com']
        );

        const newPassword = 'superadmin123';
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        if (users.length === 0) {
            // Create new superadmin
            console.log('❌ Superadmin not found. Creating new account...');
            await db.execute(
                "INSERT INTO users (name, email, password, role, status) VALUES (?, ?, ?, ?, ?)",
                ['Superadmin', 'superadmin@trakio.com', hashedPassword, 'SUPER_ADMIN', 'ACTIVE']
            );
            console.log('✅ Superadmin created successfully!');
        } else {
            // Update existing superadmin password
            console.log('✅ Superadmin found. Updating password...');
            await db.execute(
                "UPDATE users SET password = ?, role = ?, status = ? WHERE email = ?",
                [hashedPassword, 'SUPER_ADMIN', 'ACTIVE', 'superadmin@trakio.com']
            );
            console.log('✅ Password updated successfully!');
        }

        // Verify password works
        const [verifyUser] = await db.execute(
            "SELECT password FROM users WHERE email = ?",
            ['superadmin@trakio.com']
        );
        const passwordMatch = await bcrypt.compare(newPassword, verifyUser[0].password);

        console.log('\n=== Verification ===');
        console.log(`Password test: ${passwordMatch ? '✅ PASSED' : '❌ FAILED'}`);

        console.log('\n=== Login Credentials ===');
        console.log('Email: superadmin@trakio.com');
        console.log('Password: superadmin123');
        console.log('\n✅ You can now login!');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error(error);
        process.exit(1);
    }
}

fixSuperadmin();
