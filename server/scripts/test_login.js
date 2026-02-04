const db = require('../config/db');

async function testLogin() {
    const email = 'vishnu@nurac.com';
    const password = 'admin123';

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    try {
        console.log('Testing login with:');
        console.log('Email:', cleanEmail);
        console.log('Password:', cleanPassword);
        console.log('Password length:', cleanPassword.length);

        const [users] = await db.execute('SELECT * FROM users WHERE LOWER(email) = ?', [cleanEmail]);

        if (users.length === 0) {
            console.log('❌ User not found');
        } else {
            const user = users[0];
            console.log('\nUser from DB:');
            console.log('Email:', user.email);
            console.log('Password:', user.password);
            console.log('Password length:', user.password.length);
            console.log('Password trimmed:', user.password.trim());
            console.log('Password trimmed length:', user.password.trim().length);

            const isMatch = (cleanPassword === user.password.trim());
            console.log('\nPassword match:', isMatch);

            if (isMatch) {
                console.log('✅ Login would succeed!');
            } else {
                console.log('❌ Login would fail!');
                console.log('Comparison:', `"${cleanPassword}" === "${user.password.trim()}"`);
            }
        }

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

testLogin();
