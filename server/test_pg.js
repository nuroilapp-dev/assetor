const db = require('./config/db');

async function test() {
    try {
        console.log('Testing PostgreSQL connection...');
        const [rows] = await db.execute('SELECT 1 + 1 as result');
        console.log('Connection test result:', rows);

        console.log('Checking users table...');
        const [users] = await db.execute('SELECT id, email, name FROM users');
        console.log('Users in database:', users);

        process.exit(0);
    } catch (error) {
        console.error('Test failed:', error.message);
        console.error('Full error:', error);
        process.exit(1);
    }
}

test();
