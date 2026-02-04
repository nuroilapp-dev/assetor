const db = require('../config/db');

async function update() {
    try {
        await db.execute("UPDATE users SET password = 'admin123' WHERE email = 'vishnu@nurac.com'");
        console.log('Password updated for vishnu');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

update();
