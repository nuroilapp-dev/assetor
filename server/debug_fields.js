const mysql = require('mysql2/promise');
require('dotenv').config();

async function run() {
    const pool = mysql.createPool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });

    try {
        const [rows] = await pool.execute(`
            SELECT f.field_key, f.label, s.name as section_name 
            FROM module_section_fields f 
            JOIN module_sections s ON f.section_id = s.id 
            WHERE s.module_id = 1
        `);
        console.log("FIELDS FOR MODULE 1:");
        rows.forEach(r => {
            console.log(`[${r.section_name}] ${r.label} => ${r.field_key}`);
        });
    } catch (e) {
        console.error(e);
    } finally {
        process.exit();
    }
}

run();
