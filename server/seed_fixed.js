const db = require('./config/db');

async function seedFixed() {
    try {
        console.log('Seeding fixed sections for Company 1...');

        // Ensure company 1 exists or just use it
        const sections = [
            { mid: 1, name: 'Premises Identity' },
            { mid: 1, name: 'Facility Specifications' },
            { mid: 1, name: 'Utilities' },
            { mid: 1, name: 'Lease Details' },
            { mid: 5, name: 'Category Identity' },
            { mid: 5, name: 'Depreciation Rules' },
            { mid: 5, name: 'Custom Attributes' },
            { mid: 2, name: 'Personal Identity' },
            { mid: 2, name: 'Work Profile' },
            { mid: 2, name: 'Documents' }
        ];

        for (const s of sections) {
            // Check if exists
            const [exists] = await db.execute(
                'SELECT id FROM module_sections WHERE module_id = ? AND name = ? AND company_id = 1',
                [s.mid, s.name]
            );

            if (exists.length === 0) {
                await db.execute(
                    'INSERT INTO module_sections (company_id, module_id, name, sort_order) VALUES (1, ?, ?, ?)',
                    [s.mid, s.name, 0]
                );
                console.log(`+ Added ${s.name} for module ${s.mid}`);
            } else {
                console.log(`. Exists: ${s.name}`);
            }
        }
        console.log('Done!');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

seedFixed();
