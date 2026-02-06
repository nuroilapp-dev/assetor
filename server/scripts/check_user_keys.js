const db = require('../config/db');
async function run() {
    try {
        const [rows] = await db.execute("SELECT * FROM users LIMIT 1");
        if (rows.length > 0) {
            console.log('User sample keys:', Object.keys(rows[0]));
        } else {
            console.log('No users found to check keys.');
        }
    } catch (e) { console.error(e); } finally { process.exit(); }
}
run();
