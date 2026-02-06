const db = require('../config/db');

const addToEmployees = async () => {
    try {
        console.log('=== Adding testAsset@gmail.com to employees table ===\n');

        // First, check if already exists
        const [existing] = await db.execute(
            "SELECT id, name, email FROM employees WHERE LOWER(email) = LOWER('testAsset@gmail.com')"
        );

        if (existing.length > 0) {
            console.log('✅ Employee already exists:');
            console.log(JSON.stringify(existing[0], null, 2));
            process.exit();
            return;
        }

        // Get the user's company_id
        const [users] = await db.execute(
            "SELECT company_id, name FROM users WHERE LOWER(email) = LOWER('testAsset@gmail.com')"
        );

        if (users.length === 0) {
            console.log('❌ User not found in users table!');
            process.exit();
            return;
        }

        const user = users[0];
        console.log(`Found user: ${user.name}, Company ID: ${user.company_id}`);

        // Check if there's a department we can assign to
        const [departments] = await db.execute(
            "SELECT id, name FROM departments WHERE company_id = $1 LIMIT 1",
            [user.company_id]
        );

        const departmentId = departments.length > 0 ? departments[0].id : null;

        if (departmentId) {
            console.log(`Assigning to department: ${departments[0].name} (ID: ${departmentId})`);
        } else {
            console.log('No department found, creating without department');
        }

        // Insert into employees table
        const [result] = await db.execute(
            `INSERT INTO employees (company_id, department_id, name, email, employee_id_card, position, status) 
             VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [
                user.company_id,
                departmentId,
                'Test Asset Admin',
                'testAsset@gmail.com',
                'EMP-TEST001',
                'Company Administrator',
                'ACTIVE'
            ]
        );

        console.log('\n✅ Employee record created successfully!');

        // Verify
        const [newEmployee] = await db.execute(
            "SELECT id, name, email, employee_id_card, position, company_id FROM employees WHERE LOWER(email) = LOWER('testAsset@gmail.com')"
        );

        console.log('\n=== Employee Record ===');
        console.log(JSON.stringify(newEmployee[0], null, 2));

        console.log('\n✅ testAsset@gmail.com will now appear in the Staff list!');

    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error(error);
    } finally {
        process.exit();
    }
};

addToEmployees();
