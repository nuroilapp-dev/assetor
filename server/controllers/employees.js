const db = require('../config/db');
const { checkClientLimit, checkCompanyLimit } = require('../utils/limitChecker');

exports.getEmployees = async (req, res) => {
    const { company_id } = req.query;
    try {
        let sql = `
            SELECT e.*, c.name as company_name 
            FROM employees e
            JOIN companies c ON e.company_id = c.id
        `;
        let params = [];
        let conditions = [];

        // 1. Specific company filter
        if (company_id) {
            conditions.push('e.company_id = ?');
            params.push(company_id);
        }

        // 2. Client group fallback for COMPANY_ADMINs
        if (!company_id && req.user?.role !== 'SUPER_ADMIN') {
            const userCompanyId = req.user?.company_id;
            if (userCompanyId) {
                // Find context: is this company part of a client group?
                const [comp] = await db.execute('SELECT client_id FROM companies WHERE id = ?', [userCompanyId]);
                if (comp.length > 0 && comp[0].client_id) {
                    conditions.push('e.company_id IN (SELECT id FROM companies WHERE client_id = ?)');
                    params.push(comp[0].client_id);
                } else {
                    // Just this company
                    conditions.push('e.company_id = ?');
                    params.push(userCompanyId);
                }
            }
        }

        if (conditions.length > 0) {
            sql += ' WHERE ' + conditions.join(' AND ');
        }

        sql += ' ORDER BY e.id DESC';

        const [rows] = await db.execute(sql, params);
        res.json({ success: true, data: rows });
    } catch (error) {
        console.error('[getEmployees] Error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.createEmployee = async (req, res) => {
    const { name, email, role, company_id, department_id, employee_id_card, position, phone, password, auto_generate_password } = req.body;

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        // Enforce limits and privileges
        const [companyRows] = await connection.execute('SELECT client_id, can_add_employee FROM companies WHERE id = ?', [company_id]);
        if (companyRows.length === 0) {
            await connection.rollback();
            return res.status(404).json({ success: false, message: 'Company not found' });
        }

        const company = companyRows[0];

        // 1. Check Privilege
        if (company.can_add_employee === false) {
            await connection.rollback();
            return res.status(403).json({
                success: false,
                message: 'PRIVILEGE_DENIED',
                detail: 'This company does not have the privilege to add employees. Please contact your administrator.'
            });
        }

        // 2. Check Client Limit
        if (company.client_id) {
            const clientLimitStatus = await checkClientLimit(company.client_id, 'employees');
            if (clientLimitStatus.exceeded) {
                await connection.rollback();
                return res.status(400).json({
                    success: false,
                    message: 'LIMIT_EXCEEDED',
                    detail: `Total employee limit for this client reached (${clientLimitStatus.limit})`
                });
            }
        }

        // 3. Check Company Limit
        const companyLimitStatus = await checkCompanyLimit(company_id, 'employees');
        if (companyLimitStatus.exceeded) {
            await connection.rollback();
            return res.status(400).json({
                success: false,
                message: 'LIMIT_EXCEEDED',
                detail: `Employee limit for this company reached (${companyLimitStatus.limit})`
            });
        }

        // 4. Create Employee Record
        const [empRows] = await connection.execute(
            'INSERT INTO employees (company_id, name, email, department_id, employee_id_card, position, phone) VALUES (?, ?, ?, ?, ?, ?, ?) RETURNING id',
            [company_id, name, email, department_id, employee_id_card, position, phone]
        );
        const employeeId = empRows[0].id;

        // 5. Create User Account with Login Credentials
        if (email) {
            const bcrypt = require('bcryptjs');
            let finalPassword;

            if (auto_generate_password) {
                // Generate random 8-character password
                const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%';
                finalPassword = Array.from({ length: 8 }, () => charset[Math.floor(Math.random() * charset.length)]).join('');
            } else {
                finalPassword = password || 'employee123'; // Fallback password
            }

            const hashedPassword = await bcrypt.hash(finalPassword, 10);

            await connection.execute(
                'INSERT INTO users (name, email, password, role, company_id, client_id, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [name, email, hashedPassword, 'EMPLOYEE', company_id, company.client_id || null, 'ACTIVE']
            );

            console.log(`[Employee Created] User account created for ${email} with ${auto_generate_password ? 'auto-generated' : 'manual'} password`);
            // TODO: Send email with credentials to the employee
        }

        await connection.commit();
        res.status(201).json({ success: true, data: { id: employeeId, ...req.body } });
    } catch (error) {
        await connection.rollback();
        console.error('[createEmployee] Error:', error);
        res.status(500).json({ success: false, message: error.message });
    } finally {
        connection.release();
    }
};

exports.updateEmployee = async (req, res) => {
    const { id } = req.params;
    const { name, email, department_id, employee_id_card, position, phone } = req.body;
    try {
        await db.execute(
            'UPDATE employees SET name=?, email=?, department_id=?, employee_id_card=?, position=?, phone=? WHERE id=?',
            [name, email, department_id, employee_id_card, position, phone, id]
        );
        res.json({ success: true, message: 'Employee updated successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.deleteEmployee = async (req, res) => {
    try {
        await db.execute('DELETE FROM employees WHERE id = ?', [req.params.id]);
        res.json({ success: true, message: 'Employee deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
