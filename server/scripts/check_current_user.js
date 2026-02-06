const db = require('../config/db');

const checkUser = async () => {
    try {
        console.log('=== Checking testAsset@gmail.com ===\n');

        // Check in users table
        const [users] = await db.execute(
            "SELECT id, company_id, name, email, role, status FROM users WHERE LOWER(email) = LOWER('testAsset@gmail.com')"
        );

        if (users.length > 0) {
            console.log('✅ Found in USERS table:');
            console.log(JSON.stringify(users[0], null, 2));
            console.log('');
        } else {
            console.log('❌ NOT found in users table\n');
        }

        // Check in employees table
        const [employees] = await db.execute(
            "SELECT id, company_id, department_id, name, email, employee_id_card, position FROM employees WHERE LOWER(email) = LOWER('testAsset@gmail.com')"
        );

        if (employees.length > 0) {
            console.log('✅ Found in EMPLOYEES table:');
            console.log(JSON.stringify(employees[0], null, 2));
        } else {
            console.log('❌ NOT found in employees table');
            console.log('   (This is why you don\'t see yourself in the Staff list)\n');
        }

        // Show all users
        console.log('=== All Users ===');
        const [allUsers] = await db.execute(
            "SELECT id, name, email, role, company_id FROM users ORDER BY id"
        );
        allUsers.forEach(u => {
            console.log(`${u.id}. ${u.name} - ${u.email} - ${u.role} (Company: ${u.company_id || 'N/A'})`);
        });

        console.log('\n=== All Employees ===');
        const [allEmployees] = await db.execute(
            "SELECT id, name, email, company_id FROM employees ORDER BY id"
        );
        if (allEmployees.length > 0) {
            allEmployees.forEach(e => {
                console.log(`${e.id}. ${e.name} - ${e.email} (Company: ${e.company_id})`);
            });
        } else {
            console.log('No employees in the database');
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        process.exit();
    }
};

checkUser();
