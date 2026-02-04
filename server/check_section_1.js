const db = require('./config/db');

async function checkSections() {
    try {
        const [sections] = await db.execute('SELECT * FROM module_sections WHERE id = 1');
        console.log('Section ID 1:', JSON.stringify(sections, null, 2));

        if (sections.length > 0) {
            const moduleId = sections[0].module_id;
            console.log('Module ID for Section 1:', moduleId);

            // Checking related fields in the same section
            const [fields] = await db.execute('SELECT * FROM module_section_fields WHERE section_id = 1');
            console.log('Fields for Section 1:', JSON.stringify(fields, null, 2));

            // Checking options for those fields
            if (fields.length > 0) {
                const fieldIds = fields.map(f => f.id);
                const [options] = await db.execute(`SELECT * FROM module_section_field_options WHERE field_id IN (${fieldIds.join(',')})`);
                console.log('Options for Section 1 fields:', JSON.stringify(options, null, 2));
            }
        } else {
            console.log('No section found with ID 1 in module_sections.');

            // Try module_heads/subheads instead as a fallback
            console.log('\nChecking module_heads for id=1...');
            const [heads] = await db.execute('SELECT * FROM module_heads WHERE id = 1');
            console.log('Head ID 1:', JSON.stringify(heads, null, 2));

            if (heads.length > 0) {
                const [subheads] = await db.execute('SELECT * FROM module_subheads WHERE head_id = 1');
                console.log('Subheads for Head 1:', JSON.stringify(subheads, null, 2));

                if (subheads.length > 0) {
                    const subheadIds = subheads.map(s => s.id);
                    const [options] = await db.execute(`SELECT * FROM module_subhead_options WHERE subhead_id IN (${subheadIds.join(',')})`);
                    console.log('Options for Subheads of Head 1:', JSON.stringify(options, null, 2));
                }
            }
        }

        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

checkSections();
