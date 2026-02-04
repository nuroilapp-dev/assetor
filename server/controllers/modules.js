const db = require('../config/db');

// --- Module Master (Global Catalog) ---
/**
 * GET /api/module-master
 * Returns list of available modules from module_master for dropdown
 * Response: { success: true, data: [ { module_id, module_name } ] }
 */
exports.getMasterModules = async (req, res) => {
    try {
        console.log('[GetMasterModules] Fetching available catalog...');
        const query = 'SELECT module_id, module_name FROM module_master WHERE is_active = 1 ORDER BY module_name ASC';
        const [rows] = await db.execute(query);

        console.log(`[GetMasterModules] Found ${rows.length} modules.`);
        res.json({ success: true, data: rows });
    } catch (error) {
        console.error('[GetMasterModules] Error:', error.message);
        res.status(500).json({ success: false, message: 'Failed to fetch module master catalog' });
    }
};

// --- Company Modules (Tenant Logic) ---
/**
 * GET /api/company-modules
 * Returns modules enabled for the logged-in company
 */
exports.listCompanyModules = async (req, res) => {
    try {
        const companyId = req.user?.company_id || req.companyId;
        if (!companyId) {
            console.error('[ListCompanyModules] Company context missing');
            return res.status(403).json({ success: false, message: 'Forbidden: missing company context' });
        }

        const query = `
            SELECT cm.id, mm.module_name as name, cm.is_enabled as status, cm.created_at, mm.module_id as master_id 
            FROM company_modules cm 
            JOIN module_master mm ON cm.module_id = mm.module_id 
            WHERE cm.company_id = ? 
            ORDER BY cm.created_at DESC
        `;

        const [rows] = await db.execute(query, [companyId]);
        const mapped = rows.map(r => ({
            ...r,
            status: r.status ? 'ACTIVE' : 'INACTIVE'
        }));

        res.json({ success: true, data: mapped });
    } catch (error) {
        console.error('[ListCompanyModules] Error:', error.message);
        res.status(500).json({ success: false, message: 'Failed to fetch company modules' });
    }
};

/**
 * POST /api/company-modules
 * Enable a module for the current company
 */
exports.enableCompanyModule = async (req, res) => {
    // Body: { module_id: "number", is_active: "boolean" }
    const { module_id, is_active } = req.body;
    const companyId = req.user?.company_id || req.companyId;

    console.log(`[EnableCompanyModule] Attempting to enable Module ID: ${module_id} for Company: ${companyId}`);

    if (!module_id) {
        return res.status(400).json({ success: false, message: 'Module selection is required' });
    }

    if (!companyId) {
        return res.status(403).json({
            success: false,
            message: 'Forbidden: Company context missing. If you are SUPER_ADMIN, please select a company first.'
        });
    }

    // Role check message as requested
    if (req.user?.role !== 'COMPANY_ADMIN' && req.user?.role !== 'SUPER_ADMIN') {
        return res.status(403).json({ success: false, message: 'Forbidden: missing permission MODULES_WRITE' });
    }

    try {
        // 1. Check if module exists in module_master
        const [master] = await db.execute('SELECT module_id FROM module_master WHERE module_id=? AND is_active=1', [module_id]);
        if (master.length === 0) {
            return res.status(404).json({ success: false, message: 'Selected module is invalid or inactive in the master catalog' });
        }

        // 2. Prevent exact duplicate configurations (base mapping)
        const [existing] = await db.execute(
            'SELECT id FROM company_modules WHERE company_id = ? AND module_id = ? AND country_id IS NULL AND premises_type_id IS NULL AND area_id IS NULL LIMIT 1',
            [companyId, module_id]
        );

        if (existing.length > 0) {
            return res.status(409).json({ success: false, message: 'Module is already enabled without filters' });
        }

        // 3. Insert
        const enabled = (is_active === true || is_active === undefined) ? 1 : 0;
        await db.execute(
            'INSERT INTO company_modules (company_id, module_id, is_enabled, created_at) VALUES (?, ?, ?, NOW())',
            [companyId, parseInt(module_id), enabled]
        );

        res.status(201).json({
            success: true,
            message: 'Module enabled successfully',
            data: { module_id: module_id } // Return for potential navigation
        });
    } catch (error) {
        console.error('[EnableCompanyModule] Error:', error.message);
        res.status(500).json({ success: false, message: 'Failed to enable module. Internal server error.' });
    }
};

/**
 * PUT /api/company-modules/:id
 * Update status (is_active) of a company-module mapping
 */
exports.updateCompanyModule = async (req, res) => {
    const { id } = req.params;
    const { is_active, status } = req.body; // Support both names for flexibility
    const companyId = req.user?.company_id || req.companyId;

    try {
        // Determine isActive status from either 'is_active' (boolean) or 'status' (string)
        let isActive = 1;
        if (is_active !== undefined) {
            isActive = is_active ? 1 : 0;
        } else if (status !== undefined) {
            isActive = (status === 'ACTIVE' || status === 'active') ? 1 : 0;
        }

        console.log(`[UpdateCompanyModule] ID: ${id}, Company: ${companyId}, New State: ${isActive}`);

        const [result] = await db.execute(
            'UPDATE company_modules SET is_enabled = ?, updated_at = NOW() WHERE id = ? AND company_id = ?',
            [isActive, id, companyId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Module assignment not found for this company' });
        }

        res.json({ success: true, message: 'Module status updated successfully' });
    } catch (error) {
        console.error('[UpdateCompanyModule] Error:', error.message);
        res.status(500).json({ success: false, message: 'Failed to update module status.' });
    }
};

/**
 * DELETE /api/company-modules/:id
 * Remove a company-module mapping
 */
exports.deleteCompanyModule = async (req, res) => {
    const { id } = req.params;
    const companyId = req.user?.company_id || req.companyId;

    try {
        console.log(`[DeleteCompanyModule] ID: ${id}, Company: ${companyId}`);
        const [result] = await db.execute(
            'DELETE FROM company_modules WHERE id = ? AND company_id = ?',
            [id, companyId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Module assignment not found for this company' });
        }

        res.json({ success: true, message: 'Module removed successfully from your company catalog' });
    } catch (error) {
        console.error('[DeleteCompanyModule] Error:', error.message);
        res.status(500).json({ success: false, message: 'Failed to remove module mapping.' });
    }
};

