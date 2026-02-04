const db = require('./config/db');

async function run() {
    try {
        console.log("--- LOOKUP IDs ---");
        const [countries] = await db.execute("SELECT id, country_name FROM countries WHERE country_name IN ('India', 'UAE')");
        console.log("Countries:", countries);

        const [areas] = await db.execute("SELECT id, name FROM area");
        console.log("Areas:", areas);

        const [types] = await db.execute("SELECT id, type_name FROM premises_types");
        console.log("Premises Types:", types);

        console.log("\n--- MODULE CONFIGURATIONS ---");
        // Get all configs for Module 1 (Premises?)
        const [configs] = await db.execute(`
            SELECT 
                cm.id, cm.country_id, cm.premises_type_id, cm.area_id, cm.is_enabled,
                GROUP_CONCAT(cmfs.field_id) as fields
            FROM company_modules cm
            LEFT JOIN company_module_field_selection cmfs ON cmfs.company_module_id = cm.id
            WHERE cm.module_id = 1
            GROUP BY cm.id
            ORDER BY cm.id
        `);
        console.log("Configs:", JSON.stringify(configs, null, 2));

        console.log("\n--- FIELD DEFINITIONS ---");
        const [fields] = await db.execute("SELECT id, label FROM module_section_fields WHERE module_id = 1");
        // Map field IDs to names for easier debugging
        const fieldMap = {};
        fields.forEach(f => fieldMap[f.id] = f.label);
        console.log("Field Map:", fieldMap);

        // Print Configs with human readable names
        console.log("\n--- HUMAN READABLE CONFIGS ---");
        configs.forEach(c => {
            const country = countries.find(x => x.id === c.country_id)?.country_name || 'ANY';
            const area = areas.find(x => x.id === c.area_id)?.name || 'ANY';
            const type = types.find(x => x.id === c.premises_type_id)?.type_name || 'ANY';
            const fieldNames = c.fields ? c.fields.split(',').map(fid => fieldMap[fid] || fid).join(', ') : 'NONE';

            console.log(`ID: ${c.id} | Country: ${country} | Type: ${type} | Area: ${area} | Fields: [${fieldNames}]`);
        });

    } catch (e) {
        console.error(e);
    }
    process.exit();
}
run();
