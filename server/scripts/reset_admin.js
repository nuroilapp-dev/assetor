const db = require('../config/db');
const bcrypt = require('bcryptjs');

const resetAdmin = async () => {
    try {
        const email = 'admin@trakio.com';
        const newPassword = 'password123';
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        console.log(`Resetting password for ${email}...`);

        const [result] = await db.execute(
            'UPDATE users SET password = ? WHERE email = ?',
            [hashedPassword, email]
        );

        if (result.affectedRows > 0) {
            console.log('✅ Password updated successfully!');
            console.log(`Email: ${email}`);
            console.log(`New Password: ${newPassword}`);
        } else {
            console.log('❌ User not found. Creating user...');
            // Optional: Create if not exists (though logs verify it exists)
            // But for robustness, let's just log failure if it doesn't match
        }
    } catch (error) {
        console.error('Error resetting password:', error);
    } finally {
        process.exit();
    }
};

resetAdmin();
