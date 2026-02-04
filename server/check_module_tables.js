const db = require('./config/db');

async function checkTables() {
    try {
        console.log('\n=== Checking Module-Related Tables ===\n');

        const [tables] = await db.execute("SHOW TABLES LIKE 'module%'");

        console.log('Found tables:');
        tables.forEach((row, idx) => {
            const tableName = Object.values(row)[0];
            console.log(`${idx + 1}. ${tableName}`);
        });

        console.log('\n=== Checking module_sections table ===');
        try {
            const [sections] = await db.execute('SELECT * FROM module_sections LIMIT 5');
            console.log(`✓ module_sections exists with ${sections.length} sample rows`);
            if (sections.length > 0) {
                console.log('Sample:', sections[0]);
            }
        } catch (e) {
            console.log('✗ module_sections does NOT exist');
        }

        console.log('\n=== Checking module_section_fields table ===');
        try {
            const [fields] = await db.execute('SELECT * FROM module_section_fields LIMIT 5');
            console.log(`✓ module_section_fields exists with ${fields.length} sample rows`);
            if (fields.length > 0) {
                console.log('Sample:', fields[0]);
            }
        } catch (e) {
            console.log('✗ module_section_fields does NOT exist');
        }

        console.log('\n=== Checking module_section_field_options table ===');
        try {
            const [options] = await db.execute('SELECT * FROM module_section_field_options LIMIT 5');
            console.log(`✓ module_section_field_options exists with ${options.length} sample rows`);
            if (options.length > 0) {
                console.log('Sample:', options[0]);
            }
        } catch (e) {
            console.log('✗ module_section_field_options does NOT exist');
        }

        process.exit(0);
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

checkTables();
