const db = require('../config/db');

async function checkData() {
    try {
        console.log('=== Checking Companies and Clients ===');

        const [companies] = await db.execute('SELECT * FROM companies WHERE id = 1');
        console.log('Company 1:', companies[0]);

        if (companies.length > 0 && companies[0].client_id) {
            const [client] = await db.execute('SELECT * FROM clients WHERE id = ?', [companies[0].client_id]);
            console.log('Associated Client:', client[0]);
        } else {
            console.log('❌ Company 1 has no client_id!');
        }

        // Check if any clients exist at all
        const [clients] = await db.execute('SELECT * FROM clients');
        console.log('All Clients:', clients);

        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

checkData();
