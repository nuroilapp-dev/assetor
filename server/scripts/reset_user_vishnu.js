const db = require('../config/db');
const bcrypt = require('bcryptjs');

async function resetUser() {
    try {
        const email = 'vishnupriya@nurac';
        const password = 'admin123';
        const hashedPassword = await bcrypt.hash(password, 10);
        const name = 'Vishnupriya';
        const role = 'SUPER_ADMIN'; // Giving super admin to see everything

        // Check if user exists
        const [users] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);

        if (users.length > 0) {
            // Update existing user
            await db.execute(
                'UPDATE users SET password = ?, role = ? WHERE email = ?',
                [hashedPassword, role, email]
            );
            console.log(`Updated user ${email} with password ${password} and role ${role}`);
        } else {
            // Create new user
            await db.execute(
                'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
                [name, email, hashedPassword, role]
            );
            console.log(`Created user ${email} with password ${password} and role ${role}`);
        }

        // Verify immediately
        const [verUser] = await db.execute('SELECT password FROM users WHERE email = ?', [email]);
        const isMatch = await bcrypt.compare(password, verUser[0].password);
        console.log('Immediate Password Verification:', isMatch ? 'MATCHED' : 'FAILED');

        process.exit(0);
    } catch (error) {
        console.error('Error resetting user:', error);
        process.exit(1);
    }
}

resetUser();
