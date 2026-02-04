const db = require('./config/db');

async function test() {
    const email = 'admin@trakio.com';
    const cleanEmail = email.trim().toLowerCase();
    console.log(`Testing with: "${cleanEmail}" (length: ${cleanEmail.length})`);

    try {
        const [users] = await db.execute('SELECT * FROM users WHERE LOWER(email) = ?', [cleanEmail]);
        console.log(`Result count: ${users.length}`);
        if (users.length > 0) {
            console.log(`Found User: ${users[0].email} (ID: ${users[0].id})`);
        } else {
            console.log('User NOT found in DB via query.');
            // Let's see what IS there
            const [all] = await db.execute('SELECT email FROM users');
            all.forEach(u => {
                console.log(`- "${u.email}" (length: ${u.email.length})`);
            });
        }
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
test();
