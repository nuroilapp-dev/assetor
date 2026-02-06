require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'software_db'
});

(async () => {
    try {
        const modulesRes = await pool.query('SELECT * FROM module_master ORDER BY module_id');
        console.log('\n=== Module Master ===');
        console.log(JSON.stringify(modulesRes.rows, null, 2));

        const companyModulesRes = await pool.query('SELECT cm.*, mm.module_name FROM company_modules cm LEFT JOIN module_master mm ON cm.module_id = mm.module_id WHERE cm.company_id = 4');
        console.log('\n=== Company 4 Modules ===');
        console.log(JSON.stringify(companyModulesRes.rows, null, 2));

        await pool.end();
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        await pool.end();
        process.exit(1);
    }
})();
