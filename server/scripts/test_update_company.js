const db = require('../config/db');

const testUpdate = async () => {
    try {
        const [rows] = await db.execute('SELECT id, name FROM companies WHERE name ILIKE ?', ['%Company 1%']);
        if (rows.length > 0) {
            const id = rows[0].id;
            console.log('Found company with ID:', id, 'Name:', rows[0].name);

            // Try updating name
            await db.execute(
                'UPDATE companies SET name = ? WHERE id = ?',
                [rows[0].name + ' Updated', id]
            );
            console.log('Update 1 successful');

            // Try updating back
            await db.execute(
                'UPDATE companies SET name = ? WHERE id = ?',
                [rows[0].name, id]
            );
            console.log('Update 2 successful');
        } else {
            console.log('Company not found');
        }
    } catch (error) {
        console.error('Database update failed:', error.message);
    } finally {
        process.exit();
    }
};

testUpdate();
