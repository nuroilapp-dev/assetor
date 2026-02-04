const db = require('./config/db');

async function fixMissingConfig() {
    try {
        console.log("Checking for missing UAE + Warehouse + Main Land config...");
        const [existing] = await db.execute(`
            SELECT id FROM company_modules 
            WHERE module_id = 1 
            AND country_id = 1 
            AND premises_type_id = 1 
            AND area_id = 1
        `);

        if (existing.length > 0) {
            console.log("Config already exists (ID " + existing[0].id + "). Updating fields...");
            // Just ensure fields 56 and 57 are there
            const cmId = existing[0].id;
            await db.execute("DELETE FROM company_module_field_selection WHERE company_module_id = ?", [cmId]);
            await db.execute("INSERT INTO company_module_field_selection (company_module_id, field_id) VALUES (?, 56), (?, 57)", [cmId, cmId]);
            console.log("Updated fields for ID " + cmId);
        } else {
            console.log("Creating new config...");
            const [res] = await db.execute(`
                INSERT INTO company_modules (company_id, module_id, is_enabled, country_id, premises_type_id, area_id, status_id, created_at)
                VALUES (1, 1, 1, 1, 1, 1, 1, NOW())
            `); // Assuming company_id 1
            const newId = res.insertId;
            console.log("Created Config ID " + newId);

            await db.execute("INSERT INTO company_module_field_selection (company_module_id, field_id) VALUES (?, 56), (?, 57)", [newId, newId]);
            console.log("Inserted fields 56, 57");
        }

    } catch (e) {
        console.error(e);
    }
    process.exit();
}
fixMissingConfig();
