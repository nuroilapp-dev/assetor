const db = require('../config/db');
const bcrypt = require('bcryptjs');

const addTestAssetUser = async () => {
    try {
        console.log('=== Adding testAsset@gmail.com user ===');

        // Generate bcrypt hash for 'admin123'
        const passwordHash = await bcrypt.hash('admin123', 10);
        console.log('Generated password hash');

        // Check if user already exists
        const [existing] = await db.execute(
            "SELECT id, email FROM users WHERE LOWER(email) = LOWER('testAsset@gmail.com')"
        );

        if (existing.length > 0) {
            console.log('❌ User testAsset@gmail.com already exists!');
            console.log('   Updating password instead...');

            await db.execute(
                "UPDATE users SET password = $1 WHERE LOWER(email) = LOWER('testAsset@gmail.com')",
                [passwordHash]
            );
            console.log('✅ Password updated for testAsset@gmail.com');
        } else {
            // Insert new user
            const [result] = await db.execute(
                `INSERT INTO users (company_id, name, email, password, role, status) 
                 VALUES ($1, $2, $3, $4, $5, $6)`,
                [1, 'Test Asset Admin', 'testAsset@gmail.com', passwordHash, 'COMPANY_ADMIN', 'ACTIVE']
            );
            console.log('✅ User created successfully!');
        }

        // Verify the user can login
        const [users] = await db.execute(
            "SELECT id, name, email, role, status FROM users WHERE LOWER(email) = LOWER('testAsset@gmail.com')"
        );

        console.log('\n=== User Details ===');
        console.log(JSON.stringify(users[0], null, 2));

        // Test password
        const [userForTest] = await db.execute(
            "SELECT password FROM users WHERE LOWER(email) = LOWER('testAsset@gmail.com')"
        );
        const passwordMatch = await bcrypt.compare('admin123', userForTest[0].password);
        console.log(`\n=== Password Test ===`);
        console.log(`Password "admin123" match: ${passwordMatch ? '✅ PASSED' : '❌ FAILED'}`);

        console.log('\n✅ Setup completed!');
        console.log('You can now login with:');
        console.log('  Email: testAsset@gmail.com');
        console.log('  Password: admin123');

    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error(error);
    } finally {
        process.exit();
    }
};

addTestAssetUser();
