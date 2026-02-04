const db = require('../config/db');

const requireModuleEnabled = (moduleKey) => {
    return async (req, res, next) => {
        // Super admins can access everything
        if (req.user.role === 'SUPER_ADMIN') {
            return next();
        }

        const companyId = req.companyId;
        if (!companyId) {
            return res.status(403).json({ success: false, message: 'Module access requires company context.' });
        }

        try {
            const [rows] = await db.execute(`
                SELECT cm.is_enabled 
                FROM company_modules cm
                JOIN modules_master mm ON cm.module_id = mm.id
                WHERE cm.company_id = ? AND mm.module_key = ?
            `, [companyId, moduleKey]);

            if (rows.length > 0 && rows[0].is_enabled) {
                next();
            } else {
                res.status(403).json({
                    success: false,
                    message: `Module '${moduleKey}' is not enabled for this company.`
                });
            }
        } catch (error) {
            console.error('Module check error:', error);
            res.status(500).json({ success: false, message: 'Server error checking module status.' });
        }
    };
};

module.exports = requireModuleEnabled;
