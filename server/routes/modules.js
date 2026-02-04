const express = require('express');
const router = express.Router();
const moduleController = require('../controllers/modules');
const { authMiddleware, requireRole } = require('../middleware/auth');
const tenantScope = require('../middleware/tenant');

// Sub-path: /api/module-master
router.get('/module-master', authMiddleware, requireRole(['SUPER_ADMIN', 'COMPANY_ADMIN']), (req, res, next) => {
    console.log('[DEBUG] GET /api/module-master hit');
    next();
}, moduleController.getMasterModules);

// Sub-path: /api/company-modules
router.get('/company-modules', authMiddleware, tenantScope, (req, res, next) => {
    console.log('[DEBUG] GET /api/company-modules hit');
    next();
}, moduleController.listCompanyModules);

router.post('/company-modules', authMiddleware, tenantScope, requireRole(['SUPER_ADMIN', 'COMPANY_ADMIN']), (req, res, next) => {
    console.log('[DEBUG] POST /api/company-modules hit');
    next();
}, moduleController.enableCompanyModule);
router.put('/company-modules/:id', authMiddleware, tenantScope, requireRole(['SUPER_ADMIN', 'COMPANY_ADMIN']), moduleController.updateCompanyModule);
router.delete('/company-modules/:id', authMiddleware, tenantScope, requireRole(['SUPER_ADMIN', 'COMPANY_ADMIN']), moduleController.deleteCompanyModule);

module.exports = router;
