const db = require('../config/db');

async function checkVishnu() {
    try {
        console.log('Checking vishnu@nurac.com user...');
        const [users] = await db.execute('SELECT id, name, email, password, role, status, company_id FROM users WHERE email = ?', ['vishnu@nurac.com']);

        if (users.length === 0) {
            console.log('User not found!');
        } else {
            const user = users[0];
            console.log('User found:');
            console.log('ID:', user.id);
            console.log('Name:', user.name);
            console.log('Email:', user.email);
            console.log('Password:', user.password);
            console.log('Password Length:', user.password.length);
            console.log('Role:', user.role);
            console.log('Status:', user.status);
            console.log('Company ID:', user.company_id);
        }
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

checkVishnu();
