const db = require('./config/db');

async function seedAllSections() {
    try {
        console.log('Seeding expanded module sections...');

        // 1. Get All Module IDs
        const [modules] = await db.execute('SELECT module_id, module_name FROM module_master');
        const moduleMap = {}; // name -> id
        modules.forEach(m => {
            moduleMap[m.module_name] = m.module_id;
        });

        const SEEDS = {
            'Assets': ['Asset Info', 'Purchase & Warranty', 'Location & User', 'Lifecycle'],
            'Employees': ['Personal Identity', 'Work Profile', 'Documents', 'Skills'],
            'Maintenance': ['Schedule', 'Work History', 'Costing'],
            'Premises': ['Premises Identity', 'Facility Specifications', 'Utilities', 'Lease Details'],
            'Stock': ['Inventory Specs', 'Warehouse Info', 'Supplier Contact'],
            'Asset Categories': ['Category Identity', 'Depreciation Rules', 'Custom Attributes'],
            'Vendors': ['Business Identity', 'Contact Persons', 'Banking Details']
        };

        for (const [nameKey, sectionNames] of Object.entries(SEEDS)) {
            // Find module_id by matching nameKey in module_master
            const moduleId = Object.keys(moduleMap).find(k => k.toLowerCase().includes(nameKey.toLowerCase()))
                ? moduleMap[Object.keys(moduleMap).find(k => k.toLowerCase().includes(nameKey.toLowerCase()))]
                : null;

            if (moduleId) {
                console.log(`Processing: ${nameKey} (ID: ${moduleId})`);
                for (let i = 0; i < sectionNames.length; i++) {
                    const sName = sectionNames[i];
                    // Check if exists for THIS module and THIS company (1)
                    const [exists] = await db.execute(
                        'SELECT id FROM module_sections WHERE module_id = ? AND name = ? AND company_id = 1',
                        [moduleId, sName]
                    );

                    if (exists.length === 0) {
                        await db.execute(
                            'INSERT INTO module_sections (company_id, module_id, name, sort_order) VALUES (1, ?, ?, ?)',
                            [moduleId, sName, i + 1]
                        );
                        console.log(`  + Added ${sName}`);
                    }
                }
            }
        }

        console.log('Done!');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

seedAllSections();
