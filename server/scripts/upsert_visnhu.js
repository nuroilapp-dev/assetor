const db = require('../config/db');
const bcrypt = require('bcryptjs');

const upsertUser = async () => {
    const email = 'vishnu@nurac.com';
    const password = 'admin123';
    const name = 'Vishnu';
    const role = 'COMPANY_ADMIN'; // Assuming user wants to test Company Admin view
    const companyId = 1; // Assuming default company ID 1 exists, otherwise we might need to create it or pick one

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        // Check if user exists
        const [users] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);

        if (users.length > 0) {
            console.log(`Updating password for existing user ${email}...`);
            await db.execute('UPDATE users SET password = ?, role = ? WHERE email = ?', [hashedPassword, role, email]);
            console.log('✅ User updated successfully.');
        } else {
            console.log(`Creating new user ${email}...`);
            await db.execute(
                'INSERT INTO users (name, email, password, role, company_id, status) VALUES (?, ?, ?, ?, ?, ?)',
                [name, email, hashedPassword, role, companyId, 'ACTIVE']
            );
            console.log('✅ User created successfully.');
        }

    } catch (error) {
        console.error('Error upserting user:', error);
    } finally {
        process.exit();
    }
};

upsertUser();
