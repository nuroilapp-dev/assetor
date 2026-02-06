const db = require('../config/db');

/**
 * Checks if a client has reached its limits for companies, employees, or assets.
 * @param {number} clientId - The ID of the client
 * @param {string} type - 'companies', 'employees', or 'assets'
 * @returns {Promise<{exceeded: boolean, limit?: number, current?: number}>}
 */
const checkClientLimit = async (clientId, type) => {
    if (!clientId) return { exceeded: false };

    try {
        const [client] = await db.execute('SELECT max_companies, max_employees, max_assets FROM clients WHERE id = ?', [clientId]);
        if (client.length === 0) return { exceeded: false };

        let currentCount = 0;
        let limit = 0;

        if (type === 'companies') {
            const [rows] = await db.execute('SELECT COUNT(*) as count FROM companies WHERE client_id = ?', [clientId]);
            currentCount = parseInt(rows[0].count);
            limit = client[0].max_companies;
        } else if (type === 'employees') {
            const [rows] = await db.execute('SELECT COUNT(*) as count FROM employees e JOIN companies c ON e.company_id = c.id WHERE c.client_id = ?', [clientId]);
            currentCount = parseInt(rows[0].count);
            limit = client[0].max_employees;
        } else if (type === 'assets') {
            const [rows] = await db.execute('SELECT COUNT(*) as count FROM assets a JOIN companies c ON a.company_id = c.id WHERE c.client_id = ?', [clientId]);
            currentCount = parseInt(rows[0].count);
            limit = client[0].max_assets;
        }

        return {
            exceeded: currentCount >= limit,
            limit,
            current: currentCount
        };
    } catch (error) {
        console.error('Limit check error:', error);
        return { exceeded: false };
    }
};

/**
 * Checks if a company has reached its limits for employees or assets.
 * @param {number} companyId - The ID of the company
 * @param {string} type - 'employees' or 'assets'
 * @returns {Promise<{exceeded: boolean, limit?: number, current?: number}>}
 */
const checkCompanyLimit = async (companyId, type) => {
    if (!companyId) return { exceeded: false };

    try {
        const [company] = await db.execute('SELECT max_employees, max_assets FROM companies WHERE id = ?', [companyId]);
        if (company.length === 0) return { exceeded: false };

        let currentCount = 0;
        let limit = 0;

        if (type === 'employees') {
            const [rows] = await db.execute('SELECT COUNT(*) as count FROM employees WHERE company_id = ?', [companyId]);
            currentCount = parseInt(rows[0].count);
            limit = company[0].max_employees;
        } else if (type === 'assets') {
            const [rows] = await db.execute('SELECT COUNT(*) as count FROM assets WHERE company_id = ?', [companyId]);
            currentCount = parseInt(rows[0].count);
            limit = company[0].max_assets;
        }

        return {
            exceeded: currentCount >= limit,
            limit,
            current: currentCount
        };
    } catch (error) {
        console.error('Company limit check error:', error);
        return { exceeded: false };
    }
};

module.exports = { checkClientLimit, checkCompanyLimit };
