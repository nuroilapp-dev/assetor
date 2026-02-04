const db = require('./config/db');
async function run() {
    try {
        const [r] = await db.execute("DESCRIBE module_section_fields");
        console.log('Fields columns:', r.map(c => c.Field));
    } catch (e) {
        console.error(e);
    }
    process.exit(0);
}
run();
