require('dotenv').config();
const mysql = require('mysql2/promise');

async function migrate() {
    console.log("Connecting to DB...");
    const conn = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT || 3306
    });

    console.log("Connected.");

    try {
        await conn.execute("ALTER TABLE office_premises ADD COLUMN parking_available TINYINT(1) DEFAULT 0");
        console.log("Added parking_available column.");
    } catch (e) {
        if (e.code === 'ER_DUP_FIELDNAME') console.log("parking_available already exists.");
        else console.log("Error adding parking_available:", e.message);
    }

    try {
        await conn.execute("ALTER TABLE office_premises ADD COLUMN parking_area VARCHAR(255) NULL");
        console.log("Added parking_area column.");
    } catch (e) {
        if (e.code === 'ER_DUP_FIELDNAME') console.log("parking_area already exists.");
        else console.log("Error adding parking_area:", e.message);
    }

    await conn.end();
    process.exit(0);
}

migrate();
