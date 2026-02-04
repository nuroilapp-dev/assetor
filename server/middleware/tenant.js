const db = require('../config/db');

const tenantScope = async (req, res, next) => {
    // Super admins can access any company data if they provide a company_id in query or body
    // Otherwise, they default to no company_id (platform level) or specific context

    if (req.user.role === 'SUPER_ADMIN') {
        req.companyId = req.query.company_id || req.body.company_id || null;
        return next();
    }

    // For COMPANY_ADMIN and EMPLOYEE, enforce their own company_id
    if (!req.user.company_id) {
        // Robustness: Try to fetch from DB if missing in token
        console.warn(`[TenantScope] company_id missing in token for user ${req.user.id}. Fetching from DB...`);
        try {
            const [u] = await db.execute('SELECT company_id FROM users WHERE id = ?', [req.user.id]);
            if (u.length > 0 && u[0].company_id) {
                req.user.company_id = u[0].company_id; // Update req.user for subsequent middlewares/controllers
                console.log(`[TenantScope] Recovered company_id ${req.user.company_id} from DB.`);
            } else {
                console.error('[TenantScope] 403. User has no company_id in DB.');
                return res.status(403).json({ success: false, message: 'Company context missing for user.' });
            }
        } catch (error) {
            console.error('[TenantScope] DB Error:', error);
            return res.status(500).json({ success: false, message: 'Internal Server Error during tenant check' });
        }
    }

    if (!req.user.company_id) {
        console.error('[TenantScope] 403. Still no company_id.');
        return res.status(403).json({ success: false, message: 'Company context missing for user.' });
    }

    console.log(`[TenantScope] Access Granted. Company: ${req.user.company_id}`);
    req.companyId = req.user.company_id;
    next();
};

module.exports = tenantScope;
