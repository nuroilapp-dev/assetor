const api = require('./config/db'); // This is just db connection, not api client.
// I need to hit the endpoint properly.
const axios = require('axios');

async function testEndpoint() {
    try {
        // Need to simulate auth or bypass it? The endpoint uses authMiddleware.
        // It's probably easier to just check the DB and assume the controller works if it matches.
        // But the user says "not display", so maybe the API is failing.

        // Let's use the local db check first to be 100% sure the table is populated as expected by the query.
        const db = require('./config/db');
        const [rows] = await db.execute('SELECT id, type_name FROM premises_types ORDER BY type_name ASC');
        console.log('DB Rows:', rows);

    } catch (e) {
        console.error(e);
    }
    process.exit();
}
testEndpoint();
