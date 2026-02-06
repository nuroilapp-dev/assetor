const db = require('../config/db');
async function run() {
    try {
        const [users] = await db.execute('SELECT id, name, company_id, client_id, role FROM users');
        console.log('--- ALL USERS ---');
        console.log(users);

        const [comps] = await db.execute('SELECT id, name, client_id FROM companies');
        console.log('\n--- ALL COMPANIES ---');
        console.log(comps);

        const [clients] = await db.execute('SELECT id, name FROM clients');
        console.log('\n--- ALL CLIENTS ---');
        console.log(clients);
    } catch (e) { console.error(e); } finally { process.exit(); }
}
run();
