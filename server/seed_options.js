const db = require('./config/db');

async function seedOptions() {
    try {
        console.log('Seeding module_section_field_options...');

        // First, check if there are any fields to attach options to
        const [fields] = await db.execute("SELECT id, field_key, label FROM module_section_fields WHERE field_type IN ('dropdown', 'radio', 'checkbox')");

        if (fields.length === 0) {
            console.log('No suitable fields (dropdown/radio/checkbox) found to attach options to.');
            console.log('Please create a Dropdown or Radio field in the app first.');
            process.exit(0);
        }

        const fieldId = fields[0].id;
        console.log(`Attaching demo options to field: ${fields[0].label} (ID: ${fieldId})`);

        const options = [
            { label: 'Option A', value: 'opt_a', sort_order: 1 },
            { label: 'Option B', value: 'opt_b', sort_order: 2 },
            { label: 'Option C', value: 'opt_c', sort_order: 3 },
        ];

        for (const opt of options) {
            await db.execute(
                'INSERT INTO module_section_field_options (field_id, option_label, option_value, sort_order, created_at) VALUES (?, ?, ?, ?, NOW())',
                [fieldId, opt.label, opt.value, opt.sort_order]
            );
        }

        console.log('Successfully inserted 3 demo options.');
        process.exit(0);

    } catch (err) {
        console.error('Error seeding options:', err);
        process.exit(1);
    }
}

seedOptions();
