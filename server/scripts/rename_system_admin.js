const db = require('../config/db');

const renameAdmin = async () => {
    try {
        console.log('Updating "System Admin" to "Superadmin" in PostgreSQL database...');

        // Update users table where name is 'System Admin'
        const [result] = await db.execute(
            "UPDATE users SET name = 'Superadmin' WHERE name = 'System Admin'"
        );

        console.log('✅ Update complete!');
        // result handling depends on whether it's pg or mysql style mock
        // but for now, we just output the message.

    } catch (error) {
        console.error('❌ Error updating user name:', error);
    } finally {
        process.exit();
    }
};

renameAdmin();
