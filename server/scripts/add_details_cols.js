const db = require('../config/db');

async function migrate() {
    try {
        const connection = await db.getConnection();
        console.log("Running migration to add capacity, address_line2, landmark...");

        try {
            await connection.execute("ALTER TABLE office_premises ADD COLUMN capacity INT NULL DEFAULT 0");
            console.log("Added capacity");
        } catch (e) {
            if (!e.message.includes("Duplicate column")) console.error("Error adding capacity:", e.message);
        }

        try {
            await connection.execute("ALTER TABLE office_premises ADD COLUMN address_line2 VARCHAR(255) NULL");
            console.log("Added address_line2");
        } catch (e) {
            if (!e.message.includes("Duplicate column")) console.error("Error adding address_line2:", e.message);
        }

        try {
            await connection.execute("ALTER TABLE office_premises ADD COLUMN landmark VARCHAR(255) NULL");
            console.log("Added landmark");
        } catch (e) {
            if (!e.message.includes("Duplicate column")) console.error("Error adding landmark:", e.message);
        }

        console.log("Migration complete.");
        process.exit(0);
    } catch (error) {
        console.error("Migration failed:", error);
        process.exit(1);
    }
}

migrate();
