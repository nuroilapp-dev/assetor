const db = require('../config/db');
async function run() {
    try {
        const [rows] = await db.execute("SELECT column_name FROM information_schema.columns WHERE table_name = 'users'");
        console.log('Users columns:', rows.map(r => r.column_name));

        const [companies] = await db.execute("SELECT column_name FROM information_schema.columns WHERE table_name = 'companies'");
        console.log('Companies columns:', companies.map(r => r.column_name));

        const [clients] = await db.execute("SELECT column_name FROM information_schema.columns WHERE table_name = 'clients'");
        console.log('Clients columns:', clients.map(r => r.column_name));
    } catch (e) { console.error(e); } finally { process.exit(); }
}
run();
