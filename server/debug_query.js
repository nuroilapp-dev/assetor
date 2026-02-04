const db = require('./config/db');
const fs = require('fs');
async function run() {
    let output = '';
    try {
        const query = `
            SELECT 
                mm.*,
                MAX(cm.id) as mapping_id,
                MAX(cm.country_id) as country_id,
                MAX(cm.premises_type_id) as premises_type_id,
                MAX(cm.area_id) as area_id,
                MAX(cm.status_id) as status_id,
                MAX(c.country_name) as country,
                MAX(pt.type_name) as premises_type,
                MAX(a.name) as section_area,
                MAX(cm.is_enabled) as is_enabled,
                (SELECT COUNT(*) FROM module_sections ms WHERE ms.module_id = mm.module_id AND ms.company_id = 1) as section_count,
                (SELECT COUNT(*) FROM module_section_fields mf WHERE mf.module_id = mm.module_id AND mf.company_id = 1) as field_count,
                (SELECT GROUP_CONCAT(name SEPARATOR ', ') FROM module_sections ms WHERE ms.module_id = mm.module_id AND ms.company_id = 1) as section_names
            FROM module_master mm
            LEFT JOIN company_modules cm ON mm.module_id = cm.module_id AND cm.company_id = 1
            LEFT JOIN countries c ON c.id = cm.country_id
            LEFT JOIN premises_types pt ON pt.id = cm.premises_type_id
            LEFT JOIN area a ON a.id = cm.area_id
            WHERE mm.is_active = 1 
            GROUP BY mm.module_id, mm.module_name, mm.module_key, mm.description, mm.icon, mm.is_active, mm.created_at
            ORDER BY mm.module_name
        `;
        const [rows] = await db.execute(query);
        output = 'SUCCESS: ' + rows.length;
    } catch (e) {
        output = 'FAILED: ' + e.message;
    }
    fs.writeFileSync('debug_output.txt', output);
    process.exit(0);
}
run();
