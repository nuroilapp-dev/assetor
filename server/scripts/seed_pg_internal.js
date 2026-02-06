const db = require('../config/db');
const bcrypt = require('bcryptjs');

async function seed() {
    try {
        console.log('Seeding initial data to PostgreSQL...');

        // 1. Insert Companies
        console.log('Inserting Company...');
        await db.execute("INSERT INTO companies (name, subdomain) VALUES ('TRakio Headquarters', 'admin') ON CONFLICT DO NOTHING");

        // 2. Insert Master Modules
        console.log('Inserting Master Modules...');
        const modules = [
            ['dashboard', 'Dashboard', 'Overview', 'dashboard'],
            ['assets', 'Asset Management', 'Track assets', 'inventory'],
            ['premises', 'Premises Management', 'Manage buildings', 'business'],
            ['employees', 'Employee Directory', 'Staff list', 'people']
        ];

        for (const m of modules) {
            await db.execute("INSERT INTO modules_master (module_key, name, description, icon) VALUES (?, ?, ?, ?) ON CONFLICT DO NOTHING", m);
            await db.execute("INSERT INTO module_master (module_name) VALUES (?)", [m[1]]);
        }

        // 3. Insert Admin User
        console.log('Inserting Admin User...');
        const hashedPassword = await bcrypt.hash('admin123', 10);
        await db.execute(
            "INSERT INTO users (company_id, name, email, password, role, status) VALUES (1, 'TRakio Admin', 'admin@trakio.com', ?, 'COMPANY_ADMIN', 'ACTIVE') ON CONFLICT DO NOTHING",
            [hashedPassword]
        );

        // 4. Enable Modules
        console.log('Enabling Modules for Company 1...');
        await db.execute("INSERT INTO company_modules (company_id, module_id, is_enabled) VALUES (1, 1, true) ON CONFLICT DO NOTHING");
        await db.execute("INSERT INTO company_modules (company_id, module_id, is_enabled) VALUES (1, 2, true) ON CONFLICT DO NOTHING");

        // 5. Insert Countries
        console.log('Inserting Countries...');
        await db.execute("INSERT INTO countries (country_name) VALUES ('UAE') ON CONFLICT DO NOTHING");
        await db.execute("INSERT INTO countries (country_name) VALUES ('India') ON CONFLICT DO NOTHING");

        console.log('PostgreSQL Seeding Completed Successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Seeding Failed:', error.message);
        console.error(error);
        process.exit(1);
    }
}

seed();
