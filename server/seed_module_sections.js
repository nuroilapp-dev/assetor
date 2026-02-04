const db = require('./config/db');

async function seedSections() {
    try {
        console.log('Seeding module sections...');

        // 1. Get Module IDs
        const [modules] = await db.execute('SELECT module_id, module_name FROM module_master');
        const moduleMap = {}; // name -> id
        modules.forEach(m => {
            moduleMap[m.module_name] = m.module_id;
        });

        console.log('Modules found:', moduleMap);

        const SEEDS = {
            'Assets': ['Asset Information', 'Purchase Details', 'Lifecycle Status', 'Warranty Info'],
            'Employees': ['Personal Details', 'Job Information', 'Contact Details', 'Emergency Contact'],
            'Maintenance': ['Maintenance Schedule', 'Work Orders', 'Service Logs'],
            'Premises': ['Premises Identity', 'Facility Specifications', 'Utilities', 'Lease Details'],
            'Stock': ['Stock Information', 'Warehouse Location', 'Supplier Details']
        };

        for (const [moduleName, sectionNames] of Object.entries(SEEDS)) {
            // Find ID (case-insensitive search in map)
            const dbName = Object.keys(moduleMap).find(n => n.toLowerCase().includes(moduleName.toLowerCase()));

            if (dbName) {
                const moduleId = moduleMap[dbName];
                console.log(`Seeding sections for ${dbName} (ID: ${moduleId})...`);

                for (let i = 0; i < sectionNames.length; i++) {
                    const sectionName = sectionNames[i];

                    // Check if exists
                    const [existing] = await db.execute(
                        'SELECT id FROM module_sections WHERE module_id = ? AND name = ?',
                        [moduleId, sectionName]
                    );

                    if (existing.length === 0) {
                        await db.execute(
                            'INSERT INTO module_sections (company_id, module_id, name, sort_order) VALUES (?, ?, ?, ?)',
                            [1, moduleId, sectionName, i + 1] // Defaulting company_id to 1
                        );
                        console.log(`  + Added: ${sectionName}`);
                    } else {
                        console.log(`  . Skipped: ${sectionName}`);
                    }
                }
            } else {
                console.log(`! Module not found for keyword: ${moduleName}`);
            }
        }

        console.log('Seeding completed.');
        process.exit(0);

    } catch (err) {
        console.error('Seeding failed:', err);
        process.exit(1);
    }
}

seedSections();
