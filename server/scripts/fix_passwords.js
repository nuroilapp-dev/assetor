const db = require('../config/db');

async function fixPasswords() {
    try {
        console.log('Updating passwords to plain text...');

        await db.execute("UPDATE users SET password = 'admin123' WHERE email IN ('superadmin@trakio.com', 'admin@trakio.com', 'admin@techsol.com')");
        await db.execute("UPDATE users SET password = 'user123' WHERE email = 'john@trakio.com'");

        console.log('Passwords updated successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error updating passwords:', error);
        process.exit(1);
    }
}

fixPasswords();
