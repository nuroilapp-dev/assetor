const db = require('../config/db');
const bcrypt = require('bcryptjs');

const createSuperadmin = async () => {
    try {
        const email = 'superadmin@trakio.com';
        const password = 'superadmin123';
        const hashedPassword = await bcrypt.hash(password, 10);

        console.log(`Checking if superadmin already exists...`);
        const [existing] = await db.execute('SELECT id FROM users WHERE email = ?', [email]);

        if (existing.length > 0) {
            console.log(`User exists. Updating password...`);
            await db.execute('UPDATE users SET password = ?, role = \'SUPER_ADMIN\' WHERE email = ?', [hashedPassword, email]);
        } else {
            console.log(`Creating new superadmin user...`);
            await db.execute(
                'INSERT INTO users (name, email, password, role, status) VALUES (\'Superadmin\', ?, ?, \'SUPER_ADMIN\', \'ACTIVE\')',
                [email, hashedPassword]
            );
        }

        console.log('✅ Superadmin credentials created successfully!');
        console.log('Email: superadmin@trakio.com');
        console.log('Password: superadmin123');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error creating superadmin:', error);
        process.exit(1);
    }
};

createSuperadmin();
